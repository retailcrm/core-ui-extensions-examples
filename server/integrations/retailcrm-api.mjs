import {
    statuses as mockStatuses,
    managers as mockManagers,
    mockOrders,
    orderTypes as mockOrderTypes,
    sites as mockSites,
    transitionsMap,
} from '../data/orders-processing-reference.mjs'
import {
    createRetailCrmClient,
    isRetailCrmConfigured,
} from '../api/retailcrm.mjs'

const getRetailCrmClient = () => {
    return isRetailCrmConfigured()
        ? createRetailCrmClient()
        : null
}

const applyMockOrderFilters = (payload) => {
    const assigneeIds = Array.isArray(payload.assigneeIds) ? payload.assigneeIds.map(String) : []
    const statuses = Array.isArray(payload.statuses) ? payload.statuses.map(String) : []
    const orderTypes = Array.isArray(payload.orderTypes) ? payload.orderTypes.map(String) : []
    const sites = Array.isArray(payload.sites) ? payload.sites.map(String) : []

    return mockOrders.filter(order => {
        if (assigneeIds.length > 0 && !assigneeIds.includes(String(order.managerId || ''))) {
            return false
        }

        if (statuses.length > 0 && !statuses.includes(order.status)) {
            return false
        }

        if (orderTypes.length > 0 && !orderTypes.includes(order.orderType)) {
            return false
        }

        if (sites.length > 0 && !sites.includes(order.site)) {
            return false
        }

        if (payload.createdAtFrom && order.createdAt.slice(0, 10) < payload.createdAtFrom) {
            return false
        }

        if (payload.createdAtTo && order.createdAt.slice(0, 10) > payload.createdAtTo) {
            return false
        }

        return true
    })
}

const fetchManagersFromApi = async () => {
    const client = getRetailCrmClient()
    const response = await client.getManagers()

    return response.users
}

const fetchStatusesFromApi = async () => {
    const client = getRetailCrmClient()
    const [statusesResponse, orderTypesResponse] = await Promise.all([
        client.getStatuses(),
        client.getOrderTypes(),
    ])

    return {
        statuses: statusesResponse.statuses,
        orderTypes: orderTypesResponse.orderTypes,
    }
}

const fetchSitesFromApi = async () => {
    const client = getRetailCrmClient()
    const response = await client.getSites()

    return response.sites
}

export const loadOrdersProcessingBootstrap = async () => {
    if (!isRetailCrmConfigured()) {
        return {
            transitionsMap,
            managers: mockManagers,
            statuses: mockStatuses,
            orderTypes: mockOrderTypes,
            sites: mockSites,
        }
    }

    try {
        const [managers, statuses, sites] = await Promise.all([
            fetchManagersFromApi(),
            fetchStatusesFromApi(),
            fetchSitesFromApi(),
        ])

        return {
            transitionsMap,
            managers,
            statuses: statuses.statuses,
            orderTypes: statuses.orderTypes,
            sites,
        }
    } catch (error) {
        console.error('Orders processing bootstrap fallback to mock mode', error)

        return {
            transitionsMap,
            managers: mockManagers,
            statuses: mockStatuses,
            orderTypes: mockOrderTypes,
            sites: mockSites,
        }
    }
}

export const loadOrdersProcessingOrders = async (payload) => {
    if (!isRetailCrmConfigured() || payload.forceMock === true) {
        const orders = applyMockOrderFilters(payload)
        const limit = Math.max(1, Math.min(20, Number(payload.limit) || 20))
        const page = Math.max(1, Number(payload.page) || 1)
        const totalCount = orders.length
        const totalPageCount = Math.max(1, Math.ceil(totalCount / limit))
        const safePage = Math.min(page, totalPageCount)
        const offset = (safePage - 1) * limit

        return {
            orders: orders.slice(offset, offset + limit),
            pagination: {
                currentPage: safePage,
                limit,
                totalCount,
                totalPageCount,
            },
        }
    }

    try {
        const limit = Math.max(1, Math.min(20, Number(payload.limit) || 20))
        const page = Math.max(1, Number(payload.page) || 1)
        const client = getRetailCrmClient()
        const response = await client.getOrders({
            page,
            limit,
            assigneeIds: payload.assigneeIds || [],
            statuses: payload.statuses || [],
            orderTypes: payload.orderTypes || [],
            sites: payload.sites || [],
            createdAtFrom: payload.createdAtFrom,
            createdAtTo: payload.createdAtTo,
        })

        return {
            orders: response.orders,
            pagination: response.pagination,
        }
    } catch (error) {
        console.error('Orders processing orders fallback to mock mode', error)

        return loadOrdersProcessingOrders({
            ...payload,
            forceMock: true,
        })
    }
}
