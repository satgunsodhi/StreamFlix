import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

import TimerRoutes from "./routes/timer.route.js";

dotenv.config();  // Assuming .env file is in the root directory

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());

app.use(express.json());

// Allow content to be embedded in iframe (setting headers)
app.use((req, res, next) => {
    // Allow embedding in iframe
    res.setHeader("X-Frame-Options", "ALLOWALL");  // or "SAMEORIGIN" depending on use case
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' *");  // Adjust for cross-origin content
    next();
});

const _dirname = path.resolve();  // Ensure to resolve the correct directory

// Timer routes
app.use("/api/timers", TimerRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    // Serve static files from the frontend build directory
    app.use(express.static(path.join(_dirname, "frontend", "dist")));

    // For any unmatched route, send the index.html to enable client-side routing
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
    });
}

// Listen on the specified port
app.listen(PORT, () => {
    connectDB();
    console.log(`Server started at http://localhost:${PORT}`);
});
