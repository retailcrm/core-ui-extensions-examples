import type { SandboxOrderTarget } from '@retailcrm/embed-ui-v1-sandbox/scenario'
import type {
    SandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'

import { afterEach, describe, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/dom'
import { test } from 'vitest'
import { within } from '@testing-library/dom'

import {
    createExtensionSourceWorker,
    createSandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'

import descriptor from '@cases/promoModule/extensionrc.json'

let runtime: SandboxWorkerRuntime | null = null

describe('promoModule worker extension', () => {
    afterEach(async () => {
        await runtime?.teardown()
        runtime = null
        document.body.innerHTML = ''
        window.history.replaceState(null, '', '/')
        window.sessionStorage.clear()
    })

    test('renders promotion settings page', async () => {
        const sourceWorker = createExtensionSourceWorker(
            new URL('@cases/promoModule/index.ts', import.meta.url)
        )

        runtime = await createSandboxWorkerRuntime({
            descriptorUuid: descriptor.code,
            ready: sourceWorker.ready,
            worker: sourceWorker.worker,
        })

        await runtime.runPage(descriptor.pages[0].code)

        expect(await screen.findByRole('heading', { name: 'Настройки акций' })).toBeInstanceOf(HTMLElement)
        expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInstanceOf(HTMLButtonElement)
        expect(screen.getByRole('button', { name: 'Предпросмотр' })).toBeInstanceOf(HTMLButtonElement)
        expect(screen.getByDisplayValue('Весенняя распродажа')).toBeInstanceOf(HTMLInputElement)
        expect(screen.getByDisplayValue('PROMO-2026')).toBeInstanceOf(HTMLInputElement)
        expect(screen.getByText('150000 ₽')).toBeInstanceOf(HTMLElement)
    })

    test('opens order promotion widget drawer', async () => {
        const sourceWorker = createExtensionSourceWorker(
            new URL('@cases/promoModule/index.ts', import.meta.url)
        )

        runtime = await createSandboxWorkerRuntime({
            descriptorUuid: descriptor.code,
            ready: sourceWorker.ready,
            worker: sourceWorker.worker,
        })

        await runtime.runWidget(descriptor.targets[0] as SandboxOrderTarget)

        fireEvent.click(await screen.findByRole('button', { name: 'Акции' }))

        const drawer = await screen.findByRole('dialog')

        expect(await within(drawer).findByText('Акции')).toBeInstanceOf(HTMLElement)
        expect(within(drawer).getByText('Номер заказа')).toBeInstanceOf(HTMLElement)
        expect(within(drawer).getByText('#215C')).toBeInstanceOf(HTMLElement)
        expect(within(drawer).getByText('3 товара в заказе')).toBeInstanceOf(HTMLElement)
    })
})
