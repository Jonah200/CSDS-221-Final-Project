import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";

const app = express();
app.use(cors());
app.use(express.json());

let clients = [];

app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const client = {
        id: Date.now(),
        res,
    };
    clients.push(client);
    console.log("Client connected:", client.id);

    req.on("close", () => {
        clients = clients.filter(c => c.id !== client.id);
    });
});

export function broadcastMessage(msg) {
    clients.forEach(c => c.res.write(`data: ${JSON.stringify(msg)}\n\n`));
}

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

export default app;