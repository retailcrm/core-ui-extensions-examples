import type { Order } from '../../../cases/ordersProcessingModule/types'
import type { OrderSandboxSchemas } from '@retailcrm/embed-ui-v1-sandbox/scenario'
import type {
    SandboxHostMiddleware,
    SandboxHttpCallRequest,
} from '@retailcrm/embed-ui-v1-sandbox/core'

import { ProcessingStatus } from '../../../cases/ordersProcessingModule/types'

type ColumnPayload = {
    assigneeIds?: string[];
    column: ProcessingStatus;
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
    assigneeId,
    assigneeName: assigneeId === 1 ? 'Анна Смирнова' : 'Иван Петров',
    createdAt: '2026-03-16T10:00:00.000Z',
    customerComment: '',
    customerName: `Клиент ${number}`,
    id,
    managerComment: '',
    number,
    orderType: 'eshop-individual',
    orderTypeLabel: 'Физическое лицо',
    phone: '+7 900 000-00-00',
    processingStatus,
    site: 'demo',
    siteLabel: 'Demo',
    status: 'new',
    statusLabel: 'Новый',
    totalSumm: 12500,
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
        body: JSON.stringify(resolveRequest(request)),
        status: supportedActions.includes(request.action) ? 200 : 404,
    })
}

const resolveRequest = (request: SandboxHttpCallRequest): unknown => {
    if (request.action === '/orders-processing/bootstrap') {
        return {
            managers: [
                { firstName: 'Анна', id: 1, lastName: 'Смирнова' },
                { firstName: 'Иван', id: 2, lastName: 'Петров' },
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

    return { error: `Unsupported action: ${request.action}`, ok: false }
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
