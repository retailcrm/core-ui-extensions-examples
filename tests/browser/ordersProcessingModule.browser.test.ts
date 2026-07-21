import type {
    SandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'

import { afterEach, describe, expect } from 'vitest'
import { fireEvent } from '@testing-library/dom'
import { screen } from '@testing-library/dom'
import { test } from 'vitest'
import { waitFor, within } from '@testing-library/dom'

import {
    createExtensionSourceWorker,
    createSandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'

import descriptor from '@cases/ordersProcessingModule/extensionrc.json'

import { createOrdersProcessingHttpMiddleware } from './__fixtures__/ordersProcessing'
import { dragTo, getDragHandle, getSortableContainer } from './__utils__/dnd'
import { isManagerFilterPayload, isMovePayload } from './__fixtures__/ordersProcessing'

let runtime: SandboxWorkerRuntime | null = null

describe('ordersProcessingModule worker extension', () => {
    afterEach(async () => {
        await runtime?.teardown()
        runtime = null
        document.body.innerHTML = ''
        window.history.replaceState(null, '', '/')
        window.sessionStorage.clear()
    })

    test('filters board and persists an allowed card move', async () => {
        const sourceWorker = createExtensionSourceWorker(
            new URL('@cases/ordersProcessingModule/index.ts', import.meta.url)
        )

        runtime = await createSandboxWorkerRuntime({
            descriptorUuid: descriptor.code,
            httpMiddleware: createOrdersProcessingHttpMiddleware(),
            ready: sourceWorker.ready,
            worker: sourceWorker.worker,
        })

        await configureHost(runtime)
        await runtime.runPage(descriptor.pages[0].code)

        expect(await screen.findByRole('heading', { name: 'Обработка заказов' })).toBeInstanceOf(HTMLElement)
        await waitFor(async () => {
            await runtime?.flush()
            expect(screen.getByText('#100101')).toBeInstanceOf(HTMLElement)
        })

        const initialCard = screen.getByText('#100101').closest('article')
        const initialAssignedContainer = getSortableContainer(
            screen.getByRole('heading', { name: 'Назначен' })
        )

        expect(screen.getByDisplayValue('Анна Смирнова')).toBeInstanceOf(HTMLElement)
        fireEvent.click(screen.getByRole('button', { name: 'Применить фильтр' }))

        await waitFor(async () => {
            await runtime?.flush()
            const calls = runtime?.snapshot().host.http ?? []

            expect(calls.some(call => (
                call.action === '/orders-processing/column'
                && isManagerFilterPayload(call.payload)
            ))).toBe(true)
            expect(initialCard?.isConnected).toBe(false)
            expect(initialAssignedContainer.isConnected).toBe(false)
            expect(screen.getByText('#100101')).toBeInstanceOf(HTMLElement)
            expect(getSortableContainer(
                screen.getByRole('heading', { name: 'Назначен' })
            )).toBeInstanceOf(HTMLElement)
        })

        const cardNumber = screen.getByText('#100101')
        const assignedHeading = screen.getByRole('heading', { name: 'Назначен' })

        await dragTo(getDragHandle(cardNumber), getSortableContainer(assignedHeading))

        await waitFor(async () => {
            await runtime?.flush()
            const calls = runtime?.snapshot().host.http ?? []

            expect(calls.some(call => (
                call.action === '/orders-processing/move'
                && isMovePayload(call.payload)
            ))).toBe(true)
            expect(within(assignedHeading.closest('article') as HTMLElement).getByText(
                '#100101'
            )).toBeInstanceOf(HTMLElement)
        }, { timeout: 5000 })
    })
})

const configureHost = async (workerRuntime: SandboxWorkerRuntime) => {
    const routing = workerRuntime.snapshot().contexts.settings['system.routing']

    workerRuntime.patchContext('settings', {
        'system.routing': {
            ...routing,
            routes: {
                ...routing.routes,
                crm_orders_edit: {
                    defaults: [],
                    hosttokens: [],
                    methods: [],
                    requirements: { id: '\\d+' },
                    schemes: [],
                    tokens: [
                        ['text', '/edit'],
                        ['variable', '/', '\\d+', 'id', true],
                        ['text', '/orders'],
                    ],
                },
            },
        },
    })

    await workerRuntime.controller.endpointApi.replaceQuery({ assignee: '1' })
}
