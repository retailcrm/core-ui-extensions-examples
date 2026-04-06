const toCollection = (value) => {
    if (Array.isArray(value)) {
        return value
    }

    if (value && typeof value === 'object') {
        return Object.values(value)
    }

    return []
}

export const extractOrderTypes = (response) => {
    if (response.orderTypes) {
        return toCollection(response.orderTypes)
    }

    if (response['order-types']) {
        return toCollection(response['order-types'])
    }

    return []
}

export const extractStatuses = (response) => {
    return toCollection(response.statuses)
}

export const normalizeManager = (user) => ({
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    patronymic: user.patronymic || '',
    position: user.position || '',
    photoUrl: user.photoUrl || '',
    active: Boolean(user.active),
    online: Boolean(user.online),
    status: user.status || '',
    isManager: Boolean(user.isManager),
    groups: Array.isArray(user.groups)
        ? user.groups.map(group => ({
            id: group.id,
            name: group.name || String(group.id || ''),
        }))
        : [],
})

export const normalizeStatus = (status) => ({
    code: status.code,
    name: status.name,
    group: status.group || '',
    active: status.active !== false,
    ordering: Number(status.ordering) || 0,
})

export const normalizeOrderType = (orderType) => ({
    code: orderType.code,
    name: orderType.name || orderType.code,
})

export const normalizeOrder = (order) => ({
    id: order.id,
    number: order.number || String(order.id),
    status: order.status || '',
    createdAt: order.createdAt || new Date().toISOString(),
    totalSumm: Number(order.totalSumm || order.summ || 0),
    firstName: order.firstName || order.customer?.firstName || '',
    lastName: order.lastName || order.customer?.lastName || '',
    phone: order.phone || order.customer?.phones?.[0]?.number || '',
    managerId: order.managerId || null,
    orderType: order.orderType || '',
    site: order.site || '',
    customerComment: order.customerComment || '',
    managerComment: order.managerComment || '',
})

export const deriveSitesFromOrders = (orders) => {
    const seen = new Set()

    return orders
        .map(order => order.site)
        .filter(Boolean)
        .filter(code => {
            if (seen.has(code)) {
                return false
            }

            seen.add(code)
            return true
        })
        .map(code => ({ code, name: code }))
}
