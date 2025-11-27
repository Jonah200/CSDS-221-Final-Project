<template>
  <div class="auth-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <router-link to="/signup">Sign up</router-link></p>
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../api/axios.js";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const error = ref(null);
const router = useRouter();

const login = async () => {
  error.value = null;
  try {
    const res = await api.post("/api/auth/login", {
      username: username.value,
      password: password.value,
    });
    localStorage.setItem("token", res.data.token);
    router.push("/chat");
  } catch (err) {
    error.value = err.response?.data?.message || "Login failed";
  }
};
</script>

<style>
.auth-container { max-width: 400px; margin: 50px auto; display:flex; flex-direction:column; gap:10px; }
input { padding: 8px; font-size: 16px; width:100%; }
button { padding: 10px; font-size:16px; cursor:pointer; }
</style>
