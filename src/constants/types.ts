export type TUser = {
    name: string
    email: string
    password: string
}

export type TCustomerData = {
    name: string
    email?: string
    phone?: string
    address?: string
}

export interface ISaleItemData {
    quantity: number
    price: number
    discount: number
}

export interface IProductData {
    name: string
    price: number
    stock: number
    categoryId: string
    description?: string
    images?: string[]
}

export interface IProductCategoryData {
    name: string
    description?: string
}

export type TSaleData = {
    
}