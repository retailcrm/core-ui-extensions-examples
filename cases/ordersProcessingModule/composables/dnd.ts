import type { Ref } from 'vue'
import type { RemoteSortableEvent } from '@omnicajs/vue-remote/remote'

import type {
    ColumnState,
    ManagerOption,
    MoveResult,
    MoveSnapshot,
    OrderCard,
    ProcessingColumnId,
} from '../types'

interface UseProcessingDragAndDropOptions {
    appliedAssigneeId: Ref<string>;
    ensureColumnState: (columnId: string) => ColumnState;
    getUnassignedLabel: () => string;
    managers: Ref<ManagerOption[]>;
    persistCardMove: (targetColumnId: ProcessingColumnId, itemId: string) => Promise<MoveResult>;
    setBoardError: (message: string) => void;
    transitions: Ref<Record<ProcessingColumnId, ProcessingColumnId[]>>;
    transitionUnavailableMessage: () => string;
}

const PROCESSING_COLUMN_IDS: ProcessingColumnId[] = [
    'unassigned',
    'assigned',
    'in_progress',
    'processed',
]

// eslint-disable-next-line max-lines-per-function
export const useProcessingDragAndDrop = ({
    appliedAssigneeId,
    ensureColumnState,
    getUnassignedLabel,
    managers,
    persistCardMove,
    setBoardError,
    transitions,
    transitionUnavailableMessage,
}: UseProcessingDragAndDropOptions) => {
    const isProcessingColumnId = (value: string | null): value is ProcessingColumnId => {
        return value !== null && PROCESSING_COLUMN_IDS.includes(value as ProcessingColumnId)
    }

    const getManagerName = (managerId: number | null) => {
        if (!managerId) {
            return getUnassignedLabel()
        }

        return managers.value.find(manager => manager.id === managerId)?.name || getUnassignedLabel()
    }

    const resolveOptimisticAssigneeId = (card: OrderCard, targetColumnId: ProcessingColumnId) => {
        if (targetColumnId === 'unassigned') {
            return null
        }

        const filteredManagerId = Number(appliedAssigneeId.value)

        if (Number.isFinite(filteredManagerId) && managers.value.some(manager => manager.id === filteredManagerId)) {
            return filteredManagerId
        }

        if (card.assigneeId && managers.value.some(manager => manager.id === card.assigneeId)) {
            return card.assigneeId
        }

        if (card.crmManagerId && managers.value.some(manager => manager.id === card.crmManagerId)) {
            return card.crmManagerId
        }

        return managers.value[0]?.id ?? null
    }

    const buildOptimisticCard = (card: OrderCard, targetColumnId: ProcessingColumnId): OrderCard => {
        const assigneeId = resolveOptimisticAssigneeId(card, targetColumnId)

        return {
            ...card,
            processingStatus: targetColumnId,
            assigneeId,
            assigneeName: getManagerName(assigneeId),
        }
    }

    const captureMoveSnapshot = (
        sourceColumnId: ProcessingColumnId,
        targetColumnId: ProcessingColumnId,
        itemId: string,
        targetIndex: number
    ): MoveSnapshot | null => {
        const sourceState = ensureColumnState(sourceColumnId)
        const targetState = ensureColumnState(targetColumnId)
        const sourceIndex = sourceState.items.findIndex(item => String(item.id) === itemId)

        if (sourceIndex < 0) {
            return null
        }

        return {
            item: { ...sourceState.items[sourceIndex] },
            sourceColumnId,
            sourceIndex,
            sourceTotalCount: sourceState.totalCount,
            targetColumnId,
            targetIndex: Math.min(Math.max(targetIndex, 0), targetState.items.length),
            targetTotalCount: targetState.totalCount,
        }
    }

    const applyLocalCardMove = (
        sourceColumnId: ProcessingColumnId,
        targetColumnId: ProcessingColumnId,
        itemId: string,
        targetIndex: number
    ) => {
        const sourceState = ensureColumnState(sourceColumnId)
        const targetState = ensureColumnState(targetColumnId)
        const sourceIndex = sourceState.items.findIndex(item => String(item.id) === itemId)

        if (sourceIndex < 0) {
            return
        }

        const [card] = sourceState.items.splice(sourceIndex, 1)
        const normalizedTargetIndex = Math.min(Math.max(targetIndex, 0), targetState.items.length)

        targetState.items.splice(normalizedTargetIndex, 0, buildOptimisticCard(card, targetColumnId))

        if (sourceColumnId !== targetColumnId) {
            sourceState.totalCount = Math.max(0, sourceState.totalCount - 1)
            targetState.totalCount += 1
        }
    }

    const rollbackLocalCardMove = (snapshot: MoveSnapshot) => {
        const sourceState = ensureColumnState(snapshot.sourceColumnId)
        const targetState = ensureColumnState(snapshot.targetColumnId)
        const currentTargetIndex = targetState.items.findIndex(item => item.id === snapshot.item.id)

        if (currentTargetIndex >= 0) {
            targetState.items.splice(currentTargetIndex, 1)
        }

        sourceState.items.splice(snapshot.sourceIndex, 0, snapshot.item)
        sourceState.totalCount = snapshot.sourceTotalCount
        targetState.totalCount = snapshot.targetTotalCount
    }

    const replaceMovedCard = (targetColumnId: ProcessingColumnId, item: OrderCard) => {
        const targetState = ensureColumnState(targetColumnId)
        const currentTargetIndex = targetState.items.findIndex(entry => entry.id === item.id)

        if (currentTargetIndex >= 0) {
            targetState.items.splice(currentTargetIndex, 1, item)
        }
    }

    const resolveMoveContext = (event: RemoteSortableEvent) => {
        if (
            !event.accepted
            || event.targetIndex === null
            || !isProcessingColumnId(event.sourceContainerId)
            || !isProcessingColumnId(event.targetContainerId)
        ) {
            return null
        }

        return {
            sourceColumnId: event.sourceContainerId,
            targetColumnId: event.targetContainerId,
            targetIndex: event.targetIndex,
        }
    }

    const moveCard = async (event: RemoteSortableEvent) => {
        const context = resolveMoveContext(event)

        if (!context) {
            return
        }

        const { sourceColumnId, targetColumnId, targetIndex } = context
        const allowedTargets = transitions.value[sourceColumnId] || []

        if (sourceColumnId !== targetColumnId && !allowedTargets.includes(targetColumnId)) {
            setBoardError(transitionUnavailableMessage())
            return
        }

        const snapshot = captureMoveSnapshot(sourceColumnId, targetColumnId, event.itemId, targetIndex)
        if (!snapshot) return

        applyLocalCardMove(sourceColumnId, targetColumnId, event.itemId, targetIndex)

        if (sourceColumnId === targetColumnId) {
            setBoardError('')
            return
        }

        const result = await persistCardMove(targetColumnId, event.itemId)

        if (!result.ok) {
            rollbackLocalCardMove(snapshot)
            setBoardError(result.error)
            return
        }

        replaceMovedCard(targetColumnId, result.item)
        setBoardError('')
    }

    return {
        moveCard,
    }
}
