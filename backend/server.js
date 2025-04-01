import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

import TimerRoutes from "./routes/timer.route.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

const _dirname = path.resolve();

app.use("/api/timers", TimerRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(_dirname, "frontend", "dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    connectDB();
    console.log(`Server started at http://localhost:${PORT}`);
});
