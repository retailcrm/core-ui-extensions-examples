import type {
    SandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'

import { afterEach, describe, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/dom'
import { test } from 'vitest'
import { waitFor, within } from '@testing-library/dom'

import {
    createExtensionSourceWorker,
    createSandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'

import descriptor from '@cases/returnsModule/extensionrc.json'

import {
    createReturnsHttpMiddleware,
    isFilteredReturnsPayload,
} from './__fixtures__/returns'

let runtime: SandboxWorkerRuntime | null = null

describe('returnsModule worker extension', () => {
    afterEach(async () => {
        await runtime?.teardown()
        runtime = null
        document.body.innerHTML = ''
        window.history.replaceState(null, '', '/')
        window.sessionStorage.clear()
    })

    test('filters, opens and saves a return', async () => {
        const sourceWorker = createExtensionSourceWorker(
            new URL('@cases/returnsModule/index.ts', import.meta.url)
        )

        runtime = await createSandboxWorkerRuntime({
            descriptorUuid: descriptor.code,
            httpMiddleware: createReturnsHttpMiddleware(),
            ready: sourceWorker.ready,
            worker: sourceWorker.worker,
        })

        await runtime.runPage(descriptor.pages[0].code)

        expect(await screen.findByRole('heading', { name: 'Список возвратов' })).toBeInstanceOf(HTMLElement)
        expect(await screen.findByText('Найдено: 2')).toBeInstanceOf(HTMLElement)

        fireEvent.input(screen.getByPlaceholderText('Например 100245'), {
            target: { value: '100245' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Применить' }))

        expect(await screen.findByText('Найдено: 1')).toBeInstanceOf(HTMLElement)
        expect(screen.getByText('№100245')).toBeInstanceOf(HTMLElement)

        fireEvent.click(screen.getByRole('button', { name: 'Открыть' }))

        const drawer = await screen.findByRole('dialog')

        expect(await within(drawer).findByText('Возврат #7005')).toBeInstanceOf(HTMLElement)
        fireEvent.click(within(drawer).getByRole('button', { name: 'Сохранить' }))

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

        const calls = runtime.snapshot().host.http

        expect(calls.some(call => call.action === '/return')).toBe(true)
        expect(calls.some(call => call.action === '/returns/save')).toBe(true)
        expect(calls.some(call => call.action === '/returns' && isFilteredReturnsPayload(call.payload))).toBe(true)
        expect(calls.every(call => call.uuid === descriptor.code)).toBe(true)
    })
})
