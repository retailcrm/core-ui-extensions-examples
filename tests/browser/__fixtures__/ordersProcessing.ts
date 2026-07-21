import type { Order } from '@cases/ordersProcessingModule/types'
import type { OrderSandboxSchemas } from '@retailcrm/embed-ui-v1-sandbox/scenario'
import type {
    SandboxHostMiddleware,
    SandboxHttpCallRequest,
} from '@retailcrm/embed-ui-v1-sandbox/core'

import { ProcessingStatus } from '@cases/ordersProcessingModule/types'

type ColumnPayload = {
    column: ProcessingStatus;
    assigneeIds?: string[];
    limit?: number;
    page?: number;
}

type MovePayload = {
    orderId: number;
    targetColumnId: ProcessingStatus;
}

const createOrder = (
    id: number,
    number: string,
    processingStatus: ProcessingStatus,
    assigneeId: number | null
): Order => ({
    id,
    number,
    orderType: 'eshop-individual',
    orderTypeLabel: 'Физическое лицо',
    site: 'demo',
    siteLabel: 'Demo',
    customerName: `Клиент ${number}`,
    phone: '+7 900 000-00-00',
    totalSumm: 12500,
    assigneeId,
    assigneeName: assigneeId === 1 ? 'Анна Смирнова' : 'Иван Петров',
    customerComment: '',
    managerComment: '',
    status: 'new',
    statusLabel: 'Новый',
    createdAt: '2026-03-16T10:00:00.000Z',
    processingStatus,
})

const orders: Order[] = [
    createOrder(101, '100101', ProcessingStatus.Unassigned, 1),
    createOrder(102, '100102', ProcessingStatus.Assigned, 1),
    createOrder(103, '100103', ProcessingStatus.InProgress, 2),
    createOrder(104, '100104', ProcessingStatus.Processed, 2),
]

const supportedActions = [
    '/orders-processing/bootstrap',
    '/orders-processing/column',
    '/orders-processing/move',
]

export const createOrdersProcessingHttpMiddleware = (): SandboxHostMiddleware<OrderSandboxSchemas> => {
    return async request => ({
        status: supportedActions.includes(request.action) ? 200 : 404,
        body: JSON.stringify(resolveRequest(request)),
    })
}

const resolveRequest = (request: SandboxHttpCallRequest): unknown => {
    if (request.action === '/orders-processing/bootstrap') {
        return {
            managers: [
                { id: 1, firstName: 'Анна', lastName: 'Смирнова' },
                { id: 2, firstName: 'Иван', lastName: 'Петров' },
            ],
            orderTypes: [{ code: 'eshop-individual', name: 'Физическое лицо' }],
            sites: [{ code: 'demo', name: 'Demo' }],
            statuses: [{ code: 'new', name: 'Новый' }],
            transitionsMap: {
                [ProcessingStatus.Unassigned]: [ProcessingStatus.Assigned],
                [ProcessingStatus.Assigned]: [ProcessingStatus.InProgress],
                [ProcessingStatus.InProgress]: [ProcessingStatus.Processed],
                [ProcessingStatus.Processed]: [],
            },
        }
    }

    if (request.action === '/orders-processing/column') {
        return resolveColumn(parsePayload<ColumnPayload>(request.payload))
    }

    if (request.action === '/orders-processing/move') {
        const payload = parsePayload<MovePayload>(request.payload)
        const source = orders.find(item => item.id === payload.orderId)
        const item = source ? { ...source, processingStatus: payload.targetColumnId } : null

        return { item }
    }

    return { ok: false, error: `Unsupported action: ${request.action}` }
}

const resolveColumn = (payload: ColumnPayload) => {
    const filtered = orders.filter(item => {
        if (item.processingStatus !== payload.column) return false
        if (payload.assigneeIds?.length && !payload.assigneeIds.includes(String(item.assigneeId))) return false

        return true
    })

    return {
        items: filtered,
        pagination: {
            currentPage: payload.page ?? 1,
            limit: payload.limit ?? 20,
            totalCount: filtered.length,
            totalPageCount: 1,
        },
    }
}

const parsePayload = <T extends object>(payload: SandboxHttpCallRequest['payload']): T => {
    if (typeof payload === 'string') return JSON.parse(payload) as T

    return (payload ?? {}) as T
}

export const isManagerFilterPayload = (payload: SandboxHttpCallRequest['payload']): boolean => {
    return parsePayload<ColumnPayload>(payload).assigneeIds?.includes('1') ?? false
}

export const isMovePayload = (payload: SandboxHttpCallRequest['payload']): boolean => {
    const parsed = parsePayload<MovePayload>(payload)

    return parsed.orderId === 101 && parsed.targetColumnId === ProcessingStatus.Assigned
}
