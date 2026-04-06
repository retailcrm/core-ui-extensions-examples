import {
    mockOrders,
    processingColumns,
    transitionsMap,
} from '../data/orders-processing-reference.mjs'
import {
    loadOrdersProcessingBootstrap,
    loadOrdersProcessingOrders,
} from '../integrations/retailcrm-api.mjs'
import {
    resolveOrderProcessingState,
    resolveOrderProcessingStates,
    updateOrderProcessingState,
} from '../storage/orders-processing-store.mjs'
import { parsePayload, sendJsonError } from '../utils/http.mjs'

const processingColumnById = new Map(processingColumns.map(column => [column.id, column]))

const createDisplayMaps = (bootstrap) => {
    return {
        managerById: new Map(bootstrap.managers.map(manager => [manager.id, manager])),
        statusByCode: new Map(bootstrap.statuses.map(status => [status.code, status])),
        orderTypeByCode: new Map(bootstrap.orderTypes.map(orderType => [orderType.code, orderType])),
        siteByCode: new Map(bootstrap.sites.map(site => [site.code, site])),
    }
}

const normalizeStringArray = (value) => {
    if (Array.isArray(value)) {
        return value.map(item => String(item).trim()).filter(Boolean)
    }

    if (typeof value === 'string') {
        return value.trim()
            ? [value.trim()]
            : []
    }

    return []
}

const resolveManagerName = (managerId, managerById) => {
    if (!managerId) {
        return 'Не назначен'
    }

    const manager = managerById.get(managerId)

    return manager
        ? `${manager.firstName} ${manager.lastName}`.trim()
        : 'Не назначен'
}

const serializeCard = (order, state, maps) => {
    const status = maps.statusByCode.get(order.status)
    const orderType = maps.orderTypeByCode.get(order.orderType)
    const site = maps.siteByCode.get(order.site)

    return {
        id: order.id,
        number: order.number,
        status: order.status,
        statusLabel: status?.name || order.status,
        processingStatus: state.processingStatus,
        customerName: `${order.firstName} ${order.lastName}`.trim(),
        phone: order.phone,
        totalSumm: order.totalSumm,
        createdAt: order.createdAt,
        assigneeId: order.managerId,
        assigneeName: resolveManagerName(order.managerId, maps.managerById),
        site: order.site,
        siteLabel: site?.name || order.site,
        orderType: order.orderType,
        orderTypeLabel: orderType?.name || order.orderType,
        customerComment: order.customerComment,
        managerComment: order.managerComment,
    }
}

const applyOrderFilters = async (payload) => {
    const apiResult = await loadOrdersProcessingOrders({
        ...payload,
        assigneeIds: normalizeStringArray(payload.assigneeIds),
        statuses: normalizeStringArray(payload.statuses),
        orderTypes: normalizeStringArray(payload.orderTypes),
        sites: normalizeStringArray(payload.sites),
    })
    const states = await resolveOrderProcessingStates(apiResult.orders)

    return {
        items: apiResult.orders
            .map(order => ({
                order,
                state: states.get(order.id),
            })),
        pagination: apiResult.pagination,
    }
}

const buildNextState = (targetColumnId, currentState) => {
    return {
        processingStatus: targetColumnId,
        takenAt: targetColumnId === 'in_progress' || targetColumnId === 'processed'
            ? (currentState.takenAt || new Date().toISOString())
            : null,
        processedAt: targetColumnId === 'processed'
            ? new Date().toISOString()
            : null,
    }
}

export const registerOrdersProcessingRoutes = (app, { urlencoded }) => {
    app.post('/orders-processing/bootstrap', urlencoded, async (_, response) => {
        try {
            const bootstrap = await loadOrdersProcessingBootstrap()

            response.status(200).json({
                transitionsMap: bootstrap.transitionsMap,
                managers: bootstrap.managers,
                statuses: bootstrap.statuses,
                orderTypes: bootstrap.orderTypes,
                sites: bootstrap.sites,
                filters: {
                    assigneeIds: [],
                    statuses: [],
                    orderTypes: [],
                    sites: [],
                },
            })
        } catch (error) {
            sendJsonError(response, error)
        }
    })

    app.post('/orders-processing/column', urlencoded, async (request, response) => {
        try {
            const payload = parsePayload(request)
            const columnId = String(payload.column || '')
            const page = Math.max(1, Number(payload.page) || 1)
            const limit = Math.max(1, Math.min(20, Number(payload.limit) || 20))
            const bootstrap = await loadOrdersProcessingBootstrap()
            const maps = createDisplayMaps(bootstrap)

            if (!processingColumnById.has(columnId)) {
                response.status(400).json({ errorMsg: `Unknown column: ${columnId}` })
                return
            }

            const filtered = await applyOrderFilters(payload)
            const columnItems = filtered.items
                .filter(entry => entry.state.processingStatus === columnId)
                .sort((left, right) => right.order.createdAt.localeCompare(left.order.createdAt))

            response.status(200).json({
                items: columnItems.map(entry => serializeCard(entry.order, entry.state, maps)),
                pagination: {
                    currentPage: filtered.pagination.currentPage || page,
                    limit: filtered.pagination.limit || limit,
                    totalCount: columnItems.length,
                    totalPageCount: filtered.pagination.totalPageCount || 1,
                },
                summary: {
                    columnId,
                    totalCount: columnItems.length,
                },
            })
        } catch (error) {
            sendJsonError(response, error)
        }
    })

    app.post('/orders-processing/move', urlencoded, async (request, response) => {
        try {
            const payload = parsePayload(request)
            const orderId = Number(payload.orderId)
            const targetColumnId = String(payload.targetColumnId || '')
            const bootstrap = await loadOrdersProcessingBootstrap()
            const maps = createDisplayMaps(bootstrap)
            const apiOrders = await loadOrdersProcessingOrders({
                page: 1,
                limit: 100,
            })
            const order = mockOrders.find(item => item.id === orderId)
                || apiOrders.orders.find(item => item.id === orderId)

            if (!order) {
                response.status(404).json({ errorMsg: `Order not found: ${orderId}` })
                return
            }

            if (!processingColumnById.has(targetColumnId)) {
                response.status(400).json({ errorMsg: `Unknown target column: ${targetColumnId}` })
                return
            }

            const currentState = await resolveOrderProcessingState(order)
            const allowedTargets = transitionsMap[currentState.processingStatus] || []

            if (!allowedTargets.includes(targetColumnId)) {
                response.status(409).json({ errorMsg: 'Transition is not allowed' })
                return
            }

            const nextState = buildNextState(targetColumnId, currentState)
            const persisted = await updateOrderProcessingState(orderId, nextState)

            response.status(200).json({
                item: serializeCard(order, persisted, maps),
            })
        } catch (error) {
            sendJsonError(response, error)
        }
    })
}
