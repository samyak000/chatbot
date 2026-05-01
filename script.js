const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

const API_KEY = "YOUR_API_KEY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
  file: { data: null, mime_type: null },
};

const chatHistory = [];

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  chatHistory.push({
    role: "user",
    parts: [{ text: userData.message }]
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI.";

    messageElement.innerText = text;

    chatHistory.push({
      role: "model",
      parts: [{ text }]
    });

  } catch (err) {
    messageElement.innerText = err.message;
    messageElement.style.color = "red";
  }

  incomingMessageDiv.classList.remove("thinking");
};

const handleOutgoingMessage = (e) => {
  e.preventDefault();

  userData.message = messageInput.value.trim();
  if (!userData.message) return;

  messageInput.value = "";

  const content = `<div class="message-text">${userData.message}</div>`;

  const userMessageDiv = createMessageElement(content, "user-message");

  chatBody.appendChild(userMessageDiv);

  const botContent = `
    <div class="message-text">Thinking...</div>
  `;

  const botDiv = createMessageElement(botContent, "bot-message", "thinking");

  chatBody.appendChild(botDiv);

  generateBotResponse(botDiv);
};

sendMessage.addEventListener("click", handleOutgoingMessage);

chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});

closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});
