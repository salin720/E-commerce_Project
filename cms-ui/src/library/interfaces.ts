import {HTMLInputTypeAttribute} from "react";
export interface LoginFormData{ email: string; password: string; }
export interface InputFieldProps { formik: any, name: string, label: string, type?: HTMLInputTypeAttribute, as?: "textarea" }
export interface FileFieldProps { formik: any, name: string, label: string, multiple?: boolean, accept?: string }
export interface SubmitBtnProps { disabled?: boolean, label?: string, icon?: string }
export interface UserData{ _id: string, name: string, email: string, phone: string, address: string, avatar?: string | null, role: string, status: boolean, createdAt: string, updatedAt: string, __v: number }
export type UserType = UserData|null
export interface UserFormData { name: string, email?: string, phone: string, address: string, status?: number, password?: string, confirmPassword?: string }
export interface PasswordFormData { oldPassword: string, password: string, confirmPassword: string }
export type DataListType = { [key: string]: any }[]
export interface DataTableProps { data: DataListType, searchable? : string[], pageSize?: number }
export interface CatBrandData { _id: string, name: string, status: boolean, createdAt: string, updatedAt: string, __v: number }
export interface ProductData { _id: string, name: string, description: string, shortDescription: string, price: number, discountedPrice: number, categoryId: string, brandId: string, images: string[], status: boolean, featured: boolean, stock?: number, totalViews?: number, totalSold?: number, createdAt: string, updatedAt: string, __v: number, category?: CatBrandData, brand?: CatBrandData }
export interface ProductFormData { name: string, description: string, shortDescription: string, price: number, discountedPrice: number, categoryId: string, brandId: string, images: File[], stock: number, status: number, featured: number }
export interface SelectFieldProps { formik: any, name: string, label: string, data: DataListType[] }
export interface ReviewData { _id: string, comment: string, rating: number, productId: string, userId: string, createdAt: string, updatedAt: string, __v: number, product?: ProductData, user?: UserData }
export interface DetailData { _id: string, orderId: string, productId: string, qty: number, price: number, total: number, createdAt: string, updatedAt: string, __v: number, product?: ProductData }
export interface PaymentData { _id?: string, orderId: string, userId?: string, transactionId?: string, amount: number, status: 'Pending'|'Paid'|'Failed'|'Refunded', paidAt?: string, createdAt?: string }
export interface OrderData { _id: string, userId: string, status: 'Processing' | 'Confirmed' | 'Packed' | 'Shipping' | 'Delivered' | 'Cancelled', paymentMethod?: 'COD' | 'eSewa', paymentStatus?: 'Pending'|'Paid'|'Failed'|'Refunded', trackingCode?: string, adminNote?: string, createdAt: string, updatedAt: string, __v: number, user?: UserData, details?: DetailData[], payment?: PaymentData | null }
