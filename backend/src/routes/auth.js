import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try{
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: "Username taken" });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashed });
        await user.save();

        res.json({ message: "User created"});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if(!user) return res.status(400).json({ message: "Authentication failed" });

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(400).json({ message: "Authentication failed" });

        const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;