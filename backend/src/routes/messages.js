import express from "express";
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";
import { broadcastMessage } from "../app.js";

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
        const populated = await message.populate("user", "username");
        
        broadcastMessage({ type: "new", message: populated });

        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
;

router.delete("/:id", auth, async (req, res) => {
    const { id } = req.params;

    try {
        const message = await Message.findById(id);

        if(!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if(message.user.toString() !== req.user) {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        await message.deleteOne();

        broadcastMessage({ type: "delete", messageId: id });

        res.json({ message: "Message deleted", id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/:id", auth, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const message = await Message.findById(id);
        if(!message){
            return res.status(404).json({ message: "Message not found" });
        }

        if(message.user.toString() !== req.user){
            console.log(message.user.toString());
            console.log(req.user);
            return res.status(403).json({ message: "Not authorized to edit this message" });
        }

        const updateMessage = await Message.findOneAndUpdate({ _id: id }, { content: content, edited: true }, { new: true }).exec();
        const fullNewMessage = await updateMessage.populate("user", "username");

        broadcastMessage({ type: "edit", message: fullNewMessage });

        res.json({ message: "Updated message", id: id });
    } catch(err){
        res.status(500).json({ message: err.message });
    }
});

export default router;