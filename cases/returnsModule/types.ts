import type { ReturnStatus } from './enums'

export { ReturnStatus } from './enums'

export type DrawerMode = 'closed' | 'create' | 'edit'

export type ReturnsFilterValue = {
    date: Date | null;
    status: 'all' | ReturnStatus;
    orderNumber: string;
    amount: string;
}

export type ReturnItem = {
    name: string;
    quantity: number;
    price: number;
}

export type OrderOption = {
    id: number;
    number: string;
    customer: string;
    amount: number;
    items: ReturnItem[];
}

export type ReturnRecord = {
    id: number;
    date: string;
    status: ReturnStatus;
    order: OrderOption;
    amount: number;
    items: ReturnItem[];
}
