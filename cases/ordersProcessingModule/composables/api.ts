import type {
    DictionaryOption,
    MoveResult,
    OrderFilter,
    ProcessingGroupFilter,
    ProcessingGroupPayload,
    ProcessingStatus,
} from '../types'

import { useHost } from '@retailcrm/embed-ui'

import { ErrorCode } from '../types'

export const useDictionaryRequest = () => {
    const host = useHost()

    return async () => {
        const { body, status } = await host.httpCall('/orders-processing/bootstrap', {})

        if (status !== 200) {
            throw new Error(body)
        }

        return JSON.parse(body) as {
            managers: Array<{ id: number; firstName: string; lastName: string }>;
            statuses: DictionaryOption[];
            orderTypes: DictionaryOption[];
            sites: DictionaryOption[];
            transitionsMap: Record<ProcessingStatus, ProcessingStatus[]>;
        }
    }
}

export const useGroupRequest = () => {
    const host = useHost()

    return async (
        status: ProcessingStatus,
        filter: OrderFilter,
        page: number,
        limit: number
    ): Promise<ProcessingGroupPayload> => {
        const { body, status: httpStatus } = await host.httpCall('/orders-processing/column', {
            column: status,
            assigneeIds: filter.assigneeId ? [filter.assigneeId] : [],
            statuses: filter.status ? [filter.status] : [],
            orderTypes: filter.orderType ? [filter.orderType] : [],
            sites: filter.site ? [filter.site] : [],
            page,
            limit,
        } satisfies ProcessingGroupFilter)

        if (httpStatus !== 200) {
            throw new Error(body)
        }

        return JSON.parse(body) as ProcessingGroupPayload
    }
}

export const useMoveRequest = () => {
    const host = useHost()

    return async (targetColumnId: ProcessingStatus, orderId: string): Promise<MoveResult> => {
        const { body, status } = await host.httpCall('/orders-processing/move', {
            orderId: Number(orderId),
            targetColumnId,
        })

        return status === 200
            ? { ok: true, item: JSON.parse(body).item, error: null }
            : { ok: false, item: null, error: ErrorCode.MoveCard }
    }
}
