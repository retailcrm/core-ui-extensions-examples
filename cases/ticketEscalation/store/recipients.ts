import type { Recipient, Ticket } from '../types'

import { onScopeDispose, reactive } from 'vue'

import { useRecipientsRequest } from '../api'

const createState = () => reactive({
    items: [] as Recipient[],
    loading: false,
    loadFailed: false,
})

type State = ReturnType<typeof createState>

const populate = async (state: State, request: () => Promise<Recipient[]>, isCurrent: () => boolean) => {
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

export const useRecipients = (ticket: Ticket) => {
    const state = createState()
    const request = useRecipientsRequest()
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
            const ticketId = ticket.id
            return populate(state, request, () => current === generation && ticket.id === ticketId)
        },
    }
}
