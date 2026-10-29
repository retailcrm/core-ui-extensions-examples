import { createRetailCrmClient } from '../api/retailcrm/client.mjs'
import { parsePayload } from '../utils/http.mjs'

// These endpoints only read CRM data. All ticket changes go through the host's
// context actions, so the CRM still owns permissions and the editor draft.
export const registerTicketWorkflowRoutes = (app, { urlencoded }) => {
    app.post('/ticket-workflows/recipients', async (_, response) => {
        try {
            const client = createRetailCrmClient()
            const recipients = []
            let page = 1
            let pages = 1
            do {
                const result = await client.getUsers({ filters: { active: 1, isManager: 1 }, limit: 100, page })
                recipients.push(...result.users.map(user => ({
                    id: user.id,
                    name: [user.firstName, user.lastName].filter(Boolean).join(' '),
                })))
                pages = result.pagination?.totalPageCount ?? 1
                page++
            } while (page <= pages)
            response.json({ recipients })
        } catch (error) {
            console.error(error)
            response.status(502).json({ error: 'recipients_unavailable' })
        }
    })

    app.post('/ticket-workflows/order-items', urlencoded, async (request, response) => {
        const { orderIds } = parsePayload(request)
        if (!Array.isArray(orderIds) || orderIds.length > 20
            || orderIds.some(id => !Number.isSafeInteger(id) || id <= 0)) {
            response.status(400).json({ error: 'invalid_orders' })
            return
        }
        try {
            const client = createRetailCrmClient()
            const orders = await Promise.all([...new Set(orderIds)].map(async id => {
                const result = await client.request(`/api/v5/orders/${id}`, [['by', 'id']])
                if (!result.success || !result.order) throw new Error('Order is unavailable')
                return result.order
            }))
            response.json({ items: orders.flatMap(order => (order.items ?? []).map(item => ({
                id: item.id,
                orderId: order.id,
                orderNumber: String(order.number),
                name: item.offer?.displayName || item.offer?.name || item.productName || '',
                article: item.offer?.article || '',
            }))) })
        } catch (error) {
            console.error(error)
            response.status(502).json({ error: 'order_items_unavailable' })
        }
    })
}
