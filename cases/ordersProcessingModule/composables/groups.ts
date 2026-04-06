import type { OrderFilter, ProcessingGroup } from '../types'
import type { Ref } from 'vue'

import { ref } from 'vue'

import { useGroupRequest } from './api'

import { ErrorCode, ProcessingStatus } from '../types'

const createGroups = () => ([
    { id: ProcessingStatus.Unassigned, accent: '#FFE8C2' },
    { id: ProcessingStatus.Assigned, accent: '#DDEBFF' },
    { id: ProcessingStatus.InProgress, accent: '#D9F4EA' },
    { id: ProcessingStatus.Processed, accent: '#E9E4FF' },
] as {
    id: ProcessingStatus;
    accent: string;
}[]).map(init => ({
    ...init,
    orders: [],
    page: 1,
    limit: 20,
    totalOrders: 0,
    totalPages: 1,
    initializing: false,
    loading: false,
    error: null,
} as ProcessingGroup))

const findGroup = (groups: ProcessingGroup[], status: ProcessingStatus) => {
    return groups.find(g => g.id === status) ?? null
}

const useLoad = (groups: Ref<ProcessingGroup[]>, filter: Ref<OrderFilter>) => {
    const request = useGroupRequest()

    return async (status: ProcessingStatus, append = false) => {
        const group = findGroup(groups.value, status)
        if (!group) return

        group.error = null
        group.initializing = !append
        group.loading = append

        try {
            const parsed = await request(
                status,
                filter.value,
                append ? group.page + 1 : 1,
                group.limit
            )

            group.orders = append ? [...group.orders, ...parsed.items] : parsed.items
            group.page = parsed.pagination.currentPage
            group.limit = parsed.pagination.limit
            group.totalOrders = parsed.pagination.totalCount
            group.totalPages = parsed.pagination.totalPageCount
        } catch {
            group.error = ErrorCode.LoadColumn
        } finally {
            group.initializing = false
            group.loading = false
        }
    }
}

export const useGroups = (filter: Ref<OrderFilter>) => {
    const groups = ref<ProcessingGroup[]>(createGroups())
    const error = ref<ErrorCode | null>(null)

    const load = useLoad(groups, filter)

    return {
        groups,
        error,
        init: async () => {
            error.value = null
            await Promise.all(groups.value.map(g => load(g.id)))
        },
        next: async (status: ProcessingStatus) => {
            const group = findGroup(groups.value, status)
            if (group) {
                await load(status, true)
            }
        },
        reset: () => { groups.value = createGroups() },
    }
}
