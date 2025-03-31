import express from "express";
import path from "path";
import {connectDB} from "./config/db.js";
import dotenv from "dotenv";

// import productRoutes from "./routes/product.route.js";
dotenv.config({path: "../.env"});

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const _dirname = path.resolve();

app.use(express.json());

// app.use("/api/products/", productRoutes);

if(process.env.NODE_ENV ===  "production") {
    app.use(express.static(path.join(_dirname, "/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(_dirname, "dist", "index.html"));
    })
}

app.listen(PORT, () => {
    connectDB();
    console.log("Server Started at http://localhost:" + PORT);
})