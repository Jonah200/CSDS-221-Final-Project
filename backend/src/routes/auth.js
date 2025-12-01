import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { generateAccessToken, generateRefreshTokenString } from "../utils/tokens.js";
import "dotenv/config";

const router = express.Router();
const REFRESH_TOKEN_TTL_DAYS = 7;
const REFRESH_COOKIE_NAME = "jid";

async function createAndSetRefreshToken(user, res, req) {
    const tokenString = generateRefreshTokenString();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    const rt = new RefreshToken({
        token: tokenString,
        user: user._id,
        expiresAt,
    });
    await rt.save();

    const cookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        path: "/api/auth",
    };

    res.cookie(REFRESH_COOKIE_NAME, tokenString, cookieOptions);
    return rt;
}


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

        const accessToken = generateAccessToken({ id: user._id });

        await createAndSetRefreshToken(user, res, req);

        res.json({ accessToken, username: user.username, userId: user._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/refresh", async (req, res) => {
    try{
        const tokenFromCookie = req.cookies[REFRESH_COOKIE_NAME];
        if(!tokenFromCookie) return res.status(401).json({ message: "No Refresh token" });

        const stored = await RefreshToken.findOne({ token: tokenFromCookie }).populate("user");

        if(!stored) return res.status(401).json({ message: "Invalid refresh token" });

        if(stored.revoked || stored.isExpired){
            await RefreshToken.updateMany({ user: stored.user._id }, { revoked: true });
            return res.status(401).json({ message: "Refresh token revoked "});
        }
        const newRtString = generateRefreshTokenString();
        const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

        const newRt = new RefreshToken({
            token: newRtString,
            user: stored.user._id,
            expiresAt: newExpiresAt,
        });
        await newRt.save();

        stored.revoked = true;
        stored.replacedByToken = newRtString;
        await stored.save();

        const cookieOptions = {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            expires: newExpiresAt,
            path: "/api/auth",
        };
        res.cookie(REFRESH_COOKIE_NAME, newRtString, cookieOptions);

        const accessToken = generateAccessToken({ id: stored.user._id });

        res.json({ accessToken, username: stored.user.username, id: stored.user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/logout", async (req, res) => {
    try{
        const tokenFromCookie = req.cookies[REFRESH_COOKIE_NAME];
        if(tokenFromCookie) {
            await RefreshToken.deleteOne({ token: tokenFromCookie });
        }
        res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
        res.json({ message: "Logged out" });
    } catch (err){
        res.status(500).json({ message: err.message });
    }
});

//TODO: Cleanup old RefreshTokens

export default router;