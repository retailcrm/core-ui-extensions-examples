import {
    deriveSitesFromOrders,
    extractOrderTypes,
    extractStatuses,
    normalizeManager,
    normalizeOrder,
    normalizeOrderType,
    normalizeStatus,
} from './normalizers.mjs'

const normalizeBaseUrl = (value) => {
    return String(value || '').replace(/\/$/, '')
}

const normalizeOrdersLimit = (value) => {
    return [20, 50, 100].includes(Number(value))
        ? Number(value)
        : 20
}

const appendQueryValue = (searchParams, key, value) => {
    if (Array.isArray(value)) {
        for (const item of value) {
            appendQueryValue(searchParams, key, item)
        }

        return
    }

    if (value !== undefined && value !== null && String(value) !== '') {
        searchParams.append(key, String(value))
    }
}

const buildUrl = (baseUrl, path, pairs = []) => {
    const url = new URL(`${baseUrl}${path}`)

    for (const [key, value] of pairs) {
        appendQueryValue(url.searchParams, key, value)
    }

    return url
}

export const getRetailCrmConfig = () => ({
    apiKey: process.env.CRM_API_KEY || '',
    baseUrl: normalizeBaseUrl(process.env.CRM_API_HOST),
    realApiEnabled: process.env.ORDERS_PROCESSING_USE_REAL_API === 'true',
})

export const isRetailCrmConfigured = () => {
    const config = getRetailCrmConfig()

    return config.realApiEnabled && Boolean(config.baseUrl) && Boolean(config.apiKey)
}

export const createRetailCrmClient = (overrides = {}) => {
    const config = {
        ...getRetailCrmConfig(),
        ...overrides,
    }
    const baseUrl = normalizeBaseUrl(config.baseUrl)
    const apiKey = config.apiKey || ''

    if (!baseUrl || !apiKey) {
        throw new Error('RetailCRM API client requires CRM_API_HOST and CRM_API_KEY')
    }

    const request = async (path, pairs = []) => {
        const response = await fetch(buildUrl(baseUrl, path, pairs), {
            headers: {
                'X-API-KEY': apiKey,
            },
        })

        if (!response.ok) {
            throw new Error(`CRM API request failed with ${response.status} for ${path}`)
        }

        return response.json()
    }

    return {
        request,
        async getUsers({ filters = {}, limit, page } = {}) {
            const response = await request('/api/v5/users', [
                ['page', page],
                ['limit', limit],
                ['filter[isManager]', filters.isManager],
                ['filter[active]', filters.active],
                ['filter[groupIds][]', filters.groupIds || []],
                ['filter[ids][]', filters.ids || []],
            ])

            return {
                users: Array.isArray(response.users)
                    ? response.users.map(normalizeManager)
                    : [],
                pagination: response.pagination || null,
            }
        },
        async getManagers({ active = true, limit = 100 } = {}) {
            return this.getUsers({
                filters: {
                    active: active ? 1 : undefined,
                    isManager: 1,
                },
                limit,
            })
        },
        async getStatuses() {
            const response = await request('/api/v5/reference/statuses')

            return {
                statuses: extractStatuses(response).map(normalizeStatus),
            }
        },
        async getOrderTypes() {
            const response = await request('/api/v5/reference/order-types')

            return {
                orderTypes: extractOrderTypes(response).map(normalizeOrderType),
            }
        },
        async getOrders({
            assigneeIds = [],
            crmStatuses = [],
            createdAtFrom,
            createdAtTo,
            limit = 20,
            orderTypes = [],
            page = 1,
            sites = [],
        } = {}) {
            const normalizedLimit = normalizeOrdersLimit(limit)
            const response = await request('/api/v5/orders', [
                ['page', page],
                ['limit', normalizedLimit],
                ['filter[managers][]', assigneeIds],
                ['filter[extendedStatus][]', crmStatuses],
                ['filter[orderTypes][]', orderTypes],
                ['filter[sites][]', sites],
                ['filter[createdAtFrom]', createdAtFrom],
                ['filter[createdAtTo]', createdAtTo],
            ])

            return {
                orders: Array.isArray(response.orders)
                    ? response.orders.map(normalizeOrder)
                    : [],
                pagination: {
                    currentPage: Number(response.pagination?.currentPage) || page,
                    limit: Number(response.pagination?.limit) || normalizedLimit,
                    totalCount: Number(response.pagination?.totalCount) || 0,
                    totalPageCount: Number(response.pagination?.totalPageCount) || 1,
                },
            }
        },
        async getSites({ limit = 100, page = 1 } = {}) {
            const response = await this.getOrders({ limit, page })

            return {
                sites: deriveSitesFromOrders(response.orders),
                pagination: response.pagination,
            }
        },
    }
}
