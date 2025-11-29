import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    edited: {type: Boolean, default: false }
});

messageSchema.set("toJSON", {
    transform: function (doc, ret){
        delete ret.__v;
        return ret;
    }
});

export default mongoose.model("Message", messageSchema);