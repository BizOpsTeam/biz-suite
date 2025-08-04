import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import {
    analyzeQueryHandler,
    generateInsightsHandler,
    predictTrendsHandler,
    generateRecommendationsHandler,
    getAIDashboardHandler,
} from "../controllers/ai.controller";

const router = Router();

// AI Analysis routes
router.post("/analyze", authenticateUser, analyzeQueryHandler);
router.get("/insights", authenticateUser, generateInsightsHandler);
router.get("/predictions", authenticateUser, predictTrendsHandler);
router.get("/recommendations", authenticateUser, generateRecommendationsHandler);
router.get("/dashboard", authenticateUser, getAIDashboardHandler);

export default router; 