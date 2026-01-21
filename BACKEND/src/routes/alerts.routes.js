import { Router } from "express";
import { getAlerts } from "../controllers/alert.controller.js";

const router = Router();

// GET /alerts - Retrieve all alerts
router.get("/", getAlerts);

