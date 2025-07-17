export type TUser = {
    name: string;
    email: string;
    password: string;
    role?: TRole;
};

export type TRole = "admin" | "worker" | "user";

export type TCustomerData = {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
};

export interface ISaleItemData {
    // saleId: string
    productId: string;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
}

export interface IProductData {
    name: string;
    price: number;
    stock: number;
    categoryId: string;
    description?: string;
    images?: string[];
    cost?: number; // Cost per unit (COGS)
}

export interface IProductCategoryData {
    name: string;
    description?: string;
}

export type TSaleData = {
    customerId: string;
    items: ISaleItemData[];
    paymentMethod: PaymentMethod;
    totalAmount: number;
    totalDiscount: number;
    totalTax: number;
    channel: string;
    notes: string;
    dueDate?: Date;
    currencyCode: string;
    currencySymbol: string;
    taxRate: number;
};

export type PaymentMethod = "CASH" | "CREDIT_CARD" | "CREDIT" | "MOBILE_MONEY";
