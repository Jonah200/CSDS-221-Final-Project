<template>
  <div class="auth-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="signup">
      <input v-model="username" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
    <p>Already have an account? <router-link to="/login">Login</router-link></p>
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

const signup = async () => {
  error.value = null;
  try {
    await api.post("/api/auth/register", {
      username: username.value,
      password: password.value,
    });
    router.push("/login");
  } catch (err) {
    error.value = err.response?.data?.message || "Signup failed";
  }
};
</script>

<style>
.auth-container { max-width: 400px; margin: 50px auto; display:flex; flex-direction:column; gap:10px; }
input { padding: 8px; font-size: 16px; width:100%; }
button { padding: 10px; font-size:16px; cursor:pointer; }
</style>
