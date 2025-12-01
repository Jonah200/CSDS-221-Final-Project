import app from "./app.js";
import mongoose from "mongoose";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

async function start(){
    try{
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });
    } catch (err){
        console.error("Startup error: ", err);
        process.exit(1);
    }
}

start();

process.on("SIGTERM", async () => {
    console.log("SIGTERM recieved, shutting down db connection...");
    await mongoose.disconnect();
    process.exit(0);
});