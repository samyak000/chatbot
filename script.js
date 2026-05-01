const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

const API_KEY = "YOUR_API_KEY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let chatHistory = [];

/* TOGGLE */
chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});

closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});

/* ADD MESSAGE */
function addMessage(text, type) {
  const div = document.createElement("div");
  div.classList.add("message", type);
  div.innerHTML = `<div class="message-text">${text}</div>`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* API CALL */
async function getResponse(userText, botDiv) {
  try {
    chatHistory.push({
      role: "user",
      parts: [{ text: userText }]
    });

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });

    const data = await res.json();

    console.log("API RESPONSE:", data);

    if (!data.candidates || !data.candidates[0]) {
      throw new Error(data.error?.message || "No response from API");
    }

    const reply = data.candidates[0].content.parts[0].text;

    botDiv.querySelector(".message-text").innerText = reply;

    chatHistory.push({
      role: "model",
      parts: [{ text: reply }]
    });

  } catch (err) {
    botDiv.querySelector(".message-text").innerText = "Error: " + err.message;
  }
}

/* SEND */
sendMessage.addEventListener("click", (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return;

  addMessage(text, "user");

  messageInput.value = "";

  const botDiv = document.createElement("div");
  botDiv.classList.add("message", "bot");
  botDiv.innerHTML = `<div class="message-text">Thinking...</div>`;

  chatBody.appendChild(botDiv);

  getResponse(text, botDiv);
});
