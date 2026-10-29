import type {
    OrderItem,
    Ticket,
    TicketSettings,
    Translate,
} from '../types'

import { computed, reactive, watch } from 'vue'

import { createClaimForm, createClaimPlan, subtopicsOf } from '../domain'

const populate = (state: ReturnType<typeof createClaimForm>, ticket: Ticket) => {
    state.newIssue = !ticket.issues.length
    state.issueKey = ticket.issues.length === 1 ? ticket.issues[0].key : null
    const issue = ticket.issues.find(issue => issue.key === state.issueKey)
    state.typeId = issue?.type?.id ?? null
    state.subtopicId = issue?.subtopic?.id ?? null
    state.orderId = ticket.orders.length === 1 ? ticket.orders[0].id : null
    state.orderItemIds = ticket.orderItems.filter(item => item.orderId === state.orderId).map(item => item.id)
}

export const useForm = (ticket: Ticket, settings: TicketSettings, items: { items: OrderItem[] }) => {
    const state = reactive(createClaimForm())
    const availableItems = computed(() => items.items.filter(item => item.orderId === state.orderId))
    const subtopics = computed(() => subtopicsOf(settings))
    const valid = computed(() => ticket.orders.some(order => order.id === state.orderId)
        && availableItems.value.some(item => state.orderItemIds.includes(item.id)) && !!state.details.trim()
        && settings.types.some(type => type.id === state.typeId) && subtopics.value.some(item => item.id === state.subtopicId)
        && (state.newIssue || ticket.issues.some(issue => issue.key === state.issueKey)))

    watch(() => state.orderId, () => {
        state.orderItemIds = ticket.orderItems.filter(item => item.orderId === state.orderId).map(item => item.id)
    })

    return {
        state,
        createPlan: (t: Translate) => createClaimPlan(state, ticket, settings, items.items, t),
        availableItems,
        subtopics,
        valid,
        populate: () => populate(state, ticket),
        reset: () => Object.assign(state, createClaimForm()),
    }
}
