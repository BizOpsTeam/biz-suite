import { Router } from "express";
import {
    getTopProductsHandler,
    getSalesOverTimeHandler,
    getSalesByChannelHandler,
    getSalesByPaymentMethodHandler,
    getTopCustomersHandler,
    getAverageOrderValueHandler,
    getDiscountImpactHandler,
    getStockoutsHandler,
    getSlowMovingInventoryHandler,
    getSalesForecastHandler,
    getProductSalesForecastHandler,
    getStockoutForecastHandler,
    getSeasonalityHandler,
    getProfitAndLossHandler,
    getRevenueForecastHandler,
} from "../controllers/analytics.controller";

const analyticsRoutes = Router();

analyticsRoutes.get("/top-products", getTopProductsHandler);
analyticsRoutes.get("/sales-over-time", getSalesOverTimeHandler);
analyticsRoutes.get("/sales-by-channel", getSalesByChannelHandler);
analyticsRoutes.get("/sales-by-payment-method", getSalesByPaymentMethodHandler);
analyticsRoutes.get("/top-customers", getTopCustomersHandler);
analyticsRoutes.get("/average-order-value", getAverageOrderValueHandler);
analyticsRoutes.get("/discount-impact", getDiscountImpactHandler);
analyticsRoutes.get("/stockouts", getStockoutsHandler);
analyticsRoutes.get("/slow-moving-inventory", getSlowMovingInventoryHandler);
analyticsRoutes.get("/forecast/sales", getSalesForecastHandler);
analyticsRoutes.get("/forecast/product-sales", getProductSalesForecastHandler);
analyticsRoutes.get("/forecast/stockouts", getStockoutForecastHandler);
analyticsRoutes.get("/forecast/seasonality", getSeasonalityHandler);
analyticsRoutes.get("/profit-loss", getProfitAndLossHandler);
analyticsRoutes.get("/revenue-forecast", getRevenueForecastHandler);

export default analyticsRoutes;
