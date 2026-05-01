const toggler = document.getElementById("chatbot-toggler");
const closeBtn = document.getElementById("close-chatbot");

const form = document.querySelector(".chat-footer");
const textarea = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");

const fileInput = document.getElementById("file-input");
const uploadBtn = document.getElementById("upload-btn");
const emojiBtn = document.getElementById("emoji-btn");
const voiceBtn = document.getElementById("voice-btn");

const API_KEY = "YOUR_API_KEY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let chatHistory = [];
let imageData = null;

/* TOGGLE */
toggler.onclick = () => document.body.classList.toggle("show-chatbot");
closeBtn.onclick = () => document.body.classList.remove("show-chatbot");

/* MESSAGE */
function addMessage(text, type, img = null) {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  div.innerHTML = `
    <div class="msg">${text}</div>
    ${img ? `<img src="${img}" style="max-width:150px;border-radius:10px;margin-top:5px;">` : ""}
  `;

  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* API */
async function generateResponse(message, typingDiv) {
  const parts = [{ text: message }];

  if (imageData) {
    parts.push({
      inline_data: {
        mime_type: imageData.type,
        data: imageData.base64
      }
    });
  }

  chatHistory.push({ role: "user", parts });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ contents: chatHistory })
    });

    const data = await res.json();
    const reply = data.candidates[0].content.parts[0].text;

    typingDiv.remove();
    addMessage(reply, "bot");

  } catch (err) {
    typingDiv.remove();
    addMessage("Error: " + err.message, "bot");
  }

  imageData = null;
}

/* SEND */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = textarea.value.trim();
  if (!msg && !imageData) return;

  addMessage(msg, "user");

  const typing = document.createElement("div");
  typing.className = "message bot";
  typing.innerHTML = `<div class="msg">Typing...</div>`;
  chatBody.appendChild(typing);

  textarea.value = "";

  generateResponse(msg, typing);
});

/* IMAGE */
uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imageData = {
      base64: reader.result.split(",")[1],
      type: file.type,
      preview: reader.result
    };
  };

  reader.readAsDataURL(file);
};

/* VOICE */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  voiceBtn.onclick = () => recognition.start();

  recognition.onresult = (e) => {
    textarea.value += e.results[0][0].transcript;
  };
}

/* EMOJI (simple fallback) */
emojiBtn.onclick = () => {
  textarea.value += "😊";
};
