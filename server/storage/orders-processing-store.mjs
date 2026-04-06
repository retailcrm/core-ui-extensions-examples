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
            takenAt: null,
            processedAt: null,
        }
    }

    if (!order.managerId) {
        return {
            processingStatus: 'unassigned',
            takenAt: null,
            processedAt: null,
        }
    }

    const phase = order.id % 4

    if (phase === 0) {
        return {
            processingStatus: 'processed',
            takenAt: order.createdAt,
            processedAt: order.createdAt,
        }
    }

    if (phase === 1) {
        return {
            processingStatus: 'in_progress',
            takenAt: order.createdAt,
            processedAt: null,
        }
    }

    return {
        processingStatus: 'assigned',
        takenAt: null,
        processedAt: null,
    }
}

const normalizeStoredState = (state, fallbackState) => {
    if (!state) {
        return { ...fallbackState }
    }

    return {
        processingStatus: state.processingStatus || fallbackState.processingStatus,
        takenAt: state.takenAt || null,
        processedAt: state.processedAt || null,
    }
}

export const readOrdersProcessingState = async () => {
    return readJsonFile(storagePath, {})
}

export const resolveOrderProcessingState = async (order) => {
    const registry = await readOrdersProcessingState()
    const state = registry[String(order.id)]
    const fallbackState = createDefaultState(order)

    return normalizeStoredState(state, fallbackState)
}

export const resolveOrderProcessingStates = async (orders) => {
    const registry = await readOrdersProcessingState()

    return new Map(orders.map(order => {
        const state = registry[String(order.id)]
        const fallbackState = createDefaultState(order)

        return [order.id, normalizeStoredState(state, fallbackState)]
    }))
}

export const updateOrderProcessingState = async (orderId, nextState) => {
    const registry = await readOrdersProcessingState()

    registry[String(orderId)] = {
        processingStatus: nextState.processingStatus,
        takenAt: nextState.takenAt || null,
        processedAt: nextState.processedAt || null,
    }
    await writeJsonFile(storagePath, registry)

    return { ...registry[String(orderId)] }
}
