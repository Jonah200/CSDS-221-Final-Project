import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    replacedByToken: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

refreshTokenSchema.virtual("isExpired").get(function  () {
    return Date.now() >= this.expiresAt.getTime();
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RefreshToken", refreshTokenSchema);