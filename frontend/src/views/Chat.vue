<template>
  <div class="chat-container">
    <h2>Chat Room</h2>
    <div class="absolute top-2 right-2">
      <v-btn variant="text" @click="logout">
      <v-icon>mdi-logout</v-icon>
      </v-btn>
    </div>
    <!-- Messages -->
    <div class="messages" ref="messagesContainer">
      <MessageCard v-for="(msg, index) in messages" :key="msg._id" :message="msg.content" :sender="msg.user.username"
        :timestamp="msg.createdAt" :edited="msg.edited" :alt="index %2 === 0">

        <template v-if="editingMessageId === msg._id" #default>
          <v-text-field
            v-model="editingText"
            dense
            outlined
            hide-details
          />
        </template>

        <!-- Scoped slot for buttons -->
        <template #actions>
          <v-btn v-if="msg.user._id === userId && editingMessageId !== msg._id" variant="text" color="blue"
            @click="startEdit(msg)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>

          <v-btn v-if="msg.user._id === userId && editingMessageId === msg._id" variant="text" color="green"
            @click="confirmEdit(msg)">
            <v-icon>mdi-check</v-icon>
          </v-btn>

          <v-btn v-if="msg.user._id === userId && editingMessageId === msg._id" variant="text" color="blue"
            @click="cancelEdit()">
            <v-icon>mdi-cancel</v-icon>
          </v-btn>

          <v-btn v-if="msg.user._id === userId" variant="text" color="red" @click="deleteMessage(msg._id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>

        </template>
      </MessageCard>
    </div>

    <!-- Message Input -->
    <form @submit.prevent="sendMessage" class="message-form">
      <textarea v-model="newMessage" placeholder="Type a message..." style="resize:none;" rows="2" />
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import api from "../api/axios.js";
import { useRouter } from "vue-router";
import MessageCard from "../components/MessageCard.vue";
import toastr from "toastr";

const messages = ref([]);
const newMessage = ref("");
const userId = ref(null);
const editingMessageId = ref(null);
const editingText = ref("");
const router = useRouter();
const messagesContainer = ref(null);
const autoScroll = ref(true);
let eventSource = null;

const savedUserId = localStorage.getItem("userId");
if (!savedUserId) router.push("/login");
userId.value = savedUserId;
// Fetch current user ID from JWT

const handleScroll = () => {
  const el = messagesContainer.value;
  if(!el) return;
  const threshold = 50;
  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeigth;
  autoScroll.value = distanceFromBottom < threshold;
}

const scrollToBottom = () => {
  const el = messagesContainer.value;
  if(!el) return;
  el.scrollTop = el.scrollHeight;
};

// Fetch initial messages
const fetchMessages = async () => {
  try {
    const res = await api.get("/api/messages");
    messages.value = res.data;
  } catch (err) {
    toastr.error("Could not fetch messages");
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
    );
    newMessage.value = "";
  } catch (err) {
    toastr.error("Failed to send message");
    console.error(err);
  }
};

// Delete message
const deleteMessage = async (id) => {
  try {
    await api.delete(`/api/messages/${id}`, {
    });
    toastr.success("Message deleted");
  } catch (err) {
    toastr.error("Failed to delete message");
    console.error(err);
  }
};

const startEdit = (msg) => {
  editingMessageId.value = msg._id;
  editingText.value = msg.content;
}

const cancelEdit = (msg) => {
  editingMessageId.value = null;
  editingText.value = "";
}

const confirmEdit = async (msg) => {
  const newContent = editingText.value.trim();

  if(!newContent) return;

  try{
    await api.put(`/api/messages/${msg._id}`, { content: newContent }, {
    });
    editingMessageId.value = null;
    editingText.value = "";
    toastr.success("Message Edited");
  } catch (err) {
    toastr.error("Failed to edit message");
  }
}

// SSE: subscribe to events
const subscribeSSE = () => {
  eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/events`);

  eventSource.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "new":
        messages.value.push(data.message);
        await nextTick();
        if(autoScroll.value) scrollToBottom();
        break;
      case "delete":
        messages.value = messages.value.filter((m) => m._id !== data.messageId);
        break;
      case "edit":
        messages.value = messages.value.map(m => m._id === data.message._id ? data.message : m);
        break;
      default:
        console.error(`Invalid SSE Recieve ${data}`);
    }
  };
};

async function logout(){
  try{
    await api.post("/api/auth/logout");
    userId.value = null;
    localStorage.removeItem("userId");
  }catch(err){
    console.error("Logout error: ", err);
  } finally {
    router.push("/login");
  }
}

onMounted(() => {
  fetchMessages();
  subscribeSSE();
  if(messagesContainer.value) {
    messagesContainer.value.addEventListener("scroll", handleScroll);
  }
});

onUnmounted(() => {
  if (eventSource) eventSource.close();
});
</script>

<style>
.chat-container {
  width: 80rem;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.messages {
  border: 1px solid #ccc;
  background-color: #303030;
  padding: 10px;
  height: 450px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.message {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-form {
  display: flex;
  gap: 5px;
}

textarea {
  flex: 1;
  padding: 8px;
  font-size: 16px;
}

v-btn {
  padding: 8px 12px;
  font-size: 16px;
  cursor: pointer;
}
</style>
