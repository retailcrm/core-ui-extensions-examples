import type { ManagerOption, OrderFilter } from './types'

export const buildProcessingQuery = (filter: OrderFilter): Record<string, string> => {
    const query: Record<string, string> = {}

    if (filter.assigneeId) query.assignee = filter.assigneeId
    if (filter.orderType) query.orderType = filter.orderType
    if (filter.site) query.site = filter.site
    if (filter.status) query.status = filter.status

    return query
}

export const toScalar = (value?: string | string[]) => {
    return Array.isArray(value) ? (value[0] || '') : (value || '')
}

export const mapManagers = (managers: Array<{ id: number; firstName: string; lastName: string }>): ManagerOption[] => {
    return managers.map(manager => ({
        id: manager.id,
        name: `${manager.firstName} ${manager.lastName}`.trim(),
    }))
}
