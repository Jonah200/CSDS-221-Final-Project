import crypto from "crypto";
import jwt from "jsonwebtoken";

export function generateRefreshTokenString() {
    return crypto.randomBytes(64).toString("hex");
}

export function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
}