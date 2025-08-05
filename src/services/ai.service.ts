import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { configDotenv } from 'dotenv';
import prisma from '../config/db';

configDotenv();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

// Types for AI responses
export interface AIInsight {
    id: string;
    type: 'analysis' | 'prediction' | 'recommendation' | 'alert' | 'trend';
    title: string;
    description: string;
    confidence: number;
    data: any;
    timestamp: Date;
    actionable: boolean;
    category: 'sales' | 'customers' | 'inventory' | 'financial' | 'general';
    content?: string; // Add content field for clean responses
    markdown?: string; // Add markdown field
}

export interface AIQuery {
    query: string;
    context: 'sales' | 'customers' | 'inventory' | 'financial' | 'general';
    response: AIInsight;
}

export interface BusinessMetrics {
    totalSales: number;
    totalCustomers: number;
    totalProducts: number;
    totalExpenses: number;
    profitMargin: number;
    averageOrderValue: number;
    topProducts: any[];
    topCustomers: any[];
    recentTransactions: any[];
    inventoryAlerts: any[];
}

class BusinessAIService {
    private model: GenerativeModel;

    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }

    /**
     * Analyze natural language business queries
     */
    async analyzeQuery(query: string, userId: string): Promise<AIInsight> {
        try {
            // Check if API key is set
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY environment variable is not set');
            }

            // Fetch business data
            const businessData = await this.getBusinessData(userId);

            // Build AI prompt
            const prompt = this.buildAnalysisPrompt(query, businessData);

            // Generate AI response
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse and structure the response
            return this.parseAIResponse(text);
        } catch (error) {
            console.error('AI Analysis Error:', error);

            // Return a fallback response if AI fails
            return {
                id: Date.now().toString(),
                type: 'analysis',
                title: 'Analysis Unavailable',
                description: 'AI analysis is currently unavailable. Please check your API configuration.',
                confidence: 0,
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
                timestamp: new Date(),
                actionable: false,
                category: 'general'
            };
        }
    }

    /**
     * Generate automated business insights
     */
    async generateInsights(userId: string): Promise<AIInsight[]> {
        try {
            // Check if API key is set
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY environment variable is not set');
            }

            const businessData = await this.getBusinessData(userId);
            const prompt = this.buildInsightsPrompt(businessData);

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseInsightsResponse(text);
        } catch (error) {
            console.error('AI Insights Error:', error);

            // Return fallback insights
            return [{
                id: Date.now().toString(),
                type: 'analysis',
                title: 'Insights Unavailable',
                description: 'AI insights are currently unavailable. Please check your API configuration.',
                confidence: 0,
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
                timestamp: new Date(),
                actionable: false,
                category: 'general'
            }];
        }
    }

    /**
     * Predict business trends
     */
    async predictTrends(userId: string, period: string = '30'): Promise<AIInsight[]> {
        try {
            // Check if API key is set
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY environment variable is not set');
            }

            const historicalData = await this.getHistoricalData(userId, period);
            const prompt = this.buildPredictionPrompt(historicalData);

            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            return this.parsePredictionResponse(text);
        } catch (error) {
            console.error('AI Predictions Error:', error);

            // Return fallback predictions
            return [{
                id: Date.now().toString(),
                type: 'prediction',
                title: 'Predictions Unavailable',
                description: 'AI predictions are currently unavailable. Please check your API configuration.',
                confidence: 0,
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
                timestamp: new Date(),
                actionable: false,
                category: 'general'
            }];
        }
    }

    /**
     * Generate business recommendations
     */
    async generateRecommendations(userId: string): Promise<AIInsight[]> {
        try {
            // Check if API key is set
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY environment variable is not set');
            }

            const businessData = await this.getBusinessData(userId);
            const prompt = this.buildRecommendationsPrompt(businessData);

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseRecommendationsResponse(text);
        } catch (error) {
            console.error('AI Recommendations Error:', error);

            // Return fallback recommendations
            return [{
                id: Date.now().toString(),
                type: 'recommendation',
                title: 'Recommendations Unavailable',
                description: 'AI recommendations are currently unavailable. Please check your API configuration.',
                confidence: 0,
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
                timestamp: new Date(),
                actionable: false,
                category: 'general'
            }];
        }
    }

    /**
     * Get comprehensive business data for AI analysis
     */
    private async getBusinessData(userId: string): Promise<BusinessMetrics> {
        const [
            sales,
            customers,
            products,
            expenses,
            topProducts,
            topCustomers,
            recentTransactions,
            inventoryAlerts
        ] = await Promise.all([
            this.getSalesData(userId),
            this.getCustomersData(userId),
            this.getProductsData(userId),
            this.getExpensesData(userId),
            this.getTopProducts(userId),
            this.getTopCustomers(userId),
            this.getRecentTransactions(userId),
            this.getInventoryAlerts(userId)
        ]);

        const totalSales = sales.totalAmount || 0;
        const totalExpenses = expenses.totalAmount || 0;
        const profitMargin = totalSales > 0 ? ((totalSales - totalExpenses) / totalSales) * 100 : 0;
        const averageOrderValue = sales.totalOrders > 0 ? totalSales / sales.totalOrders : 0;

        return {
            totalSales,
            totalCustomers: customers.total || 0,
            totalProducts: products.total || 0,
            totalExpenses,
            profitMargin,
            averageOrderValue,
            topProducts,
            topCustomers,
            recentTransactions,
            inventoryAlerts
        };
    }

    /**
     * Get historical data for trend analysis
     */
    private async getHistoricalData(userId: string, days: string): Promise<any> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const sales = await prisma.sale.findMany({
            where: {
                ownerId: userId,
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                totalAmount: true,
                createdAt: true,
                saleItems: {
                    select: {
                        quantity: true,
                        price: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return sales;
    }

    /**
     * Build AI prompt for business analysis
     */
    private buildAnalysisPrompt(query: string, businessData: BusinessMetrics): string {
        return `
You are a helpful business intelligence AI assistant. Analyze the following business data and provide a clear, conversational answer to the user's question.

## Business Data
- **Total Sales**: $${businessData.totalSales.toFixed(2)}
- **Total Customers**: ${businessData.totalCustomers}
- **Total Products**: ${businessData.totalProducts}
- **Total Expenses**: $${businessData.totalExpenses.toFixed(2)}
- **Profit Margin**: ${businessData.profitMargin.toFixed(2)}%
- **Average Order Value**: $${businessData.averageOrderValue.toFixed(2)}

## Top Products
${businessData.topProducts.slice(0, 5).map(p => `- ${p.name}: $${p.totalSales} (${p.quantitySold} sold)`).join('\n')}

## Recent Transactions
${businessData.recentTransactions.slice(0, 5).map(t => `- ${t.date}: $${t.amount} - ${t.status}`).join('\n')}

## User Question
"${query}"

## Instructions
Provide a clear, conversational response that directly answers the user's question. Focus on being helpful and actionable. Write as if you're having a conversation with a business owner who wants straightforward insights.

Your response should be:
1. Direct and conversational
2. Easy to understand
3. Actionable when possible
4. Based on the actual data provided
5. Honest about limitations when data is insufficient

Do NOT include YAML frontmatter, JSON blocks, or complex formatting. Just provide a clean, readable response that a business owner would find useful.
`;
    }

/**
 * Build AI prompt for automated insights
 */
private buildInsightsPrompt(businessData: BusinessMetrics): string {
    return `
You are a helpful business intelligence AI assistant. Analyze this business data and provide clear, actionable insights.

## Business Data

### Key Metrics
- **Total Sales**: $${businessData.totalSales.toFixed(2)}
- **Total Customers**: ${businessData.totalCustomers}
- **Total Products**: ${businessData.totalProducts}
- **Total Expenses**: $${businessData.totalExpenses.toFixed(2)}
- **Profit Margin**: ${businessData.profitMargin.toFixed(2)}%
- **Average Order Value**: $${businessData.averageOrderValue.toFixed(2)}

### Top Products
${businessData.topProducts.slice(0, 5).map(p => `- ${p.name}: ${p.quantity} units ($${p.revenue})`).join('\n')}

### Top Customers
${businessData.topCustomers.slice(0, 5).map(c => `- ${c.name}: $${c.totalSpent} (${c.orderCount} orders)`).join('\n')}

### Recent Activity
${businessData.recentTransactions.slice(0, 5).map(t => 
    `- ${t.date}: ${t.type} - $${t.amount} (${t.status})`
).join('\n')}

## Instructions

Provide 3-5 key insights based on this data, focusing on:
1. Sales performance and trends
2. Customer behavior and patterns
3. Product performance
4. Financial health
5. Growth opportunities

Write in a clear, conversational tone that a business owner would find easy to understand. Focus on being helpful and actionable. Do NOT include YAML frontmatter, JSON blocks, or complex formatting. Just provide clean, readable insights.`;
}

/**
 * Build AI prompt for trend predictions
 */
private buildPredictionPrompt(historicalData: any[]): string {
    return `
You are a helpful business intelligence AI assistant. Analyze this historical sales data and provide clear predictions about future trends.

Historical Sales Data (last 30 days):
${JSON.stringify(historicalData.slice(0, 10))}

Provide predictions for:
1. Sales trends for the next 30 days
2. Seasonal patterns
3. Growth opportunities
4. Potential risks

Write in a clear, conversational tone that a business owner would find easy to understand. Be honest about the limitations of the data and provide actionable insights where possible. Do NOT include YAML frontmatter, JSON blocks, or complex formatting. Just provide clean, readable predictions.
`;
    }

    /**
     * Build AI prompt for business recommendations
     */
    private buildRecommendationsPrompt(businessData: BusinessMetrics): string {
        return `
You are a helpful business intelligence AI assistant. Analyze this business data and provide clear, actionable recommendations.

Business Data:
- Total Sales: $${businessData.totalSales.toFixed(2)}
- Total Customers: ${businessData.totalCustomers}
- Total Products: ${businessData.totalProducts}
- Total Expenses: $${businessData.totalExpenses.toFixed(2)}
- Profit Margin: ${businessData.profitMargin.toFixed(2)}%
- Average Order Value: $${businessData.averageOrderValue.toFixed(2)}

Top Products: ${JSON.stringify(businessData.topProducts.slice(0, 5))}
Top Customers: ${JSON.stringify(businessData.topCustomers.slice(0, 5))}

Provide recommendations for:
1. Increasing sales and revenue
2. Improving customer retention
3. Optimizing inventory management
4. Reducing costs and expenses
5. Business growth strategies

Write in a clear, conversational tone that a business owner would find easy to understand. Focus on practical, actionable advice. Do NOT include YAML frontmatter, JSON blocks, or complex formatting. Just provide clean, readable recommendations.`;
    }





    /**
     * Parse AI response for single query
     */
    private parseAIResponse(response: string): AIInsight {
        // Clean the response by removing any YAML frontmatter or JSON blocks
        const cleanResponse = this.cleanAIResponse(response);
        
        return {
            id: Date.now().toString(),
            type: 'analysis',
            title: 'AI Analysis',
            description: 'Analysis of your business query',
            confidence: 85,
            data: {
                content: cleanResponse,
                analysis: cleanResponse
            },
            timestamp: new Date(),
            actionable: true,
            category: 'general',
            content: cleanResponse
        };
    }

    /**
     * Clean AI response by removing YAML/JSON formatting
     */
    private cleanAIResponse(response: string): string {
        // Remove YAML frontmatter
        let cleaned = response.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/g, '');
        
        // Remove JSON code blocks
        cleaned = cleaned.replace(/```json\s*\n[\s\S]*?\n```/g, '');
        
        // Remove YAML code blocks
        cleaned = cleaned.replace(/```yaml\s*\n[\s\S]*?\n```/g, '');
        
        // Remove any remaining code blocks
        cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
        
        // Clean up extra whitespace and newlines
        cleaned = cleaned.trim().replace(/\n\s*\n\s*\n/g, '\n\n');
        
        return cleaned;
    }

    /**
     * Parse AI response for multiple insights
     */
    private parseInsightsResponse(response: string): AIInsight[] {
        try {
            // Clean the response
            const cleanResponse = this.cleanAIResponse(response);
            
            // Split the response into individual insights (assuming they're separated by headers)
            const insights = cleanResponse.split(/(?=^#+\s)/m).filter(insight => insight.trim().length > 0);
            
            if (insights.length > 0) {
                return insights.map((insight, index) => ({
                    id: (Date.now() + index).toString(),
                    type: 'analysis' as const,
                    title: `Business Insight ${index + 1}`,
                    description: 'Automated business insight',
                    confidence: 85,
                    data: {
                        content: insight.trim(),
                        analysis: insight.trim()
                    },
                    timestamp: new Date(),
                    actionable: true,
                    category: 'general' as const,
                    content: insight.trim()
                }));
            }
            
            // If no clear insights found, return the whole response as one insight
            return [{
                id: Date.now().toString(),
                type: 'analysis',
                title: 'Business Insights',
                description: 'Analysis of your business data',
                confidence: 85,
                data: {
                    content: cleanResponse,
                    analysis: cleanResponse
                },
                timestamp: new Date(),
                actionable: true,
                category: 'general',
                content: cleanResponse
            }];
            
        } catch (error) {
            console.error('Error parsing insights response:', error);
            return [{
                id: Date.now().toString(),
                type: 'analysis',
                title: 'Insights Unavailable',
                description: 'Failed to parse insights',
                confidence: 0,
                data: { 
                    error: error instanceof Error ? error.message : 'Invalid response format',
                    rawResponse: response
                },
                timestamp: new Date(),
                actionable: false,
                category: 'general'
            }];
        }
    }

    /**
     * Parse AI response for predictions
     */
    private parsePredictionResponse(response: string): AIInsight[] {
        try {
            const cleanResponse = this.cleanAIResponse(response);
            
            // Split the response into individual predictions
            const predictions = cleanResponse.split(/(?=^#+\s)/m).filter(prediction => prediction.trim().length > 0);
            
            if (predictions.length > 0) {
                return predictions.map((prediction, index) => ({
                    id: (Date.now() + index).toString(),
                    type: 'prediction' as const,
                    title: `Business Prediction ${index + 1}`,
                    description: 'Trend prediction based on historical data',
                    confidence: 75,
                    data: {
                        content: prediction.trim(),
                        analysis: prediction.trim()
                    },
                    timestamp: new Date(),
                    actionable: true,
                    category: 'general' as const,
                    content: prediction.trim()
                }));
            }
            
            return [{
                id: Date.now().toString(),
                type: 'prediction',
                title: 'Business Predictions',
                description: 'Predictions based on your business data',
                confidence: 75,
                data: {
                    content: cleanResponse,
                    analysis: cleanResponse
                },
                timestamp: new Date(),
                actionable: true,
                category: 'general',
                content: cleanResponse
            }];
            
        } catch (error) {
            console.error('Error parsing predictions response:', error);
            return [{
                id: Date.now().toString(),
                type: 'prediction',
                title: 'Predictions Unavailable',
                description: 'Failed to parse predictions',
                confidence: 0,
                data: { 
                    error: error instanceof Error ? error.message : 'Invalid response format',
                    rawResponse: response
                },
                timestamp: new Date(),
                actionable: false,
                category: 'general'
            }];
        }
    }

    /**
     * Parse AI response for recommendations
     */
    private parseRecommendationsResponse(response: string): AIInsight[] {
        try {
            const cleanResponse = this.cleanAIResponse(response);
            
            // Split the response into individual recommendations
            const recommendations = cleanResponse.split(/(?=^#+\s)/m).filter(rec => rec.trim().length > 0);
            
            if (recommendations.length > 0) {
                return recommendations.map((recommendation, index) => ({
                    id: (Date.now() + index).toString(),
                    type: 'recommendation' as const,
                    title: `Business Recommendation ${index + 1}`,
                    description: 'Actionable business recommendation',
                    confidence: 85,
                    data: {
                        content: recommendation.trim(),
                        analysis: recommendation.trim()
                    },
                    timestamp: new Date(),
                    actionable: true,
                    category: 'general' as const,
                    content: recommendation.trim()
                }));
            }
            
            return [{
                id: Date.now().toString(),
                type: 'recommendation',
                title: 'Business Recommendations',
                description: 'Recommendations based on your business data',
                confidence: 85,
                data: {
                    content: cleanResponse,
                    analysis: cleanResponse
                },
                timestamp: new Date(),
                actionable: true,
                category: 'general',
                content: cleanResponse
            }];
            
        } catch (error) {
            console.error('Error parsing recommendations response:', error);
            return [{
                id: Date.now().toString(),
                type: 'recommendation',
                title: 'Recommendations Unavailable',
                description: 'Failed to parse recommendations',
                confidence: 0,
                data: { 
                    error: error instanceof Error ? error.message : 'Invalid response format',
                    rawResponse: response
                },
                timestamp: new Date(),
                actionable: false,
                category: 'general'
            }];
        }
    }

    // Data fetching methods
    private async getSalesData(userId: string) {
        const sales = await prisma.sale.aggregate({
            where: { ownerId: userId },
            _sum: { totalAmount: true },
            _count: { id: true }
        });

        return {
            totalAmount: sales._sum?.totalAmount || 0,
            totalOrders: sales._count?.id || 0
        };
    }

    private async getCustomersData(userId: string) {
        const customers = await prisma.customer.aggregate({
            where: { ownerId: userId },
            _count: { id: true }
        });

        return { total: customers._count?.id || 0 };
    }

    private async getProductsData(userId: string) {
        const products = await prisma.product.aggregate({
            where: { ownerId: userId },
            _count: { id: true }
        });

        return { total: products._count?.id || 0 };
    }

    private async getExpensesData(userId: string) {
        const expenses = await prisma.expense.aggregate({
            where: { ownerId: userId },
            _sum: { amount: true }
        });

        return { totalAmount: expenses._sum?.amount || 0 };
    }

    private async getTopProducts(userId: string) {
        return await prisma.saleItem.groupBy({
            by: ['productId'],
            where: {
                sale: { ownerId: userId }
            },
            _sum: {
                quantity: true,
                price: true
            },
            orderBy: {
                _sum: {
                    price: 'desc'
                }
            },
            take: 10
        });
    }

    private async getTopCustomers(userId: string) {
        return await prisma.sale.groupBy({
            by: ['customerId'],
            where: { ownerId: userId },
            _sum: {
                totalAmount: true
            },
            _count: {
                id: true
            },
            orderBy: {
                _sum: {
                    totalAmount: 'desc'
                }
            },
            take: 10
        });
    }

    private async getRecentTransactions(userId: string) {
        return await prisma.sale.findMany({
            where: { ownerId: userId },
            select: {
                id: true,
                totalAmount: true,
                createdAt: true,
                customer: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });
    }

    private async getInventoryAlerts(userId: string) {
        return await prisma.product.findMany({
            where: {
                ownerId: userId,
                stock: {
                    lte: 10
                }
            },
            select: {
                id: true,
                name: true,
                stock: true,
                price: true
            },
            take: 10
        });
    }
}

export const businessAIService = new BusinessAIService();