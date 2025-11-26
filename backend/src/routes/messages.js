import express from "express";
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) return res.status(401).json({ message: "No authorization"});

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET).id;
        next();
    } catch {
        res.status(401).json({ message: "Invalid authorization token" });
    }
};

router.get("/", async (req, res) => {
    const messages = await Message.find().populate("user", "username").sort({ createdAt: 1 });
    res.json(messages);
});

router.post("/", auth, async (req, res) => {
    const { content } = req.body;
    try {
        const message = new Message({ user: req.user, content });
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;