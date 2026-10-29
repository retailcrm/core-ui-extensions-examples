import type {
    Recipient,
    Ticket,
    TicketSettings,
    Translate,
} from '../types'

import { computed, reactive } from 'vue'

import { createEscalationForm, createEscalationPlan } from '../domain'

export const useForm = (ticket: Ticket, settings: TicketSettings, recipients: { items: Recipient[] }) => {
    const state = reactive(createEscalationForm())
    const issues = computed(() => ticket.issues.filter(issue => state.issueIds.includes(issue.id)))
    const valid = computed(() => issues.value.length > 0 && recipients.items.some(item => item.id === state.recipientId)
        && settings.statuses.some(item => item.id === state.statusId) && !!state.tried.trim() && !!state.expected.trim())

    return {
        state,
        createPlan: (t: Translate) => createEscalationPlan(state, ticket, settings, recipients.items, t),
        valid,
        reset: () => Object.assign(state, createEscalationForm()),
        clearSummary: () => Object.assign(state, { issueIds: [], tried: '', expected: '' }),
    }
}
