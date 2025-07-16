import app from "./app";
import dotenv from "dotenv";

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    process.exit(1);
});
console.log("Starting Biz-Suite backend...");

//load Env variables
dotenv.config();

const port = process.env.PORT || 3000;
console.log("port Number: ", port);

app.listen(port, () => {
    console.log(`🚀Server running on http://localhost:${port}`);
    console.log(`📚 API Docs running on http://localhost:${port}/api-docs/`);
});
