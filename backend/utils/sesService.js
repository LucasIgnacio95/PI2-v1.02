let SESClient, SendEmailCommand, VerifyEmailIdentityCommand, DeleteIdentityCommand;
let sesClient = null;

try {
    const sesSdk = require("@aws-sdk/client-ses");
    SESClient = sesSdk.SESClient;
    SendEmailCommand = sesSdk.SendEmailCommand;
    VerifyEmailIdentityCommand = sesSdk.VerifyEmailIdentityCommand;
    DeleteIdentityCommand = sesSdk.DeleteIdentityCommand;
    sesClient = new SESClient({ region: process.env.AWS_REGION || "us-east-2" });
} catch (e) {
    console.log("[SES] AWS SDK (@aws-sdk/client-ses) não instalado. Modo fallback ativado.");
}

async function enviarEmail2FA(destinatario, codigo) {
    const remetente = "prontuarioescolar19@gmail.com";
    console.log(`[DEV FALLBACK] Código 2FA para ${destinatario}: ${codigo}`);

    if (!sesClient || !SendEmailCommand) {
        return false;
    }

    const params = {
        Source: remetente,
        Destination: {
            ToAddresses: [destinatario],
        },
        Message: {
            Subject: {
                Data: "Código de Verificação 2FA - Prontuário Escolar",
            },
            Body: {
                Text: {
                    Data: `Olá!\n\nSeu código de verificação de duplo fator (2FA) para acesso ao sistema Prontuário Escolar é: ${codigo}\n\nEste código expira em 5 minutos.\n\nSe você não solicitou este código, ignore esta mensagem.`,
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail via Amazon SES:", error);
        return false;
    }
}

async function enviarEmailBoasVindas(destinatario, nome, senhaTemp, tentativa = 1) {
    const remetente = "prontuarioescolar19@gmail.com";

    if (!sesClient || !SendEmailCommand) {
        console.log(`[DEV FALLBACK] E-mail de boas-vindas para ${destinatario} (${nome})`);
        return false;
    }

    // Na primeira tentativa, solicita a verificação de identidade
    if (tentativa === 1 && VerifyEmailIdentityCommand) {
        try {
            const verifyCommand = new VerifyEmailIdentityCommand({ EmailAddress: destinatario });
            await sesClient.send(verifyCommand);
            console.log(`[SES] Solicitação de verificação automática enviada pela AWS para ${destinatario}`);
        } catch (verifyErr) {
            console.log(`[SES] Nota de verificação de identidade:`, verifyErr.message);
        }
    }

    const params = {
        Source: remetente,
        Destination: {
            ToAddresses: [destinatario],
        },
        Message: {
            Subject: {
                Data: "Bem-vindo ao Prontuário Escolar - Conta Criada",
            },
            Body: {
                Text: {
                    Data: `Olá, ${nome}!\n\nSua conta no sistema Prontuário Escolar foi criada com sucesso.\n\nSeu e-mail de acesso é: ${destinatario}\nSua senha temporária é: ${senhaTemp}\n\nAcesse o sistema para começar.`,
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
        console.log(`[SES] E-mail de boas-vindas enviado com sucesso para ${destinatario}`);
        return true;
    } catch (error) {
        if ((error.name === 'MessageRejected' || error.Code === 'MessageRejected' || (error.message && error.message.includes('not verified'))) && tentativa <= 10) {
            console.log(`[SES] E-mail de boas-vindas pendente (tentativa ${tentativa}/10) para ${destinatario}. Tentando novamente em 1 minuto...`);
            setTimeout(() => {
                enviarEmailBoasVindas(destinatario, nome, senhaTemp, tentativa + 1);
            }, 60000); // 1 minuto
        } else {
            console.error("Erro ao enviar e-mail de boas-vindas via Amazon SES:", error);
        }
        return false;
    }
}

async function removerIdentidadeSES(destinatario) {
    if (!sesClient || !DeleteIdentityCommand) {
        console.log(`[DEV FALLBACK] Remover identidade SES para ${destinatario}`);
        return false;
    }

    try {
        const deleteCommand = new DeleteIdentityCommand({ Identity: destinatario });
        await sesClient.send(deleteCommand);
        console.log(`[SES] Identidade ${destinatario} removida com sucesso.`);
        return true;
    } catch (error) {
        console.error(`Erro ao remover identidade ${destinatario} do AWS SES:`, error);
        return false;
    }
}

module.exports = {
    enviarEmail2FA,
    enviarEmailBoasVindas,
    removerIdentidadeSES
};
