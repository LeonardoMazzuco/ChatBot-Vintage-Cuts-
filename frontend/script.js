const messagesContainer = document.getElementById("messages");
const input = document.getElementById("userInput");

// Histórico da conversa — agora guardado no formato role/content,
// que é o que a API da OpenAI espera para "lembrar" do contexto.
let messages = [];

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Escapa HTML perigoso (evita XSS) sem interpretar markdown.
// Usado para mensagens do próprio usuário.
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

// Converte markdown simples em HTML, com escaping de segurança.
// Usado apenas nas respostas da IA.
function formatarMarkdown(text) {
  let seguro = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  seguro = seguro.replace(/`(.+?)`/g, "<code>$1</code>");
  seguro = seguro.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  seguro = seguro.replace(/\*(.+?)\*/g, "<em>$1</em>");
  seguro = seguro.replace(
    /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  const linhas = seguro.split("\n");
  let html = "";
  let dentroDeLista = false;

  linhas.forEach((linha) => {
    const isItemDeLista = linha.trim().startsWith("- ");

    if (isItemDeLista) {
      if (!dentroDeLista) {
        html += "<ul>";
        dentroDeLista = true;
      }
      html += `<li>${linha.trim().slice(2)}</li>`;
    } else {
      if (dentroDeLista) {
        html += "</ul>";
        dentroDeLista = false;
      }
      html += linha + "<br>";
    }
  });

  if (dentroDeLista) html += "</ul>";
  return html.replace(/<br>$/, "");
}

function addMessage(text, type) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " + type;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = type === "bot" ? formatarMarkdown(text) : escapeHtml(text);

  wrapper.appendChild(bubble);
  messagesContainer.appendChild(wrapper);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Guarda no histórico, no formato que a API entende
  messages.push({
    role: type === "user" ? "user" : "assistant",
    content: text,
  });
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "message bot";
  div.id = "typing";
  div.innerHTML = `
    <div class="bubble typing">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById("typing");
  if (typing) {
    typing.remove();
  }
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";
  showTyping();

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mensagem: text,
        historico: messages, // manda a conversa inteira, não só a última mensagem
      }),
    });

    const data = await response.json();
    hideTyping();
    addMessage(data.response, "bot");
  } catch (error) {
    hideTyping();
    addMessage("Erro ao conectar com o servidor. Tente novamente.", "bot");
    console.error(error);
  }
}

function novaConversa() {
  messages = [];
  messagesContainer.innerHTML = "";
  addMessage(
    "Olá! Sou o assistente virtual da Vintage Cuts. Como posso te ajudar hoje?",
    "bot"
  );
}

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

function setStatus(state) {
  statusDot.classList.remove("offline", "checking");

  if (state === "online") {
    statusText.textContent = "Online • Inteligência Artificial";
  } else if (state === "offline") {
    statusDot.classList.add("offline");
    statusText.textContent = "Offline • servidor indisponível";
  } else {
    statusDot.classList.add("checking");
    statusText.textContent = "Verificando conexão...";
  }
}

async function checkServerStatus() {
  try {
    const response = await fetch("http://localhost:3000/", {
      method: "GET",
    });
    setStatus(response.ok ? "online" : "offline");
  } catch (error) {
    setStatus("offline");
  }
}

checkServerStatus();
setInterval(checkServerStatus, 15000);

function toggleTheme() {
  document.body.classList.toggle("dark");
}