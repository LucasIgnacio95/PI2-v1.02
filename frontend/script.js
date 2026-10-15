// Toggle visibilidade da senha
function toggleVisibilidadeSenha() {
  const inputSenha = document.getElementById("usuarioSenha");
  const btnToggle = document.getElementById("btnToggleSenha");
  if (inputSenha && btnToggle) {
    if (inputSenha.type === "password") {
      inputSenha.type = "text";
      btnToggle.innerText = "🙈";
    } else {
      inputSenha.type = "password";
      btnToggle.innerText = "👁️";
    }
  }
}

// Toggle visibilidade da senha no Login (index.html)
function toggleVisibilidadeLogin() {
  const inputSenha = document.getElementById("senha");
  const btnToggle = document.getElementById("btnToggleLoginSenha");
  if (inputSenha && btnToggle) {
    if (inputSenha.type === "password") {
      inputSenha.type = "text";
      btnToggle.innerText = "🙈";
    } else {
      inputSenha.type = "password";
      btnToggle.innerText = "👁️";
    }
  }
}

// Validação de força de senha no cadastro de usuários
function validarForcaSenha() {
  const inputSenha = document.getElementById("usuarioSenha");
  if (!inputSenha) return;
  const senha = inputSenha.value;
  const btnSalvar = document.getElementById("btnSalvar");
  const barraForca = document.getElementById("barraForca");
  const labelForca = document.getElementById("labelForca");

  const senhasComuns = ["12345678", "123456789", "password", "senha123", "admin123", "123456", "qwertyui", "mudar123", "senha", "abcdefgh"];

  const temTamanho = senha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
  const naoComum = !senhasComuns.includes(senha.toLowerCase());

  // Atualizar Checklist UI
  atualizarRequisito("req-tamanho", temTamanho, "Mínimo de 8 caracteres (12+ ideal)");
  atualizarRequisito("req-maiuscula", temMaiuscula, "Pelo menos 1 letra maiúscula");
  atualizarRequisito("req-minuscula", temMinuscula, "Pelo menos 1 letra minúscula");
  atualizarRequisito("req-numero", temNumero, "Pelo menos 1 número");
  atualizarRequisito("req-especial", temEspecial, "Pelo menos 1 caractere especial (!@#$%^&*)");
  atualizarRequisito("req-comum", naoComum && senha.length > 0, "Não pode ser senha comum/vazada");

  // Calcular força (0 a 6)
  let pontuacao = 0;
  if (temTamanho) pontuacao++;
  if (temMaiuscula) pontuacao++;
  if (temMinuscula) pontuacao++;
  if (temNumero) pontuacao++;
  if (temEspecial) pontuacao++;
  if (naoComum && senha.length >= 8) pontuacao++;

  const percentual = (pontuacao / 6) * 100;
  if (barraForca) {
    barraForca.style.width = percentual + "%";
    if (pontuacao <= 2) {
      barraForca.className = "progress-bar bg-danger";
      if (labelForca) labelForca.innerText = "Muito Fraca";
    } else if (pontuacao <= 4) {
      barraForca.className = "progress-bar bg-warning";
      if (labelForca) labelForca.innerText = "Média";
    } else {
      barraForca.className = "progress-bar bg-success";
      if (labelForca) labelForca.innerText = "Forte";
    }
  }

  // Habilitar ou desabilitar botão Salvar
  const senhaValida = temTamanho && temMaiuscula && temMinuscula && temNumero && temEspecial && naoComum;
  if (btnSalvar) {
    btnSalvar.disabled = !senhaValida;
  }
}

function atualizarRequisito(id, atendido, texto) {
  const el = document.getElementById(id);
  if (el) {
    if (atendido) {
      el.className = "text-success";
      el.innerText = "✅ " + texto;
    } else {
      el.className = "text-danger";
      el.innerText = "❌ " + texto;
    }
  }
}

// Login com suporte a 2FA (Amazon SES)
let emailPara2FA = "";

function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  if (!usuario || !senha) {
    alert("Preencha o usuário e a senha.");
    return;
  }

  fetch("/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ usuario, senha })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Erro no login");
        return;
      }
      if (data.exige2FA) {
        emailPara2FA = data.email;
        // Substituir o conteúdo do card de login pela tela de inserção do código 2FA
        const card = document.querySelector(".login-card");
        card.innerHTML = `
          <div class="text-center mb-4">
              <div class="mb-2" style="font-size: 2.5rem;">🔒</div>
              <h4 class="fw-bold mb-1">Verificação em Duas Etapas</h4>
              <p class="text-muted texto-pequeno mb-0 mt-2">Enviamos um código de 6 dígitos para o e-mail do administrador cadastrado (${data.email}).</p>
          </div>

          <div class="mb-4">
              <label for="codigo2fa" class="form-label fw-bold texto-pequeno mb-1">Código de Verificação</label>
              <input type="text" id="codigo2fa" class="form-control input-estilizado texto-pequeno text-center fs-4" placeholder="000000" maxlength="6">
          </div>

          <button onclick="verificar2FA()" class="btn btn-primary w-100 fw-bold py-2" style="border-radius: 8px;">
              Confirmar Código
          </button>

          <div class="text-center mt-3 texto-pequeno">
              <a href="/" class="text-decoration-none text-muted">Voltar ao login</a>
          </div>
        `;
      } else if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      } else {
        alert("Login inválido");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    });
}

function verificar2FA() {
  const codigo = document.getElementById("codigo2fa").value;
  if (!codigo || codigo.length < 6) {
    alert("Por favor, digite o código de 6 dígitos enviado por e-mail.");
    return;
  }

  fetch("/api/users/verificar-2fa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: emailPara2FA, codigo })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Código inválido ou expirado");
        return;
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      } else {
        alert("Erro na verificação do 2FA");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    });
}
// Sistema de permissões e restrições
function verificarAcessoAdmin() {
    const userStr = localStorage.getItem("user");
    
    if (!userStr) return; 

    const user = JSON.parse(userStr);
    const urlAtual = window.location.pathname.toLowerCase();
    const tipoUsuario = user.tipo.toLowerCase(); 

    const paginasExclusivasAdmin = [
        "listausuarios", 
        "cadastrarusuario", 
        "editarusuario",
        "logs"
    ];

    const paginasBloqueadasResponsavel = [
        "listaalunos",
        "cadastraraluno",
        "editaraluno",
        "cadastraraviso",
        "registrareventos"
    ];

    const bloqueioAdmin = paginasExclusivasAdmin.some(pagina => urlAtual.includes(pagina));
    
    if (bloqueioAdmin) {
        if (tipoUsuario !== "admin" && tipoUsuario !== "administrador") {
            window.location.href = "/acesso-negado";
            return; 
        }
    }

    const bloqueioResponsavel = paginasBloqueadasResponsavel.some(pagina => urlAtual.includes(pagina));
    
    if (bloqueioResponsavel) {
        if (tipoUsuario === "responsável" || tipoUsuario === "responsavel") {
            window.location.href = "/acesso-negado";
        }
    }
}

// Função para carregar o nome do usuário no Dashboard
function carregarBoasVindas() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return; 

    const user = JSON.parse(userStr);
    const titulo = document.getElementById("mensagemBoasVindas");
    
    if (titulo) {
        const primeiroNome = user.nome.split(" ")[0]; 
        titulo.innerText = `Bem-vindo(a), ${primeiroNome}!`;
    }
}

// Cadastro de usuarios
function cadastrarUsuario() {
  const usuario = document.getElementById("usuarioLogin").value;
  const nome = document.getElementById("usuarioNome").value;
  const email = document.getElementById("usuarioEmail").value;
  const senha = document.getElementById("usuarioSenha").value;
  const tipo = document.getElementById("usuarioTipo").value;

  if (!usuario || !nome || !senha || !tipo) {
    alert("Por favor, preencha os campos obrigatórios (Usuário, Nome, Senha, Tipo)!");
    return;
  }

  fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, nome, email, senha, tipo })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao cadastrar usuário");
      return data;
    })
    .then(data => {
      alert(data.message || "Usuário cadastrado com sucesso!");
      window.location.href = "/usuarios";
    })
    .catch(err => {
      alert(err.message);
    });
}


// Cadastro de alunos
function cadastrarAluno() {
  const nome = document.getElementById("alunoNome").value;
  const data_nascimento = document.getElementById("alunoData").value;
  const turma = document.getElementById("alunoTurma").value;
  const selectResponsavel = document.getElementById("alunoResponsavel");
  const responsavel_id = selectResponsavel.value;
  
  const checkboxConsentimento = document.getElementById("alunoConsentimento");
  const consentimento_parental = checkboxConsentimento ? checkboxConsentimento.checked : false;

  if (!nome || !data_nascimento || !turma || !responsavel_id) {
    alert("Erro: Todos os campos do aluno são obrigatórios!");
    return;
  }

  if (!consentimento_parental) {
    alert("O Consentimento Parental (LGPD) é obrigatório para cadastrar o aluno!");
    return;
  }

  const responsavel_nome = selectResponsavel.options[selectResponsavel.selectedIndex].text;

  fetch("/api/alunos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      data_nascimento,
      turma,
      responsavel: responsavel_nome,
      responsavel_id: responsavel_id,
      consentimento_parental: 1
    })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro no servidor");
      return data;
    })
    .then(data => {
      alert(data.message);
      window.location.href = "/alunos";
    })
    .catch(err => {
      console.error("Erro na requisição:", err);
      alert(err.message);
    });
}

// Carregar Usuarios
function carregarUsuarios() {
  fetch("/api/users")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaUsuarios");
      if (lista) lista.innerHTML = "";

      data.forEach(usuario => {
        if (lista) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
        <td class="align-middle">${usuario.usuario || usuario.nome || "-"}</td>
        <td class="align-middle">${usuario.nome}</td>
        <td class="align-middle">${usuario.email || "-"}</td>
        <td class="align-middle">********</td>
        <td class="align-middle">${usuario.tipo}</td>
        <td class="text-center">
            <div class="d-flex justify-content-center">
                <button class="btn btn-sm btn-acao btn-editar me-2" 
                        onclick="editarUsuario(${usuario.id})">
                    Editar
                </button>
                
                <button class="btn btn-sm btn-acao btn-excluir" 
                        onclick="excluirUsuario(${usuario.id}, '${usuario.nome}')">
                    Excluir
                </button>
            </div>
        </td>`;
          lista.appendChild(tr);
        }
      });
    })
    .catch(err => console.error("Erro ao carregar usuarios:", err));
}

// Excluir Usuario
function excluirUsuario(id, nome) {
  if (confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) {

    fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erro ao excluir no servidor");
        return data;
      })
      .then(data => {
        alert(data.message || "Usuário excluído com sucesso!");

        carregarUsuarios();
      })
      .catch(err => {
        console.error("Erro:", err);
        alert(err.message || "Não foi possível excluir o usuario. Verifique a conexão com a API.");
      });
  }
}

function editarUsuario(id) {
  window.location.href = `editarUsuario.html?id=${id}`;
}


function buscarDadosDoUsuario(id) {
  if (!id) return;
  fetch(`/api/users/${id}`)
    .then(async res => {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      } else {
        throw new Error("Erro ao carregar dados do usuário.");
      }
    })
    .then(usuario => {
      const dados = Array.isArray(usuario) ? usuario[0] : usuario;
      if (!dados) {
        alert("Usuário não encontrado.");
        window.location.href = "/usuarios";
        return;
      }

      document.getElementById("editUserId").value = dados.id;
      document.getElementById("editUserLogin").value = dados.usuario || dados.nome || "";
      document.getElementById("editUserNome").value = dados.nome || "";
      document.getElementById("editUserEmail").value = dados.email || "";
      document.getElementById("editUserTipo").value = dados.tipo || "";
    })
    .catch(err => {
      console.error("Erro ao buscar usuário:", err);
      alert(err.message || "Não foi possível carregar os dados do usuário.");
    });
}

function salvarEdicaoUsuario() {
  const id = document.getElementById("editUserId").value;
  if (!id) {
    alert("ID do usuário inválido.");
    return;
  }
  const usuario = document.getElementById("editUserLogin").value;
  const nome = document.getElementById("editUserNome").value;
  const email = document.getElementById("editUserEmail").value;
  const tipo = document.getElementById("editUserTipo").value;
  const senha = document.getElementById("editUserSenha").value;
  const confirmarSenha = document.getElementById("editUserConfirmarSenha").value;

  if (senha && senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  const dadosAtualizados = { usuario, nome, email, tipo };
  if (senha) dadosAtualizados.senha = senha;

  fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosAtualizados)
  })
    .then(async res => {
      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Erro ao atualizar dados no servidor.");
      }
      if (!res.ok) throw new Error(data.message || "Erro ao atualizar dados.");
      return data;
    })
    .then(data => {
      alert(data.message || "Usuário atualizado com sucesso!");
      window.location.href = "/usuarios";
    })
    .catch(err => alert(err.message || "Erro ao atualizar dados."));
}


// Carregar Alunos
function carregarAlunos() {
  fetch("/api/alunos")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaAlunos");
      if (lista) lista.innerHTML = "";

      data.forEach(aluno => {
        if (lista) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
        <td class="align-middle">${aluno.nome}</td>
        <td class="align-middle">${aluno.turma}</td>
        <td class="align-middle">${aluno.responsavel}</td>
        <td class="text-center">
            <div class="d-flex justify-content-center">
                <button class="btn btn-sm btn-acao btn-editar me-2" 
                        onclick="editarAluno(${aluno.id})">
                    Editar
                </button>
                
                <button class="btn btn-sm btn-acao btn-excluir" 
                        onclick="excluirAluno(${aluno.id}, '${aluno.nome}')">
                    Excluir
                </button>
                 <button class="btn btn-sm btn-acao btn-historico" 
                        onclick="historicoAluno(${aluno.id}, '${aluno.nome}')">
                    Histórico
                </button>
            </div>
        </td>`;
          lista.appendChild(tr);
        }
      });
    })
    .catch(err => console.error("Erro ao carregar alunos:", err));
}

// Excluir Aluno
function excluirAluno(id, nome) {
  if (confirm(`Tem certeza que deseja excluir o aluno ${nome}?`)) {

    fetch(`/api/alunos/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao excluir no servidor");
        return res.json();
      })
      .then(data => {
        alert(data.message || "Aluno excluído com sucesso!");

        carregarAlunos();
      })
      .catch(err => {
        console.error("Erro:", err);
        alert("Não foi possível excluir o aluno. Verifique a conexão com a API.");
      });
  }
}

//Carrega os alunos na tela Eventos e Ocorrencias
function carregarAlunosEventos() {
  fetch("/api/alunos")
    .then(res => res.json())
    .then(alunos => {
      const select = document.getElementById("selectAlunosRegistrar");
      if (!select) return;

      select.innerHTML = '<option value="">Carregando alunos...</option>';

      alunos.forEach(aluno => {
        const option = document.createElement("option");
        option.value = aluno.id;
        option.innerText = aluno.nome;
        select.appendChild(option);
      });

      console.log("Alunos carregados:", alunos);
    })
    .catch(err => console.error("Erro ao carregar alunos:", err));
}

// Metodo para carregar os responsáveis na tela de cadastro de alunos
function carregarResponsaveis() {
  fetch("/api/users")
    .then(res => res.json())
    .then(usuarios => {
      const select = document.getElementById("alunoResponsavel");
      if (!select) return;

      select.innerHTML = '<option value="">Selecione um responsável</option>';

      const apenasResponsaveis = usuarios.filter(u => u.tipo.toLowerCase() === "responsável");

      apenasResponsaveis.forEach(usuario => {
        const option = document.createElement("option");
        option.value = usuario.id
        option.innerText = usuario.nome;
        select.appendChild(option);
      });

      console.log("Responsáveis carregados:", apenasResponsaveis);
    })
    .catch(err => console.error("Erro ao carregar responsáveis:", err));
}

function editarAluno(id) {
  window.location.href = `editarAluno.html?id=${id}`;
}

function buscarDadosDoAluno(id) {
  fetch(`/api/alunos/${id}`)
    .then(res => res.json())
    .then(aluno => {
      const dados = Array.isArray(aluno) ? aluno[0] : aluno;

      document.getElementById("editAlunoId").value = dados.id;
      document.getElementById("editAlunoNome").value = dados.nome;
      document.getElementById("editAlunoData").value = dados.data_nascimento;
      document.getElementById("editAlunoTurma").value = dados.turma;
      document.getElementById("editAlunoResponsavel").value = dados.responsavel;
    })
    .catch(err => console.error("Erro ao buscar aluno:", err));
}

function salvarEdicaoAluno() {
  const id = document.getElementById("editAlunoId").value;
  const nome = document.getElementById("editAlunoNome").value;
  const data_nascimento = document.getElementById("editAlunoData").value;
  const turma = document.getElementById("editAlunoTurma").value;
  const responsavel = document.getElementById("editAlunoResponsavel").value;

  const dadosAtualizados = { nome, data_nascimento, turma, responsavel };


  fetch(`/api/alunos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosAtualizados)
  })
    .then(res => res.json())
    .then(data => {
      alert("Usuário atualizado com sucesso!");
      window.location.href = "listaAluno.html";
    })
    .catch(err => alert("Erro ao atualizar dados."));
}


// Carregar alunos chat (Com filtro de Responsável)
function carregarAlunosChat() {
  fetch("/api/alunos")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaAlunosChat");
      const select = document.getElementById("selectAlunos");

      
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const isResponsavel = (user.tipo || "").toLowerCase() === "responsável" || (user.tipo || "").toLowerCase() === "responsavel";

      let alunosParaMostrar = data; 
      
      if (isResponsavel) {
         alunosParaMostrar = data.filter(aluno => aluno.responsavel_id == user.id || aluno.responsavel === user.nome);
      }
      
      if (lista) {
        lista.innerHTML = "";
        alunosParaMostrar.forEach(aluno => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
              <td class="align-middle" id="nome-aluno-${aluno.id}">${aluno.nome}</td>
              <td class="align-middle">${aluno.turma}</td>
              <td class="align-middle">${aluno.responsavel}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-acao btn-editar me-2 position-relative" onclick="verChat(${aluno.id}, '${aluno.nome.replace(/'/g, "\\'")}')">
                  Abrir Chat
                  <span id="badge-aluno-${aluno.id}" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="display: none;">
                    0
                  </span>
                </button>
              </td>`;
          lista.appendChild(tr);

          // Verificar mensagens não lidas para este aluno
          fetch(`/api/chat/${aluno.id}`)
            .then(res => res.json())
            .then(mensagens => {
              if (!Array.isArray(mensagens)) return;
              const mensagensOutros = mensagens.filter(m => m.remetente_id != user.id);
              const ultimaQtdLida = parseInt(localStorage.getItem(`chat_lido_${aluno.id}`) || "0");
              const novas = mensagensOutros.length - ultimaQtdLida;

              const badgeEl = document.getElementById(`badge-aluno-${aluno.id}`);
              const nomeEl = document.getElementById(`nome-aluno-${aluno.id}`);
              if (badgeEl && nomeEl) {
                if (novas > 0) {
                  badgeEl.innerText = novas;
                  badgeEl.style.display = "inline-block";
                  if (!nomeEl.innerHTML.includes("badge-nova")) {
                    nomeEl.innerHTML = `${aluno.nome} <span class="badge bg-danger ms-2 badge-nova">💬 Nova Mensagem</span>`;
                  }
                } else {
                  badgeEl.style.display = "none";
                }
              }
            })
            .catch(() => {});
        });
      }

      if (select) {
        select.innerHTML = '<option value="">Selecione um aluno</option>';
        alunosParaMostrar.forEach(aluno => {
          const opt = document.createElement("option");
          opt.value = aluno.id;
          opt.innerText = aluno.nome;
          select.appendChild(opt);
        });
      }
    })
    .catch(err => console.error("Erro ao carregar alunos no chat:", err));
}


// Ocorrências 
function registrarOcorrencia() {
  const selectAluno = document.getElementById("selectAlunosRegistrar");
  const aluno_id = selectAluno.value; 
  const aluno_nome = selectAluno.options[selectAluno.selectedIndex].text; 
  const descricao = document.getElementById("descricaoEventos").value;
  const data_ocorrencia = new Date().toISOString().split('T')[0];

  if (!aluno_id || !descricao) {

    return alert("Preencha todos os campos!");

  }

  fetch("/api/ocorrencias", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ aluno_id, descricao, data_ocorrencia, aluno: aluno_nome })
  }).then(res => res.json())
    .then(data => {
      alert(data.message);
      document.getElementById("descricaoEventos").value = " ";
    })
    .catch(err => console.error("Error:", err));

}

//rotinas
function registrarRotina() {
    const selectAluno = document.getElementById("selectAlunosRegistrar");
    const aluno_id = selectAluno.value; 
    const aluno_nome = selectAluno.options[selectAluno.selectedIndex].text;     
    const descricao = document.getElementById("descricaoEventos").value;
    const data_registro = new Date().toISOString().split('T')[0];


  if (!aluno_id || !descricao) {

    return alert("Preencha todos os campos!");
  }


  fetch("/api/rotinas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ aluno_id, descricao, data_registro, aluno: aluno_nome })
  }).then(res => res.json())
    .then(data => {
      alert(data.message);
      document.getElementById("descricaoEventos").value = " ";
    })
    .catch(err => console.error("Error:", err));

}

// Carregar Rotinas (Com filtro de Responsável)
function carregarEventosRotinas() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isResponsavel = user.tipo.toLowerCase() === "responsável" || user.tipo.toLowerCase() === "responsavel";
  
  fetch("/api/alunos")
    .then(res => res.json())
    .then(alunos => {
        
        const nomesDosFilhos = alunos
            .filter(a => a.responsavel_id == user.id || a.responsavel === user.nome)
            .map(a => a.nome);

        
        fetch("/api/rotinas")
            .then(res => res.json())
            .then(data => {
                const lista = document.getElementById("listaRotina");
                if (lista) lista.innerHTML = "";
                
                let rotinasParaMostrar = data;
                if (isResponsavel) {
                    rotinasParaMostrar = data.filter(rotina => nomesDosFilhos.includes(rotina.aluno));
                }

                rotinasParaMostrar.forEach(rotina => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="align-middle">${rotina.descricao}</td>
                        <td class="align-middle">${rotina.data_registro}</td>
                        <td class="align-middle">${rotina.aluno}</td>
                        <td class="align-middle text-green fw-bold">Rotina</td>`;      
                    lista.appendChild(tr);
                });
            });
    })
    .catch(err => console.error("Erro ao carregar rotinas:", err));
}

// Carregar Ocorrências (Com filtro de Responsável)
function carregarEventosOcorrencias() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isResponsavel = user.tipo.toLowerCase() === "responsável" || user.tipo.toLowerCase() === "responsavel";
  
  fetch("/api/alunos")
    .then(res => res.json())
    .then(alunos => {
        const nomesDosFilhos = alunos
            .filter(a => a.responsavel_id == user.id || a.responsavel === user.nome)
            .map(a => a.nome);

        fetch("/api/ocorrencias")
            .then(res => res.json())
            .then(data => {
                const lista = document.getElementById("listaOcorrencia");
                if (lista) lista.innerHTML = "";

                let ocorrenciasParaMostrar = data;
                if (isResponsavel) {
                    ocorrenciasParaMostrar = data.filter(ocorrencia => nomesDosFilhos.includes(ocorrencia.aluno));
                }

                ocorrenciasParaMostrar.forEach(ocorrencia => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="align-middle">${ocorrencia.descricao}</td>
                        <td class="align-middle">${ocorrencia.data_ocorrencia}</td>
                        <td class="align-middle">${ocorrencia.aluno}</td>
                        <td class="align-middle text-danger fw-bold">Ocorrência</td>`;      
                    lista.appendChild(tr);
                });
            });
    })
    .catch(err => console.error("Erro ao carregar ocorrencias:", err));
}


// CHAT
let alunoChatAtivo = null;
let alunoNomeAtivo = null;

function verificarNotificacoesChat() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  const user = JSON.parse(userStr);

  fetch("/api/alunos")
    .then(res => res.json())
    .then(alunos => {
      const isResponsavel = user.tipo.toLowerCase() === "responsável" || user.tipo.toLowerCase() === "responsavel";
      let alunosParaVerificar = alunos;
      if (isResponsavel) {
         alunosParaVerificar = alunos.filter(a => a.responsavel_id == user.id || a.responsavel === user.nome);
      }

      if (alunosParaVerificar.length === 0) return;

      let promessas = alunosParaVerificar.map(aluno => 
        fetch(`/api/chat/${aluno.id}`)
          .then(res => res.json())
          .then(mensagens => {
            if (!Array.isArray(mensagens)) return 0;
            const mensagensOutros = mensagens.filter(m => m.remetente_id != user.id);
            const ultimaQtdLida = parseInt(localStorage.getItem(`chat_lido_${aluno.id}`) || "0");
            
            if (mensagensOutros.length > ultimaQtdLida) {
              return mensagensOutros.length - ultimaQtdLida;
            }
            return 0;
          })
          .catch(() => 0)
      );

      Promise.all(promessas).then(resultados => {
        const totalNovas = resultados.reduce((acc, curr) => acc + curr, 0);
        const badge = document.getElementById("badgeNotifChat");
        if (badge) {
          if (totalNovas > 0) {
            badge.innerText = totalNovas;
            badge.style.display = "inline-block";
          } else {
            badge.style.display = "none";
          }
        }
      });
    })
    .catch(err => console.error("Erro ao verificar notificações de chat:", err));
}

function verChat(alunoId, alunoNome) {
  alunoChatAtivo = alunoId;
  if (alunoNome) {
    alunoNomeAtivo = alunoNome;
  }

  const tituloChat = document.getElementById("tituloChatAluno");
  if (tituloChat && alunoNomeAtivo) {
    tituloChat.innerText = `Chat por Aluno: ${alunoNomeAtivo}`;
  }

  fetch(`/api/chat/${alunoId}`)
    .then(res => res.json())
    .then(mensagens => {
      const chatBox = document.getElementById("chatBox");
      if (!chatBox) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (Array.isArray(mensagens)) {
        const mensagensOutros = mensagens.filter(m => m.remetente_id != user.id);
        localStorage.setItem(`chat_lido_${alunoId}`, mensagensOutros.length);
        verificarNotificacoesChat();

        // Ocultar badge e tag de nova mensagem na tabela do aluno
        const badgeEl = document.getElementById(`badge-aluno-${alunoId}`);
        const nomeEl = document.getElementById(`nome-aluno-${alunoId}`);
        if (badgeEl) badgeEl.style.display = "none";
        if (nomeEl && alunoNomeAtivo) nomeEl.innerHTML = alunoNomeAtivo;
      }

      if (mensagens.length === 0) {
        chatBox.innerHTML = `<div class="text-muted p-2">Nenhuma mensagem ainda com ${alunoNomeAtivo || 'este aluno'}.</div>`;
        return;
      }
      chatBox.innerHTML = mensagens.map(m => `
            <div class="msg p-2 mb-2 border-bottom">
                <strong>${m.remetente_nome}:</strong> ${m.mensagem}
            </div>
        `).join("");
    })
    .catch(err => console.error("Erro ao carregar chat:", err));
}

// Metodo que envia mensagem
function enviarMensagem() {
  const user = JSON.parse(localStorage.getItem("user"));
  const mensagem = document.getElementById("msgChat").value;

  if (!alunoChatAtivo) return alert("Selecione um aluno na lista primeiro!");
  if (!mensagem.trim()) return alert("Digite uma mensagem!");

  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      aluno_id: alunoChatAtivo,
      remetente_id: user.id,
      mensagem: mensagem
    })
  }).then(() => {
    document.getElementById("msgChat").value = "";
    verChat(alunoChatAtivo, alunoNomeAtivo); // Atualiza o chat mantendo o nome
  })
  .catch(err => console.error("Erro ao enviar mensagem:", err));
}
function historicoAluno(id, nome) {
  
    window.location.href = `historicoAluno.html?id=${id}`;
}

function carregarHistoricoCompleto() {
    const params = new URLSearchParams(window.location.search);
    const alunoId = params.get('id');

    if (!alunoId) {
        document.getElementById("histNomeAluno").innerText = "⚠️ Aluno não selecionado";
        document.getElementById("histTurmaAluno").innerText = "Volte à lista e clique no botão Histórico.";
        return;
    }

    console.log("Iniciando busca do histórico para o Aluno ID:", alunoId);

    // 1. Busca os dados principais do aluno
    fetch(`/api/alunos/${alunoId}`)
        .then(res => {
            if (!res.ok) throw new Error("Erro na rota de alunos");
            return res.json();
        })
        .then(aluno => {
            console.log("Dados do aluno recebidos:", aluno);
            const dados = Array.isArray(aluno) ? aluno[0] : aluno;
            
            document.getElementById("histNomeAluno").innerText = dados.nome;
            document.getElementById("histTurmaAluno").innerText = dados.turma;
            
            // Calcula a idade 
            if (dados.data_nascimento) {
                const nasc = new Date(dados.data_nascimento);
                const hoje = new Date();
                const idade = hoje.getFullYear() - nasc.getFullYear();
                document.getElementById("histIdadeAluno").innerText = idade;
            }
        })
        .catch(err => console.error("Erro ao buscar Aluno:", err));

    const listaEventos = document.getElementById("listaEventosAluno");
    
    // 2. Busca Rotinas
    fetch(`/api/rotinas`)
        .then(res => res.json())
        .then(rotinas => {
            const minhasRotinas = rotinas.filter(r => r.aluno_id == alunoId);
            minhasRotinas.forEach(r => {
                const tr = `<tr>
                    <td class="align-middle">${r.data_registro}</td>
                    <td class="align-middle"><span class="badge bg-success">Rotina</span></td>
                    <td class="align-middle">${r.descricao}</td>
                </tr>`;
                listaEventos.innerHTML += tr;
            });
        })
        .catch(err => console.error("Erro ao buscar Rotinas:", err));

    // 3. Busca Ocorrências
    fetch(`/api/ocorrencias`)
        .then(res => res.json())
        .then(ocorrencias => {
            const minhasOcorrencias = ocorrencias.filter(o => o.aluno_id == alunoId);
            minhasOcorrencias.forEach(o => {
                const tr = `<tr>
                    <td class="align-middle">${o.data_ocorrencia}</td>
                    <td class="align-middle"><span class="badge bg-danger">Ocorrência</span></td>
                    <td class="align-middle">${o.descricao}</td>
                </tr>`;
                listaEventos.innerHTML += tr;
            });
        })
        .catch(err => console.error("Erro ao buscar Ocorrências:", err));

    // 4. Busca as Mensagens
    fetch(`/api/chat/${alunoId}`)
        .then(res => res.json())
        .then(mensagens => {
            const chatBox = document.getElementById("historicoMensagens");
            chatBox.innerHTML = mensagens.map(m => `
                <div class="msg p-2 mb-2 border-bottom">
                    <small class="text-primary fw-bold">${m.remetente_nome}</small><br>
                    <span>${m.mensagem}</span>
                </div>
            `).join("");
        })
        .catch(err => console.error("Erro ao buscar Chat:", err));
}

// Avisos da semana
function carregarAvisos() {
    fetch("/api/avisos")
        .then(res => res.json())
        .then(data => {
            const lista = document.getElementById("listaAvisos");
            if (!lista) return;

            lista.innerHTML = ""; // Limpa a tabela antes de preencher

            data.forEach(aviso => {
                // 1. Formatar a data para o padrão brasileiro (DD/MM/YYYY)
                let dataFormatada = "Sem data";
                if (aviso.data_evento) {
                    // O timezone 'UTC' evita que a data volte 1 dia por causa do fuso horário
                    const dataObj = new Date(aviso.data_evento);
                    dataFormatada = dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                }

                // 2. Escolher a cor da etiqueta (Badge) com base no tipo de aviso
                let badgeClass = "bg-secondary"; // Cor padrão (cinza)
                const tipoLower = aviso.tipo.toLowerCase();
                
                if (tipoLower.includes("lição") || tipoLower.includes("licao")) badgeClass = "bg-primary"; // Azul
                else if (tipoLower.includes("trabalho")) badgeClass = "bg-warning text-dark"; // Amarelo
                else if (tipoLower.includes("feriado")) badgeClass = "bg-danger"; // Vermelho
                else if (tipoLower.includes("evento") || tipoLower.includes("festa")) badgeClass = "bg-success"; // Verde
                else if (tipoLower.includes("reunião") || tipoLower.includes("reuniao")) badgeClass = "bg-info text-dark"; // Azul claro

                // 3. Montar a linha da tabela
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="align-middle fw-bold text-secondary">${dataFormatada}</td>
                    <td class="align-middle"><span class="badge ${badgeClass}">${aviso.tipo}</span></td>
                    <td class="align-middle">
                        <span class="fw-bold text-dark" style="font-size: 1.1rem;">${aviso.titulo}</span><br>
                        <span class="text-muted">${aviso.descricao}</span><br>
                        <small class="text-primary fw-bold" style="font-size: 0.75rem;">Postado por: ${aviso.autor_nome}</small>
                    </td>
                    <td class="align-middle fw-bold">${aviso.turma}</td>
                    <td class="text-center align-middle">
                        <div class="d-flex justify-content-center">
                            <button class="btn btn-sm btn-acao btn-excluir" onclick="excluirAviso(${aviso.id}, '${aviso.titulo}')">
                                Excluir
                            </button>
                        </div>
                    </td>
                `;
                lista.appendChild(tr);
            });
        })
        .catch(err => console.error("Erro ao carregar avisos:", err));
}

// Método que pega os dados do form e salva no banco
function cadastrarAviso() {
    const titulo = document.getElementById("avisoTitulo").value;
    const tipo = document.getElementById("avisoTipo").value;
    const data_evento = document.getElementById("avisoData").value;
    const turma = document.getElementById("avisoTurma").value;
    const descricao = document.getElementById("avisoDescricao").value;

    // Validação para impedir salvamento em branco
    if (!titulo || !tipo || !data_evento || !turma || !descricao) {
        alert("Por favor, preencha todos os campos para criar o aviso!");
        return;
    }

    // Pega o nome de quem está criando o aviso (Professor ou Admin)
    const user = JSON.parse(localStorage.getItem("user"));
    const autor_nome = user ? user.nome : "Sistema";

    fetch("/api/avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            titulo,
            descricao,
            tipo,
            data_evento,
            turma,
            autor_nome
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "Aviso criado com sucesso!");
        // Redireciona de volta para a lista após salvar
        window.location.href = "/avisos"; 
    })
    .catch(err => {
        console.error("Erro na requisição:", err);
        alert("Ocorreu um erro ao salvar o aviso.");
    });
}

// função de Excluir avisos 
function excluirAviso(id, titulo) {
    if (confirm(`Tem certeza que deseja excluir o aviso "${titulo}"?`)) {
        fetch(`/api/avisos/${id}`, {
            method: "DELETE"
        })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao excluir no servidor");
            return res.json();
        })
        .then(data => {
            alert(data.message || "Aviso excluído com sucesso!");
            carregarAvisos(); // Atualiza a tabela na mesma hora!
        })
        .catch(err => {
            console.error("Erro:", err);
            alert("Não foi possível excluir o aviso.");
        });
    }
}

// Função ativada pelo clique do botão
/**/function alternarTamanhoFonte() {
  const htmlElement = document.documentElement;

  // Liga ou desliga a classe
  htmlElement.classList.toggle('fonte-ampliada');

  if (htmlElement.classList.contains('fonte-ampliada')) {
    localStorage.setItem('fonteAmpliada', 'true');
  } else {
    localStorage.setItem('fonteAmpliada', 'false');
  }
}

// Função que roda ao abrir a página para checar a preferência
function carregarPreferenciaFonte() {
  const fonteAmpliada = localStorage.getItem('fonteAmpliada');

  if (fonteAmpliada === 'true') {
    document.documentElement.classList.add('fonte-ampliada');
  }
}

// Verificação e aceite de Consentimento LGPD
function verificarConsentimentoLGPD() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  const user = JSON.parse(userStr);

  // Apenas aparecer para o tipo "responsável" ou "responsavel"
  const tipo = (user.tipo || "").toLowerCase();
  if (tipo !== "responsável" && tipo !== "responsavel") return;

  // Se já consentiu (1), não faz nada
  if (user.consentimento_lgpd === 1 || user.consentimento_lgpd === true) return;

  // Evitar duplicar o modal se já estiver aberto
  if (document.getElementById("modalConsentimentoLGPD")) return;

  const modalHTML = `
    <div class="modal fade show" id="modalConsentimentoLGPD" tabindex="-1" aria-labelledby="modalConsentimentoLabel" aria-hidden="true" style="display: block; background: rgba(0,0,0,0.6); z-index: 9999;">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 650px;">
        <div class="modal-content border-0 shadow-lg p-4" style="border-radius: 16px; background-color: #fdf8ec;">
          <div class="modal-header border-0 pb-0 justify-content-center text-center">
            <div>
              <div class="mb-2" style="font-size: 2.2rem;">🔒</div>
              <h4 class="modal-title fw-bold text-primary" id="modalConsentimentoLabel">Termo de Consentimento Parental - LGPD</h4>
              <p class="text-muted small mb-0">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
            </div>
          </div>
          <div class="modal-body px-4 py-3">
            <p class="small text-secondary text-start mb-3" style="line-height: 1.6;">
              Em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>, a coleta, armazenamento e tratamento de dados pessoais de crianças e estudantes pelo Prontuário Escolar exigem o <strong>consentimento explícito e inequívoco</strong> dos pais ou responsáveis legais antes da coleta de qualquer dado.
            </p>
            <p class="small text-secondary text-start mb-4" style="line-height: 1.6;">
              Ao prosseguir e aceitar estes termos, você autoriza formalmente a instituição e o sistema a registrar, processar e exibir informações educacionais, rotinas, ocorrências e comunicações relativas ao seu dependente.
            </p>
            
            <div class="form-check text-start mt-3">
              <input class="form-check-input mt-1" type="checkbox" id="checkConsentimentoLGPD" onchange="toggleBotaoAceiteLGPD()" style="cursor: pointer;">
              <label class="form-check-label small text-dark ms-2" for="checkConsentimentoLGPD" style="cursor: pointer; line-height: 1.5;">
                Li e concordo com os termos de consentimento parental e autorizo o tratamento de dados do meu dependente conforme a LGPD.
              </label>
            </div>
          </div>
          <div class="modal-footer border-0 pt-2 pb-2 justify-content-center">
            <button type="button" id="btnAceitarLGPD" class="btn btn-primary w-100 fw-bold py-2 shadow-sm" style="border-radius: 8px;" onclick="aceitarConsentimentoLGPD(${user.id})" disabled>
              Aceitar e Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement("div");
  div.innerHTML = modalHTML;
  document.body.appendChild(div);
}

function toggleBotaoAceiteLGPD() {
  const checkbox = document.getElementById("checkConsentimentoLGPD");
  const btn = document.getElementById("btnAceitarLGPD");
  if (checkbox && btn) {
    btn.disabled = !checkbox.checked;
  }
}

function aceitarConsentimentoLGPD(userId) {
  fetch(`/api/users/${userId}/consentimento`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" }
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao registrar consentimento");
      return data;
    })
    .then(data => {
      alert(data.message || "Consentimento registrado com sucesso!");
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.consentimento_lgpd = 1;
        localStorage.setItem("user", JSON.stringify(user));
      }
      const modal = document.getElementById("modalConsentimentoLGPD");
      if (modal) {
        modal.parentElement.remove();
      }
    })
    .catch(err => {
      alert(err.message);
    });
}

function fazerLogout(event) {
  if (event) event.preventDefault();
  localStorage.clear();
  window.location.href = "/";
}

function verificarAutenticacao() {
  const paginasPublicas = ["index.html", "acessonegado.html", ""];
  const paginaAtual = window.location.pathname.split("/").pop().toLowerCase();
  
  if (paginasPublicas.includes(paginaAtual)) return;

  const userStr = localStorage.getItem("user");
  if (!userStr) {
    window.location.href = "/";
    return;
  }
  try {
    const user = JSON.parse(userStr);
    if (!user || (!user.id && !user.email && !user.tipo && !user.usuario)) {
      localStorage.clear();
      window.location.href = "/";
    }
  } catch (e) {
    localStorage.clear();
    window.location.href = "/";
  }
}

function exibirNomeUsuarioLogado() {
  const el = document.getElementById("nomeUsuarioLogado");
  if (!el) return;
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const nomeExibicao = user.usuario || user.nome || "Usuário";
      el.innerText = `👤 ${nomeExibicao} (${user.tipo || ""})`;
    } catch (e) {
      el.innerText = "";
    }
  }
}

// Inicializa a lista ao abrir a página
window.onload = function () {
  verificarAutenticacao();
  verificarAcessoAdmin();
  carregarBoasVindas();
  carregarPreferenciaFonte();
  verificarConsentimentoLGPD();
  verificarNotificacoesChat();
  exibirNomeUsuarioLogado();

  if (document.getElementById("editUserNome")) {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    if (!userId) {
      alert("ID do usuário não especificado.");
      window.location.href = "/usuarios";
      return;
    }
    buscarDadosDoUsuario(userId);
  }

  if (document.getElementById("listaUsuarios")) {
    carregarUsuarios();
  }
  if (document.getElementById("listaAlunos")) {
    carregarAlunos();
  }
  if (document.getElementById("alunoResponsavel")) {
    carregarResponsaveis();
  }
  if (document.getElementById("listaAlunosChat")) {
    carregarAlunosChat();
  }
  if (document.getElementById("selectAlunosRegistrar")) {
    carregarAlunosEventos();
  }  
  if (document.getElementById("listaOcorrencia")) {
    carregarEventosOcorrencias();
  }
  if (document.getElementById("listaRotina")) {
    carregarEventosRotinas();
  }
  if (document.getElementById("histNomeAluno")) {
        carregarHistoricoCompleto();
    }
  if (document.getElementById("listaAvisos")) {
    carregarAvisos();
  }
  if (document.getElementById("listaLogs")) {
    carregarLogs();
  }
};

function carregarLogs() {
    fetch("/api/logs")
        .then(res => res.json())
        .then(logs => {
            const tbody = document.getElementById("listaLogs");
            if (!tbody) return;
            tbody.innerHTML = "";
            if (logs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum log de auditoria encontrado.</td></tr>`;
                return;
            }
            logs.forEach(log => {
                const dataFormatada = log.data_hora ? new Date(log.data_hora).toLocaleString("pt-BR") : "";
                const usuarioInfo = log.nome_usuario ? `${log.nome_usuario} (${log.tipo_usuario || 'ID ' + log.usuario_id})` : `Usuário #${log.usuario_id}`;
                tbody.innerHTML += `
                    <tr>
                        <td><small class="text-muted">${dataFormatada}</small></td>
                        <td><strong>${usuarioInfo}</strong></td>
                        <td><span class="badge bg-secondary">${log.acao}</span></td>
                        <td>${log.registro_afetado || '-'}</td>
                        <td>${log.detalhes || '-'}</td>
                        <td><small class="text-muted">${log.ip || '-'}</small></td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            console.error("Erro ao carregar logs:", err);
            alert("Erro ao carregar logs do sistema.");
        });
}
