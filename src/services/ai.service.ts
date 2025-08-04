import { GoogleGenerativeAI } from '@google/generative-ai';
import { configDotenv } from 'dotenv';
import prisma from '../config/db';

configDotenv();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Analyze natural language business queries
   */
  async analyzeQuery(query: string, userId: string): Promise<AIInsight> {
    try {
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
      throw new Error('Failed to analyze business query');
    }
  }

  /**
   * Generate automated business insights
   */
  async generateInsights(userId: string): Promise<AIInsight[]> {
    try {
      const businessData = await this.getBusinessData(userId);
      const prompt = this.buildInsightsPrompt(businessData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseInsightsResponse(text);
    } catch (error) {
      console.error('AI Insights Error:', error);
      throw new Error('Failed to generate business insights');
    }
  }

  /**
   * Predict business trends
   */
  async predictTrends(userId: string, period: string = '30'): Promise<AIInsight[]> {
    try {
      const historicalData = await this.getHistoricalData(userId, period);
      const prompt = this.buildPredictionPrompt(historicalData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parsePredictionResponse(text);
    } catch (error) {
      console.error('AI Prediction Error:', error);
      throw new Error('Failed to predict business trends');
    }
  }

  /**
   * Generate business recommendations
   */
  async generateRecommendations(userId: string): Promise<AIInsight[]> {
    try {
      const businessData = await this.getBusinessData(userId);
      const prompt = this.buildRecommendationsPrompt(businessData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseRecommendationsResponse(text);
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      throw new Error('Failed to generate business recommendations');
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
You are a business intelligence AI assistant. Analyze the following business data and answer the user's question.

Business Data:
- Total Sales: $${businessData.totalSales.toFixed(2)}
- Total Customers: ${businessData.totalCustomers}
- Total Products: ${businessData.totalProducts}
- Total Expenses: $${businessData.totalExpenses.toFixed(2)}
- Profit Margin: ${businessData.profitMargin.toFixed(2)}%
- Average Order Value: $${businessData.averageOrderValue.toFixed(2)}

Top Products: ${JSON.stringify(businessData.topProducts.slice(0, 5))}
Top Customers: ${JSON.stringify(businessData.topCustomers.slice(0, 5))}
Recent Transactions: ${JSON.stringify(businessData.recentTransactions.slice(0, 10))}

User Question: "${query}"

Please provide a detailed analysis with:
1. Direct answer to the question
2. Key insights and patterns
3. Actionable recommendations
4. Confidence level (0-100)

Format your response as JSON:
{
  "title": "Brief title",
  "description": "Detailed analysis",
  "confidence": 85,
  "type": "analysis|prediction|recommendation|alert|trend",
  "category": "sales|customers|inventory|financial|general",
  "actionable": true,
  "data": {
    "keyMetrics": {},
    "insights": [],
    "recommendations": []
  }
}
`;
  }

  /**
   * Build AI prompt for automated insights
   */
  private buildInsightsPrompt(businessData: BusinessMetrics): string {
    return `
You are a business intelligence AI assistant. Analyze this business data and generate 3-5 key insights.

Business Data:
- Total Sales: $${businessData.totalSales.toFixed(2)}
- Total Customers: ${businessData.totalCustomers}
- Total Products: ${businessData.totalProducts}
- Total Expenses: $${businessData.totalExpenses.toFixed(2)}
- Profit Margin: ${businessData.profitMargin.toFixed(2)}%
- Average Order Value: $${businessData.averageOrderValue.toFixed(2)}

Top Products: ${JSON.stringify(businessData.topProducts.slice(0, 5))}
Top Customers: ${JSON.stringify(businessData.topCustomers.slice(0, 5))}
Recent Transactions: ${JSON.stringify(businessData.recentTransactions.slice(0, 10))}

Generate insights about:
1. Sales performance and trends
2. Customer behavior and patterns
3. Product performance
4. Financial health
5. Growth opportunities

Format as JSON array:
[
  {
    "title": "Insight title",
    "description": "Detailed insight",
    "confidence": 85,
    "type": "analysis|prediction|recommendation|alert|trend",
    "category": "sales|customers|inventory|financial|general",
    "actionable": true,
    "data": {
      "keyMetrics": {},
      "insights": [],
      "recommendations": []
    }
  }
]
`;
  }

  /**
   * Build AI prompt for trend predictions
   */
  private buildPredictionPrompt(historicalData: any[]): string {
    return `
You are a business intelligence AI assistant. Analyze this historical sales data and predict future trends.

Historical Sales Data (last 30 days):
${JSON.stringify(historicalData.slice(0, 10))}

Generate predictions for:
1. Sales trends for the next 30 days
2. Seasonal patterns
3. Growth opportunities
4. Potential risks

Format as JSON array:
[
  {
    "title": "Prediction title",
    "description": "Detailed prediction",
    "confidence": 85,
    "type": "prediction",
    "category": "sales|customers|inventory|financial|general",
    "actionable": true,
    "data": {
      "predictedValue": 0,
      "confidence": 85,
      "factors": [],
      "recommendations": []
    }
  }
]
`;
  }

  /**
   * Build AI prompt for business recommendations
   */
  private buildRecommendationsPrompt(businessData: BusinessMetrics): string {
    return `
You are a business intelligence AI assistant. Analyze this business data and provide actionable recommendations.

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

Format as JSON array:
[
  {
    "title": "Recommendation title",
    "description": "Detailed recommendation",
    "confidence": 85,
    "type": "recommendation",
    "category": "sales|customers|inventory|financial|general",
    "actionable": true,
    "data": {
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "timeline": "immediate|short-term|long-term",
      "steps": [],
      "expectedOutcome": ""
    }
  }
]
`;
  }

  /**
   * Parse AI response for single query
   */
  private parseAIResponse(response: string): AIInsight {
    try {
      const parsed = JSON.parse(response);
      return {
        id: Date.now().toString(),
        type: parsed.type || 'analysis',
        title: parsed.title || 'Business Analysis',
        description: parsed.description || response,
        confidence: parsed.confidence || 75,
        data: parsed.data || {},
        timestamp: new Date(),
        actionable: parsed.actionable || false,
        category: parsed.category || 'general'
      };
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        id: Date.now().toString(),
        type: 'analysis',
        title: 'Business Analysis',
        description: response,
        confidence: 75,
        data: { rawResponse: response },
        timestamp: new Date(),
        actionable: false,
        category: 'general'
      };
    }
  }

  /**
   * Parse AI response for multiple insights
   */
  private parseInsightsResponse(response: string): AIInsight[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.map((insight: any, index: number) => ({
        id: (Date.now() + index).toString(),
        type: insight.type || 'analysis',
        title: insight.title || `Insight ${index + 1}`,
        description: insight.description || '',
        confidence: insight.confidence || 75,
        data: insight.data || {},
        timestamp: new Date(),
        actionable: insight.actionable || false,
        category: insight.category || 'general'
      }));
    } catch (error) {
      return [{
        id: Date.now().toString(),
        type: 'analysis',
        title: 'Business Insights',
        description: response,
        confidence: 75,
        data: { rawResponse: response },
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
    return this.parseInsightsResponse(response);
  }

  /**
   * Parse AI response for recommendations
   */
  private parseRecommendationsResponse(response: string): AIInsight[] {
    return this.parseInsightsResponse(response);
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