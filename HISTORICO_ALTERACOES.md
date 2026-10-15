# Histórico de Alterações

## Atualização - 15 de Outubro de 2026 (Atualização da Documentação do Banco de Dados no README)
- **Ficheiro modificado:** `README.md`
- **Descrição:** Atualizada a secção de criação de tabelas no `README.md`, adicionando o script SQL para a criação da tabela `avisos` e removendo os scripts obsoletos das tabelas de ocorrências e rotinas.

## Atualização - 15 de Outubro de 2026 (Implementação da View de Logs do Sistema com Restrição para Administradores)
- **Ficheiros criados:** `backend/routes/logRoutes.js`, `frontend/listaLogs.html`
- **Ficheiros modificados:** `backend/server.js`, `frontend/script.js`, Todos os ficheiros HTML de navegação (`dashboard.html`, `listaUsuarios.html`, `listaAlunos.html`, `chatAluno.html`, `listaAvisos.html`, `cadastrarAluno.html`, `cadastrarAviso.html`, `cadastrarUsuario.html`, `editarAluno.html`, `editarUsuario.html`, `historicoAluno.html`, `registrarEventos.html`)
- **Descrição:** Implementada a view de auditoria do sistema (`/logs`) para listar todos os registos da tabela `logs_auditoria` com detalhes de data/hora, usuário, ação, registro afetado e IP. Adicionado o link de acesso no menu lateral logo abaixo de "Avisos" em todas as páginas do sistema. Protegida a rota e a interface para permitir acesso exclusivo a utilizadores com perfil de Administrador (`admin` ou `administrador`), redirecionando não administradores para a página de acesso negado.

## Atualização - 13 de Outubro de 2026 (Rotas Limpas e Obfuscadas no Servidor Express)
- **Ficheiros modificados:** `backend/server.js`, `frontend/script.js`, Todos os ficheiros HTML do frontend
- **Descrição:** Removido o acesso direto a ficheiros `.html` estáticos desprotegidos. O servidor Express (`server.js`) passou a mapear rotas limpas e encriptadas/obfuscadas para cada secção do sistema (ex: `/avisos`, `/alunos`, `/usuarios`, `/dashboard`, `/chat`, e rotas customizadas como `/aquicriptografa`), ocultando completamente a estrutura de ficheiros `.html` da URL e atualizando todas as navegações do frontend.

## Atualização - 13 de Outubro de 2026 (Limpeza de Sessão no Logout e Validação Estrita de Autenticação)
- **Ficheiros modificados:** `frontend/script.js`, Todos os ficheiros HTML do frontend
- **Descrição:** Implementada a função `fazerLogout(event)` que limpa completamente o `localStorage` e redireciona para a página de login (`index.html`) ao clicar em "Sair". Adicionada validação estrita na função `verificarAutenticacao()`, garantindo que sessões inválidas ou ausentes impeçam o acesso direto por URL a partir de qualquer máquina.

## Atualização - 13 de Outubro de 2026 (Proteção de Autenticação Global contra Acesso Direto sem Login)
- **Ficheiro modificado:** `frontend/script.js`
- **Descrição:** Implementada a função `verificarAutenticacao()` executada no `window.onload` de todas as páginas protegidas, que verifica a presença de sessão ativa (`localStorage.getItem("user")`). Caso um utilizador (de qualquer máquina) tente aceder diretamente a páginas internas por URL sem autenticação, é imediatamente redirecionado para a página de login (`index.html`).

## Atualização - 13 de Outubro de 2026 (Registo de Auditoria Abrangente em Todos os Módulos)
- **Ficheiros modificados:** `backend/routes/avisoRoutes.js`, `backend/routes/alunoRoutes.js`, `backend/routes/ocorrenciaRoutes.js`, `backend/routes/rotinaRoutes.js`, `backend/routes/userRoutes.js`
- **Descrição:** Integrada a função `registrarLog` em todas as rotas de criação (adição), atualização (edição) e exclusão de todos os módulos do sistema (Avisos, Alunos, Ocorrências, Rotinas e Utilizadores), garantindo que ações como a exclusão de avisos ou edição de utilizadores fiquem devidamente gravadas na tabela de auditoria `logs_auditoria`.

## Atualização - 13 de Outubro de 2026 (Exibição do Nome/Usuário Logado no Topo de Todas as Páginas)
- **Ficheiros modificados:** Todos os ficheiros HTML do frontend (`cadastrarAluno.html`, `cadastrarAviso.html`, `cadastrarUsuario.html`, `chatAluno.html`, `dashboard.html`, `editarAluno.html`, `editarUsuario.html`, `historicoAluno.html`, `listaAlunos.html`, `listaAvisos.html`, `listaEventos.html`, `listaUsuarios.html`, `registrarEventos.html`) e `frontend/script.js`.
- **Descrição:** Implementada a exibição dinâmica do nome/usuário atualmente logado e seu tipo (`#nomeUsuarioLogado`) ao lado do botão de chat na barra superior (`navbar`) de todas as páginas do sistema através da função `exibirNomeUsuarioLogado()` executada no carregamento (`window.onload`).

## Atualização - 13 de Outubro de 2026 (Criação Automática da Tabela 'avisos' no Banco de Dados)
- **Ficheiro modificado:** `backend/config/db.js`
- **Descrição:** Adicionada a instrução `CREATE TABLE IF NOT EXISTS avisos` na inicialização da conexão com o banco de dados em `db.js`, resolvendo o erro `Table 'prontuario_escolar.avisos' doesn't exist` ao tentar registar novos avisos no sistema.

## Atualização - 13 de Outubro de 2026 (Exibição e Edição do Nome de Usuário na Lista de Utilizadores)
- **Ficheiros modificados:** `frontend/listaUsuarios.html`, `frontend/script.js`
- **Descrição:** Adicionada a coluna de "Usuário" na tabela de listagem de utilizadores (`listaUsuarios.html`) e atualizada a função `carregarUsuarios()` em `script.js` para exibir o nome de usuário de cada registo, permitindo também visualizá-lo e alterá-lo na interface de edição (`editarUsuario.html`).

## Atualização - 13 de Outubro de 2026 (Envio de E-mail/Verificação SES Restrito a Administradores no Cadastro)
- **Ficheiro modificado:** `backend/routes/userRoutes.js`
- **Descrição:** Ajustada a rota de cadastro de utilizadores (`POST /api/users`) para verificar o perfil (`tipo`). O envio do e-mail de boas-vindas e a solicitação de verificação de identidade via Amazon SES (`enviarEmailBoasVindas`) foram restritos exclusivamente a novos utilizadores com perfil de Administrador (`admin` ou `administrador`).

## Atualização - 13 de Outubro de 2026 (Login por Nome de Usuário e Manutenção de E-mail para Cadastro e 2FA)
- **Ficheiros modificados:** `backend/config/db.js`, `backend/routes/userRoutes.js`, `frontend/index.html`, `frontend/cadastrarUsuario.html`, `frontend/editarUsuario.html`, `frontend/script.js`
- **Descrição:** Implementado o campo de login por nome de usuário (`usuario`) na tela de login (`index.html`) e no backend (`POST /api/users/login`), eliminando a necessidade de utilizar o e-mail para autenticação. O campo de e-mail foi mantido para o cadastro e atualização de utilizadores, sendo utilizado no envio de código OTP de duplo fator (2FA) exclusivamente para administradores.

## Atualização - 13 de Outubro de 2026 (Restrição de 2FA Apenas a Administradores)
- **Ficheiro modificado:** `backend/routes/userRoutes.js`
- **Descrição:** Modificada a rota de login (`POST /api/users/login`) para verificar o tipo do utilizador (`user.tipo`). A autenticação de dois fatores (2FA) e envio de código OTP por e-mail via Amazon SES foram restritos exclusivamente a utilizadores com perfil de Administrador (`admin` ou `administrador`). Demais perfis efetuam o login diretamente sem exigir código 2FA.

## Atualização - 10 de Outubro de 2026 (Consolidação do Window.Onload para Edição de Usuário)
- **Ficheiro modificado:** `frontend/script.js`
- **Descrição:** Consolidado o carregamento da página de edição (`editUserNome`) dentro do evento único `window.onload` no final de `script.js`, evitando conflitos de substituição de funções e garantindo que o parâmetro `?id=...` seja lido corretamente ao abrir a tela de edição.

## Atualização - 10 de Outubro de 2026 (Validação de ID na Edição de Usuário)
- **Ficheiro modificado:** `frontend/script.js`
- **Descrição:** Adicionada validação de `userId` na carga da página de edição e no salvamento (`buscarDadosDoUsuario` e `salvarEdicaoUsuario`), prevenindo chamadas à API sem ID (que resultavam em 404 Not Found) e redirecionando para a lista caso o ID esteja ausente.

## Atualização - 10 de Outubro de 2026 (Tratamento Seguro de Respostas JSON em Edição de Usuário)
- **Ficheiro modificado:** `frontend/script.js`
- **Descrição:** Implementada validação do `content-type` nas requisições `GET` e `PUT` de edição de utilizadores (`buscarDadosDoUsuario` e `salvarEdicaoUsuario`), prevenindo o erro de parse `Unexpected token '<'` quando o servidor retorna páginas HTML de erro.

## Atualização - 10 de Outubro de 2026 (Confirmação de Senha na Edição de Usuário)
- **Ficheiros modificados:** `frontend/editarUsuario.html`, `frontend/script.js`
- **Descrição:** Adicionado o campo de confirmação de senha (`Confirmar Nova Senha`) na página de edição de utilizadores (`editarUsuario.html`) e implementada a validação em `script.js` para garantir que a nova senha e a confirmação coincidem antes de enviar os dados para o backend.

## Atualização - 10 de Outubro de 2026 (Exibição de Mensagem Específica ao Tentar Excluir Admin)
- **Ficheiros modificados:** `backend/routes/userRoutes.js`, `frontend/script.js`
- **Descrição:** Atualizada a mensagem do backend para `"Este tipo de usuário não pode ser excluído."` e ajustado o tratamento no frontend (`script.js`) para capturar e exibir corretamente esta mensagem no `alert` do navegador em vez da mensagem genérica de erro de API.

## Atualização - 10 de Outubro de 2026 (Proteção contra Exclusão de Administradores)
- **Ficheiro modificado:** `backend/routes/userRoutes.js`
- **Descrição:** Adicionada validação na rota `DELETE /api/usuarios/:id` para verificar se o utilizador possui o perfil `admin`. Caso seja administrador, a exclusão é bloqueada retornando erro `403 Forbidden` (`Não é permitido excluir usuários com perfil de Administrador (Admin).`).

## Atualização - 10 de Outubro de 2026 (Remoção Automática de Identidade SES na Exclusão de Usuário)
- **Ficheiros modificados:** `backend/utils/sesService.js`, `backend/routes/userRoutes.js`
- **Descrição:** Implementada a remoção automática da identidade do AWS SES (`DeleteIdentityCommand` / `removerIdentidadeSES`) sempre que um usuário é excluído do sistema através da rota `DELETE /api/usuarios/:id`.

## Atualização - 10 de Outubro de 2026 (Reenvio Automático de Boas-Vindas após Verificação SES)
- **Ficheiro modificado:** `backend/utils/sesService.js`
- **Descrição:** Implementada lógica de reenvio automático em `enviarEmailBoasVindas` com intervalo de 1 minuto (até 10 tentativas). Assim, quando o utilizador clica no link de verificação da AWS, o sistema tenta novamente enviar o e-mail de boas-vindas com sucesso assim que a verificação for concluída.

## Atualização - 10 de Outubro de 2026 (Tratamento Elegante de Erro de Identidade Não Verificada no SES)
- **Ficheiro modificado:** `backend/utils/sesService.js`
- **Descrição:** Tratado o erro `MessageRejected` (quando o e-mail do destinatário ainda não foi verificado na AWS SES Sandbox) de forma limpa no bloco `catch`, evitando poluição de logs com stack traces longos e registando uma mensagem informativa de que o e-mail aguarda a confirmação do utilizador.

## Atualização - 10 de Outubro de 2026 (Verificação Automática de Identidade via SDK SES)
- **Ficheiro modificado:** `backend/utils/sesService.js`
- **Descrição:** Implementada a chamada automática ao `VerifyEmailIdentityCommand` do AWS SDK no serviço de boas-vindas (`enviarEmailBoasVindas`). Isso faz com que a AWS envie automaticamente um e-mail de confirmação/verificação para novos destinatários quando o SES estiver em modo Sandbox.

## Atualização - 10 de Outubro de 2026 (Tratamento Seguro de Falta do SDK SES em sesService.js)
- **Ficheiro modificado:** `backend/utils/sesService.js`
- **Descrição:** Adicionado tratamento `try-catch` no carregamento do `@aws-sdk/client-ses` para evitar erros de `MODULE_NOT_FOUND` no servidor quando o pacote não estiver instalado no ambiente, ativando fallback seguro em modo desenvolvimento/produção sem quebrar o arranque da aplicação.

## Atualização - 10 de Outubro de 2026 (Envio de E-mail de Boas-Vindas via Amazon SES no Cadastro de Usuário)
- **Ficheiros modificados:** `backend/utils/sesService.js`, `backend/routes/userRoutes.js`
- **Descrição:** Implementada a funcionalidade de envio automático de e-mail de boas-vindas e confirmação via Amazon SES (`enviarEmailBoasVindas`) sempre que um novo usuário é cadastrado através da rota `POST /api/usuarios`.

## Atualização - 10 de Outubro de 2026 (Remoção de Socket e Uso exclusivo de TCP/Host em db.js)
- **Ficheiros modificados:** `backend/config/db.js`
- **Descrição:** Removida a verificação e utilização de `DB_SOCKET` no módulo de conexão com o banco de dados (`db.js`), garantindo que a aplicação utilize exclusivamente conexões TCP baseadas em host/IP (como o AWS RDS), ignorando qualquer resquício de socket nas variáveis de ambiente.

## Atualização - 10 de Outubro de 2026 (Suporte a Variáveis de Ambiente e Socket no Banco de Dados)
- **Ficheiros modificados:** `backend/config/db.js`
- **Descrição:** Ajustado o módulo de conexão com o banco de dados (`db.js`) para suportar dinamicamente as variáveis de ambiente `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `DB_SOCKET`, corrigindo o conflito de acesso negado quando executado localmente via socket ou com utilizador customizado.

## Atualização - 10 de Outubro de 2026 (Correção de Carregamento de Variáveis de Ambiente e 2FA)
- **Ficheiros modificados:** `backend/server.js`, `backend/utils/sesService.js`, `backend/routes/userRoutes.js`, `backend/config/db.js`, `frontend/script.js`
- **Descrição:** Ajustado o `backend/server.js` para carregar explicitamente o arquivo de configuração de ambiente nomeado `,env`, corrigindo o erro de acesso negado ao banco de dados no EC2. Mantida a integração completa de 2FA via Amazon SES.

## Atualização - 10 de Outubro de 2026 (Autenticação de Dois Fatores 2FA com Amazon SES)
- **Ficheiros criados/modificados:** `backend/utils/sesService.js`, `backend/routes/userRoutes.js`, `backend/config/db.js`, `frontend/script.js`
- **Descrição:** Implementada autenticação de dois fatores (2FA) no login do sistema utilizando o Amazon SES para envio de código OTP de 6 dígitos. Criado o serviço de envio via SES SDK (`sesService.js`), adicionadas as colunas `codigo_2fa` e `expiracao_2fa` no banco de dados (`db.js`), criadas as rotas de login em duas etapas (`/login` e `/verificar-2fa` em `userRoutes.js`), e adaptada a interface de login no frontend (`script.js`) para solicitar e confirmar o código de verificação enviado por e-mail.

## Atualização - 8 de Outubro de 2026 (Badge de Nova Mensagem por Aluno)
- **Ficheiro modificado:** `frontend/script.js`
- **Descrição:** Adicionada indicação visual ("💬 Nova Mensagem") junto ao nome do aluno e contador de mensagens não lidas no botão "Abrir Chat" da tabela em `chatAluno.html`, com remoção automática do indicador ao abrir o chat.

## Atualização - 8 de Outubro de 2026 (Correção de Layout do Dashboard)
- **Ficheiro modificado:** `frontend/dashboard.html`
- **Descrição:** Corrigida a estrutura HTML/CSS desalinhada do dashboard, reposicionando o botão de acessibilidade na parte inferior da barra lateral (`sidebar-wrapper`) e mantendo o ícone de chat no canto superior direito.

## Atualização - 8 de Outubro de 2026 (Notificações de Chat)
- **Ficheiros modificados:** Todos os ficheiros HTML do frontend (`cadastrarAluno.html`, `cadastrarAviso.html`, `cadastrarUsuario.html`, `chatAluno.html`, `dashboard.html`, `editarAluno.html`, `editarUsuario.html`, `historicoAluno.html`, `listaAlunos.html`, `listaAvisos.html`, `listaEventos.html`, `listaUsuarios.html`, `registrarEventos.html`) e `frontend/script.js`.
- **Descrição:** Criado um ícone/botão de notificação de novas mensagens de chat (`💬 Chat`) com badge contador em tempo real (`#badgeNotifChat`) no canto superior direito de todas as telas, integrado com lógica de verificação de mensagens não lidas e marcação como lida ao abrir o chat.

## Atualização - 8 de Outubro de 2026 (Nome do Aluno no Chat)
- **Ficheiros modificados:** `frontend/chatAluno.html`, `frontend/script.js`
- **Descrição:** Adicionada funcionalidade para alterar dinamicamente o título/cabeçalho da seção de chat ("Chat por Aluno: [Nome do Aluno]") ao clicar em "Abrir Chat", identificando claramente qual chat de aluno está aberto.

## Registo Inicial
- **Data:** 8 de outubro de 2026
- **Descrição:** Configuração inicial da diretriz de registo de histórico de alterações (`HISTORICO_ALTERACOES.md`) e atualização do `GEMINI.md`.
