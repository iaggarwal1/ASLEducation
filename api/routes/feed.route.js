import express from "express";
import { frames } from "../controllers/feed.controller.js";

const router = express.Router();

router.post("/send-frames", frames)

export default router;