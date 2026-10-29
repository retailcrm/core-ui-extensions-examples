import type { OrderItem } from './types'

import { useHost } from '@retailcrm/embed-ui'

export const useOrderItemsRequest = () => {
    const host = useHost()

    return async (orderIds: number[]): Promise<OrderItem[]> => {
        const { body, status } = await host.httpCall('/ticket-workflows/order-items', { orderIds })
        if (status !== 200) throw new Error('Order items unavailable')
        const data = JSON.parse(body) as { items: OrderItem[] }
        if (!Array.isArray(data.items) || data.items.some(item => !Number.isSafeInteger(item.id)
            || !orderIds.includes(item.orderId) || typeof item.name !== 'string' || typeof item.article !== 'string')) {
            throw new Error('Invalid order items')
        }
        return data.items
    }
}
