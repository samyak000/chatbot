const toggler = document.getElementById("chatbot-toggler");
const closeBtn = document.getElementById("close-chatbot");

const form = document.querySelector(".chat-footer");
const textarea = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");

const fileInput = document.getElementById("file-input");
const uploadBtn = document.getElementById("upload-btn");
const emojiBtn = document.getElementById("emoji-btn");
const voiceBtn = document.getElementById("voice-btn");

/* ================= GEMINI API ================= */
const API_KEY = "YOUR_API_KEY_HERE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

/* ================= STATE ================= */
let chatHistory = [];
let imageData = null;

/* ================= TOGGLE CHAT ================= */
toggler.onclick = () => document.body.classList.toggle("show-chatbot");
closeBtn.onclick = () => document.body.classList.remove("show-chatbot");

/* ================= MESSAGE UI ================= */
function addMessage(text, type, img = null) {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  div.innerHTML = `
    <div class="msg">${text}</div>
    ${img ? `<img src="${img}" style="max-width:180px;border-radius:10px;margin-top:6px;">` : ""}
  `;

  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* ================= SAFE API CALL ================= */
async function generateResponse(userMessage, typingDiv) {
  try {
    const parts = [{ text: userMessage }];

    if (imageData) {
      parts.push({
        inline_data: {
          mime_type: imageData.type,
          data: imageData.base64
        }
      });
    }

    chatHistory.push({
      role: "user",
      parts
    });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });

    const data = await response.json();

    console.log("Gemini Response:", data); // DEBUG

    /* ================= SAFETY CHECKS ================= */
    if (!response.ok) {
      throw new Error(data?.error?.message || "API request failed");
    }

    const candidate = data?.candidates?.[0];

    if (!candidate || !candidate.content) {
      throw new Error("No valid response from Gemini API");
    }

    const reply = candidate.content.parts?.[0]?.text;

    if (!reply) {
      throw new Error("Empty response from model");
    }

    typingDiv.remove();
    addMessage(reply, "bot");

    chatHistory.push({
      role: "model",
      parts: [{ text: reply }]
    });

  } catch (err) {
    typingDiv.remove();
    addMessage("⚠️ " + err.message, "bot");
  }

  imageData = null;
}

/* ================= SEND MESSAGE ================= */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = textarea.value.trim();
  if (!msg && !imageData) return;

  addMessage(msg, "user", imageData?.preview);

  textarea.value = "";

  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot";
  typingDiv.innerHTML = `<div class="msg">Typing...</div>`;
  chatBody.appendChild(typingDiv);

  chatBody.scrollTop = chatBody.scrollHeight;

  generateResponse(msg, typingDiv);
});

/* ================= IMAGE UPLOAD ================= */
uploadBtn.onclick = () => fileInput.click();

fileInput.addEventListener("change", () => {
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
});

/* ================= VOICE INPUT ================= */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  voiceBtn.onclick = () => recognition.start();

  recognition.onresult = (event) => {
    textarea.value += event.results[0][0].transcript;
  };
} else {
  voiceBtn.style.display = "none";
}

/* ================= EMOJI (simple safe version) ================= */
emojiBtn.onclick = () => {
  textarea.value += "😊";
};

/* ================= ENTER KEY SUPPORT ================= */
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});
