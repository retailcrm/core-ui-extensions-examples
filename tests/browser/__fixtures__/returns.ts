import type { OrderSandboxSchemas } from '@retailcrm/embed-ui-v1-sandbox/scenario'
import type { ReturnRecord } from '@cases/returnsModule/types'
import type {
    SandboxHostMiddleware,
    SandboxHttpCallRequest,
} from '@retailcrm/embed-ui-v1-sandbox/core'

import { ReturnStatus } from '@cases/returnsModule/enums'

type ReturnsPayload = {
    filters?: {
        amount?: string;
        date?: string;
        orderNumber?: string;
        status?: string;
    };
    page?: number;
    perPage?: number;
}

type ReturnPayload = {
    id?: number;
}

const returns: ReturnRecord[] = [{
    id: 7001,
    date: '2026-03-16',
    status: ReturnStatus.New,
    order: {
        id: 1,
        number: '100241',
        customer: 'Анна Смирнова',
        amount: 2270,
        items: [{ name: 'Куртка Trail', quantity: 1, price: 590 }],
    },
    amount: 2270,
    items: [{ name: 'Куртка Trail', quantity: 1, price: 590 }],
}, {
    id: 7005,
    date: '2026-03-12',
    status: ReturnStatus.New,
    order: {
        id: 5,
        number: '100245',
        customer: 'Виктория Соколова',
        amount: 10540,
        items: [{ name: 'Фонарик Spark', quantity: 2, price: 1840 }],
    },
    amount: 1840,
    items: [{ name: 'Фонарик Spark', quantity: 1, price: 1840 }],
}]

const supportedActions = [
    '/order/search',
    '/orders/search',
    '/return',
    '/returns',
    '/returns/save',
]

export const createReturnsHttpMiddleware = (): SandboxHostMiddleware<OrderSandboxSchemas> => {
    return async request => ({
        status: supportedActions.includes(request.action) ? 200 : 404,
        body: JSON.stringify(resolveReturnsRequest(request)),
    })
}

const resolveReturnsRequest = (request: SandboxHttpCallRequest): unknown => {
    if (request.action === '/returns') {
        const payload = parsePayload<ReturnsPayload>(request.payload)
        const filtered = filterReturns(payload)

        return {
            page: payload.page ?? 1,
            perPage: payload.perPage ?? 8,
            returns: filtered,
            total: filtered.length,
        }
    }

    if (request.action === '/return') {
        const payload = parsePayload<ReturnPayload>(request.payload)

        return { return: returns.find(item => item.id === payload.id) ?? null }
    }

    if (request.action === '/orders/search' || request.action === '/order/search') {
        return { orders: returns.map(item => item.order) }
    }

    if (request.action === '/returns/save') return { ok: true }

    return { ok: false, error: `Unsupported action: ${request.action}` }
}

const parsePayload = <T extends object>(payload: SandboxHttpCallRequest['payload']): T => {
    if (typeof payload === 'string') return JSON.parse(payload) as T

    return (payload ?? {}) as T
}

const filterReturns = (payload: ReturnsPayload): ReturnRecord[] => {
    const filters = payload.filters ?? {}

    return returns.filter(item => {
        if (filters.orderNumber && !item.order.number.includes(filters.orderNumber)) return false
        if (filters.status && item.status !== filters.status) return false
        if (filters.amount && item.amount !== Number(filters.amount)) return false
        if (filters.date && item.date !== filters.date) return false

        return true
    })
}

export const isFilteredReturnsPayload = (payload: SandboxHttpCallRequest['payload']): boolean => {
    return parsePayload<ReturnsPayload>(payload).filters?.orderNumber === '100245'
}
