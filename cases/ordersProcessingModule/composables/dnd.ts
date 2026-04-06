import type {
    MoveContext,
    MoveSnapshot,
    Order,
    ProcessingGroup,
} from '../types'

import type { Ref } from 'vue'
import type { RemoteSortableEvent } from '@omnicajs/vue-remote/remote'

import { useMoveRequest } from './api'

import { ErrorCode, ProcessingStatus } from '../types'

const isProcessingStatus = (value: string | null): value is ProcessingStatus => {
    return value !== null && Object.values(ProcessingStatus).includes(value as ProcessingStatus)
}

const isMoveAllowed = (
    transitions: Ref<Record<ProcessingStatus, ProcessingStatus[]>>,
    sourceColumnId: ProcessingStatus,
    targetColumnId: ProcessingStatus
) => {
    return sourceColumnId === targetColumnId
        || (transitions.value[sourceColumnId] || []).includes(targetColumnId)
}

const isMoveAccepted = (event: RemoteSortableEvent) => {
    return event.accepted
        && event.targetIndex !== null
        && isProcessingStatus(event.sourceContainerId)
        && isProcessingStatus(event.targetContainerId)
}

const findGroup = (
    columns: ProcessingGroup[],
    columnId: ProcessingStatus
) => columns.find(column => column.id === columnId) || null

const findIndex = (items: Order[], itemId: string) => items.findIndex(item => String(item.id) === itemId)
const restrictIndex = (targetIndex: number, orders: Order[]) => {
    return Math.min(Math.max(targetIndex, 0), orders.length)
}

const createMoveSnapshot = (
    sourceState: ProcessingGroup,
    targetState: ProcessingGroup,
    sourceColumnId: ProcessingStatus,
    targetColumnId: ProcessingStatus,
    sourceIndex: number,
    targetIndex: number
): MoveSnapshot => {
    return {
        item: { ...sourceState.orders[sourceIndex] },
        sourceColumnId,
        sourceIndex,
        sourceTotalCount: sourceState.totalOrders,
        targetColumnId,
        targetIndex: restrictIndex(targetIndex, targetState.orders),
        targetTotalCount: targetState.totalOrders,
    }
}

const resolve = (event: RemoteSortableEvent) => isMoveAccepted(event) ? {
    itemId: event.itemId,
    sourceColumnId: event.sourceContainerId as ProcessingStatus,
    targetColumnId: event.targetContainerId as ProcessingStatus,
    targetIndex: event.targetIndex as number,
} as MoveContext : null

const capture = (
    columns: Ref<ProcessingGroup[]>,
    context: MoveContext
): MoveSnapshot | null => {
    const { sourceColumnId, targetColumnId, targetIndex } = context

    const sourceState = findGroup(columns.value, sourceColumnId)
    const targetState = findGroup(columns.value, targetColumnId)

    if (!sourceState || !targetState) return null

    const sourceIndex = findIndex(sourceState.orders, context.itemId)
    if (sourceIndex < 0) return null

    return createMoveSnapshot(
        sourceState,
        targetState,
        sourceColumnId,
        targetColumnId,
        sourceIndex,
        targetIndex
    )
}

const apply = (
    columns: Ref<ProcessingGroup[]>,
    context: MoveContext
) => {
    const { sourceColumnId, targetColumnId } = context

    const sourceState = findGroup(columns.value, sourceColumnId)
    const targetState = findGroup(columns.value, targetColumnId)

    if (!sourceState || !targetState) return

    const sourceIndex = findIndex(sourceState.orders, context.itemId)
    const targetIndex = restrictIndex(context.targetIndex, targetState.orders)

    if (sourceIndex < 0) return

    const order = { ...sourceState.orders[sourceIndex], processingStatus: targetColumnId }

    sourceState.orders.splice(sourceIndex, 1)
    targetState.orders.splice(targetIndex, 0, order)

    if (sourceColumnId !== targetColumnId) {
        sourceState.totalOrders = Math.max(0, sourceState.totalOrders - 1)
        targetState.totalOrders += 1
    }
}

const commit = (columns: Ref<ProcessingGroup[]>, order: Order, targetColumnId: ProcessingStatus) => {
    const targetState = findGroup(columns.value, targetColumnId)
    if (!targetState) return

    const currentTargetIndex = targetState.orders.findIndex(entry => entry.id === order.id)
    if (currentTargetIndex >= 0) {
        targetState.orders.splice(currentTargetIndex, 1, order)
    }
}

const rollback = (columns: Ref<ProcessingGroup[]>, snapshot: MoveSnapshot) => {
    const sourceState = findGroup(columns.value, snapshot.sourceColumnId)
    const targetState = findGroup(columns.value, snapshot.targetColumnId)

    if (!sourceState || !targetState) return

    const currentTargetIndex = targetState.orders.findIndex(item => item.id === snapshot.item.id)
    if (currentTargetIndex >= 0) {
        targetState.orders.splice(currentTargetIndex, 1)
    }

    sourceState.orders.splice(snapshot.sourceIndex, 0, snapshot.item)
    sourceState.totalOrders = snapshot.sourceTotalCount
    targetState.totalOrders = snapshot.targetTotalCount
}

export const useMove = ({ groups, transitions, onError }: {
    groups: Ref<ProcessingGroup[]>;
    transitions: Ref<Record<ProcessingStatus, ProcessingStatus[]>>;
    onError: (code: ErrorCode | null) => void;
}) => {
    const persist = useMoveRequest()

    return async (event: RemoteSortableEvent) => {
        const context = resolve(event)
        if (!context) return

        const { sourceColumnId, targetColumnId } = context

        if (!isMoveAllowed(transitions, sourceColumnId, targetColumnId)) {
            return onError(ErrorCode.TransitionUnavailable)
        }

        const snapshot = capture(groups, context)
        if (!snapshot) return

        apply(groups, context)

        if (sourceColumnId === targetColumnId) return onError(null)

        const { item: order, error } = await persist(targetColumnId, context.itemId)

        onError(error)

        return order
            ? commit(groups, order, targetColumnId)
            : rollback(groups, snapshot)
    }
}
