import express from "express";
import { createTimer, getTimer, updateTimer } from "../controller/timer.controller.js";

const router = express.Router();

router.post("/", createTimer);
router.get("/:name", getTimer);
router.put("/:name", updateTimer);

export default router;