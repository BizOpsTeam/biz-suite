import { Router } from "express";
import {
    globalSearchHandler,
    quickSearchHandler,
    searchSuggestionsHandler,
} from "../controllers/globalSearch.controller";

const globalSearchRoutes = Router();

// Main global search endpoint
globalSearchRoutes.get("/", globalSearchHandler);

// Quick search for recent/frequent items
globalSearchRoutes.get("/quick", quickSearchHandler);

// Search suggestions for autocomplete
globalSearchRoutes.get("/suggestions", searchSuggestionsHandler);

export default globalSearchRoutes;
