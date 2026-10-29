import type { Context } from '@retailcrm/embed-ui-v1-types/context'
import type { Schema } from '@retailcrm/embed-ui-v1-contexts/types/ticket/edit'
import type {
    Schema as SettingsSchema,
} from '@retailcrm/embed-ui-v1-contexts/types/ticket/edit-settings'
import type { TicketIssueDraft } from '@retailcrm/embed-ui-v1-contexts/types/ticket/edit'

export type Ticket = Context<Schema>
export type TicketSettings = Context<SettingsSchema>
export type Translate = (key: string, values?: Record<string, string | number>) => string

export type OrderItem = {
    id: number;
    orderId: number;
    orderNumber: string;
    name: string;
    article: string;
}

export type ClaimForm = {
    orderId: number | null;
    orderItemIds: number[];
    reason: string;
    resolution: string;
    details: string;
    newIssue: boolean;
    issueKey: string | null;
    typeId: number | null;
    subtopicId: number | null;
}

export type ClaimPlan = {
    identity: string;
    orderId: number;
    issue: TicketIssueDraft | null;
    typeId: number;
    subtopicId: number;
    classification: string;
    orderItems: OrderItem[];
    originalDescription: string;
    description: string;
}

export type ApplicationError = 'failed' | 'partialFailed' | 'conflict'
export type Step = (key: string, operation: () => Promise<unknown>) => Promise<void>
