# Vintage Cuts — Assistente Virtual

Assistente virtual com IA para a barbearia **Vintage Cuts**

O sistema é composto por um front-end em HTML, CSS e JavaScript puro, que se comunica com uma API em Node.js/Express responsável por acessar a OpenAI via Azure.

## Tecnologias utilizadas

**Front-end:** HTML5, CSS3, JavaScript, Fetch API
**Back-end:** Node.js, Express, API da OpenAI (via Azure)

## Estrutura do projeto

```
VintageCuts/
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── .gitignore
```

## Como rodar o projeto

### 1. Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` dentro da pasta `backend/` com a chave da OpenAI:

```
OPENAI_API_KEY=sua_chave_aqui
```

Inicie o servidor:

```bash
npm start
```

Esse comando usa o recurso nativo do Node (`--env-file=.env`) para carregar a chave automaticamente, sem precisar de bibliotecas externas como o `dotenv`. O servidor sobe em `http://localhost:3000`.

> **Atenção:** o `--env-file` exige Node.js 20.6 ou superior. Se der erro ao rodar `npm start`, verifique sua versão com `node -v` e atualize o Node se necessário.

### 2. Frontend

Abra o arquivo `frontend/index.html` diretamente no navegador (ou use uma extensão como o Live Server do VS Code). O `script.js` já está configurado para se comunicar com o backend em `http://localhost:3000`.

## Documentação da API

### `GET /`

Verifica se o servidor está no ar.

**Resposta**

```json
"Seja bem vindo ao servidor!"
```

### `POST /chat`

Envia uma mensagem do usuário para o assistente virtual e recebe a resposta gerada pela IA.

**Entrada**

| Campo       | Tipo   | Obrigatório | Descrição                                                        |
| ----------- | ------ | ------------ | ------------------------------------------------------------------ |
| `mensagem`  | string | sim          | Texto digitado pelo usuário                                       |
| `historico` | array  | não          | Histórico da conversa, no formato `[{ role, content }, ...]`, usado para a IA manter contexto entre mensagens |

Exemplo de requisição:

```json
{
  "mensagem": "Quanto custa um corte de cabelo?",
  "historico": [
    { "role": "user", "content": "Oi, meu nome é João" },
    { "role": "assistant", "content": "Olá João! Como posso te ajudar?" }
  ]
}
```

**Saída — sucesso (200)**

```json
{
  "response": "O corte de cabelo sai por R$ 45. Quer agendar um horário?"
}
```

**Saída — erro de validação (400)**

Quando o campo `mensagem` não é enviado.

```json
{
  "erro": "Envie uma mensagem."
}
```

**Saída — erro interno (500)**

Quando há falha na comunicação com a OpenAI.

```json
{
  "erro": "Erro ao processar sua mensagem. Tente novamente."
}
```

## Fluxo de funcionamento

1. O usuário digita uma mensagem na interface.
2. O JavaScript do front-end envia a mensagem (e o histórico da conversa) para a API via Fetch.
3. A API adiciona o Prompt do Sistema, que define o comportamento e o contexto do assistente.
4. A API envia a conversa completa para a OpenAI.
5. A OpenAI retorna a resposta gerada.
6. A API devolve a resposta ao front-end no formato `{ response }`.
7. O front-end exibe a resposta na tela, com suporte a formatação em Markdown (negrito, itálico, links, listas e código).

## Prompt do sistema

O assistente foi configurado para representar a barbearia Vintage Cuts, respondendo diretamente perguntas sobre serviços, preços, horários, formas de pagamento e endereço. Ele só direciona o cliente ao WhatsApp em casos que exigem confirmação real com a equipe, como disponibilidade de horário específico ou remarcação de agendamento — evitando usar o WhatsApp como resposta padrão para tudo.

## Funcionalidades implementadas

- Interface de chat com identidade visual própria (tema Vintage Cuts)
- Envio de mensagens via Fetch API
- Histórico de conversa mantido durante toda a sessão
- Botão "Nova Conversa", que limpa a tela e reinicia o histórico
- Indicador de carregamento ("Pensando...") enquanto aguarda a resposta da IA
- Tratamento de erros com mensagens amigáveis
- Diferenciação visual entre mensagens do usuário e da IA
- Indicador de status de conexão com o servidor (online/offline)

## Funcionalidades extras (bônus)

- Modo escuro
- Envio de mensagem com a tecla Enter
- Scroll automático para a mensagem mais recente
- Suporte a Markdown nas respostas da IA (negrito, itálico, código inline, listas e links)

## Autor

Leonardo Mazzuco