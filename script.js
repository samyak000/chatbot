const toggler = document.getElementById("chatbot-toggler");
const closeBtn = document.getElementById("close-chatbot");

const form = document.querySelector(".chat-footer");
const textarea = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");

const fileInput = document.getElementById("file-input");
const uploadBtn = document.getElementById("upload-btn");

const emojiBtn = document.getElementById("emoji-btn");
const voiceBtn = document.getElementById("voice-btn");

/* ================= API ================= */
const API_KEY = "YOUR_API_KEY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let chatHistory = [];
let imageData = null;

/* ================= TOGGLE ================= */
toggler.onclick = () => document.body.classList.toggle("show-chatbot");
closeBtn.onclick = () => document.body.classList.remove("show-chatbot");

/* ================= MESSAGE ================= */
function addMessage(text, type, img = null) {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  div.innerHTML = `
    <div class="msg">${text}</div>
    ${img ? `<img src="${img}" class="preview-img"/>` : ""}
  `;

  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* ================= TYPING ================= */
function showTyping() {
  const div = document.createElement("div");
  div.className = "message bot thinking";

  div.innerHTML = `
    <div class="msg">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;

  chatBody.appendChild(div);
  return div;
}

/* ================= API ================= */
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
    if (!res.ok) throw new Error(data.error.message);

    const reply = data.candidates[0].content.parts[0].text;

    typingDiv.remove();
    addMessage(reply, "bot");

    chatHistory.push({
      role: "model",
      parts: [{ text: reply }]
    });

  } catch (err) {
    typingDiv.remove();
    addMessage("Error: " + err.message, "bot");
  }

  imageData = null;
}

/* ================= SEND ================= */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = textarea.value.trim();
  if (!msg && !imageData) return;

  addMessage(msg, "user", imageData?.preview);
  textarea.value = "";

  const typing = showTyping();
  generateResponse(msg, typing);
});

/* ================= IMAGE UPLOAD ================= */
uploadBtn.onclick = () => fileInput.click();

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const base64 = reader.result.split(",")[1];

    imageData = {
      base64: base64,
      type: file.type,
      preview: reader.result
    };
  };

  reader.readAsDataURL(file);
});

/* ================= EMOJI ================= */
const picker = new EmojiMart.Picker({
  onEmojiSelect: (emoji) => {
    textarea.value += emoji.native;
  }
});

document.body.appendChild(picker);
picker.style.display = "none";

emojiBtn.onclick = () => {
  picker.style.display = picker.style.display === "none" ? "block" : "none";
};

/* ================= VOICE INPUT ================= */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  voiceBtn.onclick = () => {
    recognition.start();
    voiceBtn.innerText = "🎙️";
  };

  recognition.onresult = (event) => {
    textarea.value += event.results[0][0].transcript;
    voiceBtn.innerText = "🎤";
  };

  recognition.onerror = () => {
    voiceBtn.innerText = "🎤";
  };

} else {
  voiceBtn.style.display = "none";
}

/* ================= ENTER ================= */
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});
