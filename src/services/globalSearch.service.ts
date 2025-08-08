import prisma from "../config/db";

interface SearchResult {
    type: 'customer' | 'product' | 'sale' | 'invoice' | 'expense' | 'campaign';
    id: string;
    title: string;
    subtitle: string;
    description?: string | null;
    url: string;
    relevance: number;
    metadata: Record<string, any>;
}

interface GlobalSearchOptions {
    query: string;
    ownerId: string;
    limit?: number;
    types?: string[];
    includeArchived?: boolean;
}

export async function globalSearch(options: GlobalSearchOptions): Promise<SearchResult[]> {
    const { query, ownerId, limit = 20, types = [] } = options;
    
    if (!query.trim()) {
        return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search in parallel for better performance
    const searchPromises = [];

    // Search customers
    if (types.length === 0 || types.includes('customer')) {
        searchPromises.push(searchCustomers(searchTerm, ownerId, limit));
    }

    // Search products
    if (types.length === 0 || types.includes('product')) {
        searchPromises.push(searchProducts(searchTerm, ownerId, limit));
    }

    // Search sales
    if (types.length === 0 || types.includes('sale')) {
        searchPromises.push(searchSales(searchTerm, ownerId, limit));
    }

    // Search invoices
    if (types.length === 0 || types.includes('invoice')) {
        searchPromises.push(searchInvoices(searchTerm, ownerId, limit));
    }

    // Search expenses
    if (types.length === 0 || types.includes('expense')) {
        searchPromises.push(searchExpenses(searchTerm, ownerId, limit));
    }

    // Search campaigns
    if (types.length === 0 || types.includes('campaign')) {
        searchPromises.push(searchCampaigns(searchTerm, ownerId, limit));
    }

    // Execute all searches in parallel
    const searchResults = await Promise.all(searchPromises);
    
    // Flatten and combine results
    searchResults.forEach(result => results.push(...result));

    // Sort by relevance and limit results
    return results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);
}

async function searchCustomers(searchTerm: string, ownerId: string, limit: number): Promise<SearchResult[]> {
    const customers = await prisma.customer.findMany({
        where: {
            ownerId,
            OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { phone: { contains: searchTerm, mode: 'insensitive' } },
                { address: { contains: searchTerm, mode: 'insensitive' } },
            ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
    });

    return customers.map(customer => ({
        type: 'customer' as const,
        id: customer.id,
        title: customer.name,
        subtitle: customer.email || customer.phone || 'No contact info',
        description: customer.address,
        url: `/customers/${customer.id}`,
        relevance: calculateRelevance(searchTerm, customer.name, customer.email, customer.phone),
        metadata: {
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            createdAt: customer.createdAt,
        },
    }));
}

async function searchProducts(searchTerm: string, ownerId: string, limit: number): Promise<SearchResult[]> {
    const products = await prisma.product.findMany({
        where: {
            ownerId,
            OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
            ],
        },
        include: {
            category: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
    });

    return products.map(product => ({
        type: 'product' as const,
        id: product.id,
        title: product.name,
        subtitle: `$${product.price} - ${product.category.name}`,
        description: product.description,
        url: `/products/${product.id}`,
        relevance: calculateRelevance(searchTerm, product.name, product.description, product.category.name),
        metadata: {
            price: product.price,
            stock: product.stock,
            category: product.category.name,
            createdAt: product.createdAt,
        },
    }));
}

async function searchSales(searchTerm: string, ownerId: string, limit: number): Promise<SearchResult[]> {
    const sales = await prisma.sale.findMany({
        where: {
            ownerId,
            OR: [
                { customer: { name: { contains: searchTerm, mode: 'insensitive' } } },
                { customer: { email: { contains: searchTerm, mode: 'insensitive' } } },
                { channel: { contains: searchTerm, mode: 'insensitive' } },
            ],
        },
        include: {
            customer: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
    });

    return sales.map(sale => ({
        type: 'sale' as const,
        id: sale.id,
        title: `Sale #${sale.id.slice(-8)}`,
        subtitle: `${sale.customer?.name || 'Unknown Customer'} - $${sale.totalAmount}`,
        description: `Channel: ${sale.channel} | Method: ${sale.paymentMethod}`,
        url: `/sales/${sale.id}`,
        relevance: calculateRelevance(searchTerm, sale.customer?.name, sale.customer?.email, sale.channel),
        metadata: {
            customerName: sale.customer?.name,
            totalAmount: sale.totalAmount,
            channel: sale.channel,
            paymentMethod: sale.paymentMethod,
            createdAt: sale.createdAt,
        },
    }));
}

async function searchInvoices(searchTerm: string, ownerId: string, limit: number): Promise<SearchResult[]> {
    const invoices = await prisma.invoice.findMany({
        where: {
            ownerId,
            OR: [
                { invoiceNumber: { contains: searchTerm, mode: 'insensitive' } },
                { sale: { customer: { name: { contains: searchTerm, mode: 'insensitive' } } } },
                { sale: { customer: { email: { contains: searchTerm, mode: 'insensitive' } } } },
            ],
        },
        include: {
            sale: {
                include: {
                    customer: true,
                },
            },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => ({
        type: 'invoice' as const,
        id: invoice.id,
        title: `Invoice ${invoice.invoiceNumber}`,
        subtitle: `${invoice.sale.customer?.name || 'Unknown Customer'} - $${invoice.amountDue}`,
        description: `Status: ${invoice.status} | Due: ${invoice.dueDate.toLocaleDateString()}`,
        url: `/invoices/${invoice.id}`,
        relevance: calculateRelevance(searchTerm, invoice.invoiceNumber, invoice.sale.customer?.name, invoice.sale.customer?.email),
        metadata: {
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.sale.customer?.name,
            amountDue: invoice.amountDue,
            status: invoice.status,
            dueDate: invoice.dueDate,
            createdAt: invoice.createdAt,
        },
    }));
}

async function searchExpenses(searchTerm: string, ownerId: string, limit: number): Promise<SearchResult[]> {
    const expenses = await prisma.expense.findMany({
        where: {
            ownerId,
            OR: [
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
            ],
        },
        include: {
            category: true,
        },
        take: limit,
        orderBy: { date: 'desc' },
    });

    return expenses.map(expense => ({
        type: 'expense' as const,
        id: expense.id,
        title: expense.description || 'Expense',
        subtitle: `${expense.category.name} - $${expense.amount}`,
        description: `Date: ${expense.date.toLocaleDateString()} | Status: ${expense.status}`,
        url: `/expenses/${expense.id}`,
        relevance: calculateRelevance(searchTerm, expense.description, expense.category.name),
        metadata: {
            amount: expense.amount,
            category: expense.category.name,
            date: expense.date,
            status: expense.status,
            createdAt: expense.createdAt,
        },
    }));
}

async function searchCampaigns(searchTerm: string, ownerId: string, limit: number): Promise<SearchResult[]> {
    const campaigns = await prisma.campaign.findMany({
        where: {
            ownerId,
            OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { message: { contains: searchTerm, mode: 'insensitive' } },
            ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
    });

    return campaigns.map(campaign => ({
        type: 'campaign' as const,
        id: campaign.id,
        title: campaign.name,
        subtitle: `Broadcast: ${campaign.broadcastToAll ? 'All' : 'Selected'} | Scheduled: ${campaign.schedule ? 'Yes' : 'No'}`,
        description: campaign.message,
        url: `/campaigns/${campaign.id}`,
        relevance: calculateRelevance(searchTerm, campaign.name, campaign.message),
        metadata: {
            broadcastToAll: campaign.broadcastToAll,
            schedule: campaign.schedule,
            createdAt: campaign.createdAt,
        },
    }));
}

function calculateRelevance(searchTerm: string, ...fields: (string | undefined | null)[]): number {
    let relevance = 0;
    const term = searchTerm.toLowerCase();

    fields.forEach(field => {
        if (!field) return;
        
        const fieldLower = field.toLowerCase();
        
        // Exact match gets highest score
        if (fieldLower === term) {
            relevance += 100;
        }
        // Starts with search term
        else if (fieldLower.startsWith(term)) {
            relevance += 80;
        }
        // Contains search term
        else if (fieldLower.includes(term)) {
            relevance += 60;
        }
        // Word boundary match
        else if (fieldLower.includes(` ${term}`) || fieldLower.includes(`${term} `)) {
            relevance += 40;
        }
    });

    return relevance;
}

// Quick search for recent items
export async function quickSearch(query: string, ownerId: string): Promise<SearchResult[]> {
    return globalSearch({
        query,
        ownerId,
        limit: 5,
    });
}

// Search suggestions for autocomplete
export async function getSearchSuggestions(query: string, ownerId: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    if (query.length < 2) return suggestions;

    // Get customer names
    const customers = await prisma.customer.findMany({
        where: {
            ownerId,
            name: { contains: query, mode: 'insensitive' },
        },
        select: { name: true },
        take: 3,
    });
    suggestions.push(...customers.map(c => c.name));

    // Get product names
    const products = await prisma.product.findMany({
        where: {
            ownerId,
            name: { contains: query, mode: 'insensitive' },
        },
        select: { name: true },
        take: 3,
    });
    suggestions.push(...products.map(p => p.name));

    // Get invoice numbers
    const invoices = await prisma.invoice.findMany({
        where: {
            ownerId,
            invoiceNumber: { contains: query, mode: 'insensitive' },
        },
        select: { invoiceNumber: true },
        take: 3,
    });
    suggestions.push(...invoices.map(i => i.invoiceNumber));

    return [...new Set(suggestions)].slice(0, 5);
}
