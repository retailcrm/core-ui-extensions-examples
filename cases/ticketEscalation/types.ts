import type { Context } from '@retailcrm/embed-ui-v1-types/context'
import type { Schema } from '@retailcrm/embed-ui-v1-contexts/types/ticket/view'
import type {
    Schema as SettingsSchema,
} from '@retailcrm/embed-ui-v1-contexts/types/ticket/view-settings'
import type { TicketIssue } from '@retailcrm/embed-ui-v1-contexts/types/ticket/view'

export type Ticket = Context<Schema>
export type TicketSettings = Context<SettingsSchema>
export type Translate = (key: string, values?: Record<string, string | number>) => string

export type Recipient = {
    id: number;
    name: string;
}

export type EscalationForm = {
    issueIds: number[];
    recipientId: number | null;
    statusId: number | null;
    reason: string;
    tried: string;
    expected: string;
}

export type EscalationPlan = {
    ticketId: number;
    issues: TicketIssue[];
    recipient: Recipient;
    statusId: number;
    statusName: string;
    comment: string;
}

export type ApplicationError = 'failed' | 'partialFailed' | 'conflict'
export type Step = (key: string, operation: () => Promise<unknown>) => Promise<void>
