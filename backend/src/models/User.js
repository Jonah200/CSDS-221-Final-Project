import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

userSchema.set("toJSON", {
    transform: function (doc, ret){
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export default mongoose.model("User", userSchema);