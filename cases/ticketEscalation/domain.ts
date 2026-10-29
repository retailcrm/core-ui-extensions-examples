import type { TicketIssue } from '@retailcrm/embed-ui-v1-contexts/types/ticket/view'

import type {
    EscalationForm,
    EscalationPlan,
    Recipient,
    Ticket,
    TicketSettings,
    Translate,
} from './types'

export const issueLabel = (issue: TicketIssue) => [issue.type?.name, issue.subtopic?.name ?? issue.topic?.name]
    .filter(Boolean).join(' · ') || `#${issue.id}`

export const createEscalationForm = (): EscalationForm => ({
    issueIds: [],
    recipientId: null,
    statusId: null,
    reason: 'specialist',
    tried: '',
    expected: '',
})

export const escalationComment = (form: EscalationForm, ticket: Ticket, issues: TicketIssue[], recipient: Recipient, t: Translate) => [
    t('summaryTitle', { number: ticket.number ?? ticket.id! }),
    t('summaryQuestions', { questions: issues.map(issueLabel).join('; ') }),
    t('summaryRecipient', { name: recipient.name }),
    t('summaryReason', { reason: t(`reasons.${form.reason}`) }),
    t('summaryTried', { text: form.tried.trim() }),
    t('summaryExpected', { text: form.expected.trim() }),
].join('\n')

export const createEscalationPlan = (form: EscalationForm, ticket: Ticket, settings: TicketSettings, recipients: Recipient[], t: Translate): EscalationPlan => {
    const recipient = recipients.find(item => item.id === form.recipientId)!
    const status = settings.statuses.find(item => item.id === form.statusId)!
    const issues = ticket.issues.filter(issue => form.issueIds.includes(issue.id))

    return {
        ticketId: ticket.id!,
        issues,
        recipient,
        statusId: status.id,
        statusName: status.name,
        comment: escalationComment(form, ticket, issues, recipient, t),
    }
}

export const escalationPlanIsStale = (plan: EscalationPlan, ticket: Ticket) => (
    ticket.id !== plan.ticketId
    || plan.issues.some(issue => JSON.stringify(ticket.issues.find(item => item.id === issue.id)) !== JSON.stringify(issue))
)

export const ticketUnavailable = (ticket: Ticket) => ticket.id === null || ticket.loading || ticket.loadFailed || ticket.pending
export const escalationWritable = (settings: TicketSettings) => settings.editable && settings.commentable
