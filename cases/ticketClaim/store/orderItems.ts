import type { OrderItem, Ticket } from '../types'

import { onScopeDispose, reactive } from 'vue'

import { ticketIdentity } from '../domain'
import { useOrderItemsRequest } from '../api'

const createState = () => reactive({
    items: [] as OrderItem[],
    loading: false,
    loadFailed: false,
})

type State = ReturnType<typeof createState>

const populate = async (state: State, request: () => Promise<OrderItem[]>, isCurrent: () => boolean) => {
    state.items = []
    state.loading = true
    state.loadFailed = false

    try {
        const items = await request()
        if (isCurrent()) state.items = items
    } catch {
        if (isCurrent()) state.loadFailed = true
    } finally {
        if (isCurrent()) state.loading = false
    }
}

export const useOrderItems = (ticket: Ticket) => {
    const state = createState()
    const request = useOrderItemsRequest()
    let generation = 0
    const reset = () => {
        generation++
        Object.assign(state, { items: [], loading: false, loadFailed: false })
    }
    onScopeDispose(() => generation++)

    return {
        state,
        reset,
        populate: () => {
            const current = ++generation
            const identity = ticketIdentity(ticket)
            const orderIds = ticket.orders.map(order => order.id)
            return populate(state, () => orderIds.length ? request(orderIds) : Promise.resolve([]),
                () => current === generation && ticketIdentity(ticket) === identity)
        },
    }
}
