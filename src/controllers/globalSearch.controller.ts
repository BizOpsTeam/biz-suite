import { Request, Response } from "express";
import { globalSearch, quickSearch, getSearchSuggestions } from "../services/globalSearch.service";
import catchErrors from "../utils/catchErrors";

export const globalSearchHandler = catchErrors(
    async (req: Request, res: Response) => {
        const { q: query, limit, types, includeArchived } = req.query;
        const ownerId = (req as any).user?.id;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        if (query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters long",
            });
        }

        const searchLimit = limit ? parseInt(limit as string, 10) : 20;
        const searchTypes = types ? (types as string).split(',') : [];
        const searchIncludeArchived = includeArchived === 'true';

        const results = await globalSearch({
            query: query.trim(),
            ownerId,
            limit: Math.min(searchLimit, 50), // Cap at 50 results
            types: searchTypes,
            includeArchived: searchIncludeArchived,
        });

        return res.json({
            success: true,
            data: results,
            meta: {
                query: query.trim(),
                total: results.length,
                limit: searchLimit,
                types: searchTypes,
            },
        });
    },
);

export const quickSearchHandler = catchErrors(
    async (req: Request, res: Response) => {
        const { q: query } = req.query;
        const ownerId = (req as any).user?.id;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        if (query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters long",
            });
        }

        const results = await quickSearch(query.trim(), ownerId);

        return res.json({
            success: true,
            data: results,
            meta: {
                query: query.trim(),
                total: results.length,
            },
        });
    },
);

export const searchSuggestionsHandler = catchErrors(
    async (req: Request, res: Response) => {
        const { q: query } = req.query;
        const ownerId = (req as any).user?.id;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        if (query.trim().length < 1) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        const suggestions = await getSearchSuggestions(query.trim(), ownerId);

        return res.json({
            success: true,
            data: suggestions,
            meta: {
                query: query.trim(),
                total: suggestions.length,
            },
        });
    },
);
