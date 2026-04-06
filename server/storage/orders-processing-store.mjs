import { join } from 'node:path'

import {
    readJsonFile,
    writeJsonFile,
} from './json-file-store.mjs'

const storagePath = join(process.cwd(), 'server', 'data', 'orders-processing-state.json')

const createDefaultState = (order) => {
    if (!order) {
        return {
            processingStatus: 'unassigned',
            assigneeId: null,
            takenAt: null,
            processedAt: null,
        }
    }

    if (!order.managerId) {
        return {
            processingStatus: 'unassigned',
            assigneeId: null,
            takenAt: null,
            processedAt: null,
        }
    }

    const phase = order.id % 4

    if (phase === 0) {
        return {
            processingStatus: 'processed',
            assigneeId: order.managerId,
            takenAt: order.createdAt,
            processedAt: order.createdAt,
        }
    }

    if (phase === 1) {
        return {
            processingStatus: 'in_progress',
            assigneeId: order.managerId,
            takenAt: order.createdAt,
            processedAt: null,
        }
    }

    return {
        processingStatus: 'assigned',
        assigneeId: order.managerId,
        takenAt: null,
        processedAt: null,
    }
}

export const readOrdersProcessingState = async () => {
    return readJsonFile(storagePath, {})
}

export const resolveOrderProcessingState = async (order) => {
    const registry = await readOrdersProcessingState()
    const state = registry[String(order.id)]

    return state ? { ...state } : createDefaultState(order)
}

export const resolveOrderProcessingStates = async (orders) => {
    const registry = await readOrdersProcessingState()

    return new Map(orders.map(order => {
        const state = registry[String(order.id)]

        return [order.id, state ? { ...state } : createDefaultState(order)]
    }))
}

export const updateOrderProcessingState = async (orderId, nextState) => {
    const registry = await readOrdersProcessingState()

    registry[String(orderId)] = nextState
    await writeJsonFile(storagePath, registry)

    return { ...nextState }
}
