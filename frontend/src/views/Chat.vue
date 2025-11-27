<template>
  <div class="chat-container">
    <h2>Chat Room</h2>

    <div class="messages">
      <div v-for="msg in messages" :key="msg._id" class="message">
        <strong>{{ msg.user.username }}:</strong> {{ msg.content }}
        <button v-if="msg.user._id === userId" @click="deleteMessage(msg._id)">Delete</button>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="message-form">
      <input v-model="newMessage" placeholder="Type a message..." />
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import api from "../api/axios.js";
import { useRouter } from "vue-router";

const messages = ref([]);
const newMessage = ref("");
const userId = ref(null);
const router = useRouter();
let eventSource = null;

const token = localStorage.getItem("token");
if (!token) router.push("/login");

// Fetch current user ID from JWT
try {
  userId.value = JSON.parse(atob(token.split(".")[1])).id;
} catch (err) {
  console.error("Invalid token");
}

// Fetch initial messages
const fetchMessages = async () => {
  try {
    const res = await api.get("/api/messages");
    messages.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

// Send a new message
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    await api.post(
      "/api/messages",
      { content: newMessage.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    newMessage.value = "";
  } catch (err) {
    console.error(err);
  }
};

// Delete message
const deleteMessage = async (id) => {
  try {
    await api.delete(`/api/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error(err);
  }
};

// SSE: subscribe to events
const subscribeSSE = () => {
  eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/events`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "new") {
      messages.value.push(data.message);
    } else if (data.type === "delete") {
      messages.value = messages.value.filter((m) => m._id !== data.messageId);
    }
  };
};

onMounted(() => {
  fetchMessages();
  subscribeSSE();
});

onUnmounted(() => {
  if (eventSource) eventSource.close();
});
</script>

<style>
.chat-container { max-width: 600px; margin: 50px auto; display:flex; flex-direction:column; gap:10px; }
.messages { border:1px solid #ccc; padding:10px; height:400px; overflow-y:auto; display:flex; flex-direction:column; gap:5px; }
.message { display:flex; justify-content: space-between; align-items:center; }
.message-form { display:flex; gap:5px; }
input { flex:1; padding:8px; font-size:16px; }
button { padding:8px 12px; font-size:16px; cursor:pointer; }
</style>
