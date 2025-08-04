import { Request, Response } from "express";
import { businessAIService } from "../services/ai.service";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";

/**
 * Analyze natural language business query
 */
export const analyzeQueryHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Unauthorized");

    const { query } = req.body;
    appAssert(query && typeof query === 'string', 400, "Query is required");

    const insight = await businessAIService.analyzeQuery(query, userId);

    res.status(200).json({
        success: true,
        data: insight,
        message: "AI analysis completed successfully"
    });
});

/**
 * Generate automated business insights
 */
export const generateInsightsHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Unauthorized");

    const insights = await businessAIService.generateInsights(userId);

    res.status(200).json({
        success: true,
        data: insights,
        message: "Business insights generated successfully"
    });
});

/**
 * Predict business trends
 */
export const predictTrendsHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Unauthorized");

    const { period = '30' } = req.query;
    const predictions = await businessAIService.predictTrends(userId, period as string);

    res.status(200).json({
        success: true,
        data: predictions,
        message: "Business trends predicted successfully"
    });
});

/**
 * Generate business recommendations
 */
export const generateRecommendationsHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Unauthorized");

    const recommendations = await businessAIService.generateRecommendations(userId);

    res.status(200).json({
        success: true,
        data: recommendations,
        message: "Business recommendations generated successfully"
    });
});

/**
 * Get AI dashboard summary
 */
export const getAIDashboardHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Unauthorized");

    // Generate all types of AI insights
    const [insights, predictions, recommendations] = await Promise.all([
        businessAIService.generateInsights(userId),
        businessAIService.predictTrends(userId, '30'),
        businessAIService.generateRecommendations(userId)
    ]);

    res.status(200).json({
        success: true,
        data: {
            insights: insights.slice(0, 3), // Top 3 insights
            predictions: predictions.slice(0, 2), // Top 2 predictions
            recommendations: recommendations.slice(0, 3) // Top 3 recommendations
        },
        message: "AI dashboard data generated successfully"
    });
}); 