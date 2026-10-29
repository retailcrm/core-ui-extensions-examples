import type {
    ClaimForm,
    ClaimPlan,
    OrderItem,
    Ticket,
    TicketSettings,
    Translate,
} from './types'

export const ticketIdentity = (ticket: Ticket) => `${ticket.mode}:${ticket.id ?? 'new'}`
export const subtopicsOf = (settings: TicketSettings) => settings.topics.flatMap(topic => topic.subtopics.map(subtopic => ({
    ...subtopic,
    label: `${topic.name} · ${subtopic.name}`,
})))

export const createClaimForm = (): ClaimForm => ({
    orderId: null,
    orderItemIds: [],
    reason: 'damaged',
    resolution: 'replacement',
    details: '',
    newIssue: false,
    issueKey: null,
    typeId: null,
    subtopicId: null,
})

export const claimDescription = (form: ClaimForm, orderNumber: string, orderItems: OrderItem[], t: Translate) => [
    t('summaryTitle', { number: orderNumber }),
    t('summaryItems', { items: orderItems.map(item => `${item.name}${item.article ? ` (${item.article})` : ''}`).join('; ') }),
    t('summaryReason', { reason: t(`reasons.${form.reason}`) }),
    t('summaryDetails', { details: form.details.trim() }),
    t('summaryResolution', { resolution: t(`resolutions.${form.resolution}`) }),
].join('\n')

export const createClaimPlan = (form: ClaimForm, ticket: Ticket, settings: TicketSettings, items: OrderItem[], t: Translate): ClaimPlan => {
    const order = ticket.orders.find(order => order.id === form.orderId)!
    const orderItems = items.filter(item => item.orderId === order.id && form.orderItemIds.includes(item.id))
    const type = settings.types.find(type => type.id === form.typeId)!
    const subtopic = subtopicsOf(settings).find(item => item.id === form.subtopicId)!
    const block = claimDescription(form, order.number, orderItems, t)

    return {
        identity: ticketIdentity(ticket),
        orderId: order.id,
        issue: form.newIssue ? null : ticket.issues.find(issue => issue.key === form.issueKey)!,
        typeId: type.id,
        subtopicId: subtopic.id,
        classification: `${type.name} · ${subtopic.label}`,
        orderItems,
        originalDescription: ticket.description,
        description: ticket.description.includes(block)
            ? ticket.description
            : [ticket.description.trim() ? ticket.description : '', block].filter(Boolean).join('\n\n'),
    }
}

export const claimPlanIsStale = (plan: ClaimPlan, ticket: Ticket) => (
    ticketIdentity(ticket) !== plan.identity
    || ticket.description !== plan.originalDescription
    || !ticket.orders.some(order => order.id === plan.orderId)
    || !!(plan.issue && JSON.stringify(ticket.issues.find(issue => issue.key === plan.issue!.key)) !== JSON.stringify(plan.issue))
)

export const claimUnavailable = (ticket: Ticket, settings: TicketSettings) => (
    ticket.loading || ticket.loadFailed || ticket.saving || ticket.pending
    || !(ticket.mode === 'create' ? settings.creatable : settings.editable)
)
