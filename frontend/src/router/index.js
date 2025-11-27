import { createRouter, createWebHistory } from "vue-router";
import Signup from "../views/Signup.vue";
import Login from "../views/Login.vue";
import Chat from "../views/Chat.vue";

const routes = [
    { path: "/", redirect: "/login" },
    { path: "/signup", component: Signup },
    { path: "/login", component: Login },
    { path: "/chat", component: Chat },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;