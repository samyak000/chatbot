const chatbot = document.querySelector(".chatbot");
const toggler = document.getElementById("chatbot-toggler");
const closeBtn = document.getElementById("close-chatbot");

const form = document.querySelector(".chat-footer");
const textarea = form.querySelector("textarea");
const chatBody = document.querySelector(".chat-body");

/* ================= API ================= */
const API_KEY = "YOUR_API_KEY_HERE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const chatHistory = [];

/* ================= TOGGLE ================= */
toggler.onclick = () => {
  document.body.classList.toggle("show-chatbot");
};

closeBtn.onclick = () => {
  document.body.classList.remove("show-chatbot");
};

/* ================= MESSAGE CREATE ================= */
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  div.innerHTML = `<div class="msg">${text}</div>`;
  chatBody.appendChild(div);

  chatBody.scrollTop = chatBody.scrollHeight;
}

/* ================= THINKING ================= */
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
  chatBody.scrollTop = chatBody.scrollHeight;

  return div;
}

/* ================= API CALL ================= */
async function generateResponse(userMessage, typingDiv) {
  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error.message);

    const reply = data.candidates[0].content.parts[0].text;

    typingDiv.remove();
    addMessage(reply, "bot");

    chatHistory.push({
      role: "model",
      parts: [{ text: reply }],
    });

  } catch (err) {
    typingDiv.remove();
    addMessage("Error: " + err.message, "bot");
  }
}

/* ================= SEND ================= */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = textarea.value.trim();
  if (!message) return;

  addMessage(message, "user");
  textarea.value = "";

  const typingDiv = showTyping();

  generateResponse(message, typingDiv);
});

/* ================= ENTER KEY ================= */
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});
