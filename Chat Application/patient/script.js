const socket = io();
const sendSound = new Audio('send.mp3');
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chat-box");
const typingIndicator = document.getElementById('typing-indicator');
let typingTimeout;

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
      socket.emit("chatMessage", { message, from: socket.id });
      addMessage("You", message, "sender");
      messageInput.value = "";
      sendSound.play();
    }
  }
  
  // Add message to chat box
  function addMessage(username, msg, type) {
    const div = document.createElement("div");
    div.classList.add("message", type);
    div.innerHTML = `<strong>${username}:</strong> ${msg}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  
    if (type === "receiver") {
      popSound.play();
    }
  }
  
  // Listen for incoming chat message
  socket.on("chatMessage", ({ message, from }) => {
    if (from !== socket.id) {
      addMessage("User", message, "receiver");
    }
  });
  
  // Typing event: user starts typing
  messageInput.addEventListener("input", () => {
    socket.emit("typing");
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stopTyping");
    }, 1000);
  });
  
  // Show typing indicator
  socket.on("userTyping", () => {
    typingIndicator.textContent = "User is typing...";
  });
  
  // Hide typing indicator
  socket.on("userStoppedTyping", () => {
    typingIndicator.textContent = "";
  });