import type { ManagerOption } from './types'

export const toScalar = (value?: string | string[]) => {
    return Array.isArray(value) ? (value[0] || '') : (value || '')
}

export const mapManagers = (managers: Array<{ id: number; firstName: string; lastName: string }>): ManagerOption[] => {
    return managers.map(manager => ({
        id: manager.id,
        name: `${manager.firstName} ${manager.lastName}`.trim(),
    }))
}
