<template>
  <div class="auth-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <router-link to="/signup">Sign up</router-link></p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../api/axios.js";
import { useRouter } from "vue-router";
import toastr from 'toastr';

const username = ref("");
const password = ref("");
const router = useRouter();

const login = async () => {
  try {
    const res = await api.post("/api/auth/login", {
      username: username.value,
      password: password.value,
    });
    localStorage.setItem("token", res.data.token);
    toastr.success(`Welcome ${username.value}!`, "Logged In!")
    router.push("/chat");
  } catch (err) {
    toastr.error("Login failed");
  }
};
</script>

<style>
.auth-container { max-width: 400px; margin: 50px auto; display:flex; flex-direction:column; gap:10px; }
input { padding: 8px; font-size: 16px; width:100%; }
button { padding: 10px; font-size:16px; cursor:pointer; }
</style>
