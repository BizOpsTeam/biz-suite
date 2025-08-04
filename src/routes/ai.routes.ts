import { Router } from "express";
import {
    analyzeQueryHandler,
    generateInsightsHandler,
    predictTrendsHandler,
    generateRecommendationsHandler,
    getAIDashboardHandler,
} from "../controllers/ai.controller";

const router = Router();

// AI Analysis routes
router.post("/analyze", analyzeQueryHandler);
router.get("/insights", generateInsightsHandler);
router.get("/predictions", predictTrendsHandler);
router.get("/recommendations", generateRecommendationsHandler);
router.get("/dashboard", getAIDashboardHandler);

export default router; 