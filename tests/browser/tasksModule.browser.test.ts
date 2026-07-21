import type {
    SandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'

import { afterEach, describe, expect } from 'vitest'
import { screen } from '@testing-library/dom'
import { test } from 'vitest'
import { waitFor, within } from '@testing-library/dom'

import {
    createExtensionSourceWorker,
    createSandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'

import descriptor from '@cases/tasksModule/extensionrc.json'

import { dragTo, getDragHandle, getSortableContainer } from './__utils__/dnd'

let runtime: SandboxWorkerRuntime | null = null

describe('tasksModule worker extension', () => {
    afterEach(async () => {
        await runtime?.teardown()
        runtime = null
        document.body.innerHTML = ''
        window.history.replaceState(null, '', '/')
        window.sessionStorage.clear()
    })

    test('renders board and moves task between columns', async () => {
        const sourceWorker = createExtensionSourceWorker(
            new URL('@cases/tasksModule/index.ts', import.meta.url)
        )

        runtime = await createSandboxWorkerRuntime({
            descriptorUuid: descriptor.code,
            ready: sourceWorker.ready,
            worker: sourceWorker.worker,
        })

        await runtime.runPage(descriptor.pages[0].code)

        expect(await screen.findByRole('heading', { name: 'Доска задач CRM' })).toBeInstanceOf(HTMLElement)

        const taskTitle = screen.getByRole('heading', {
            name: 'Подготовить план запуска welcome-цепочки',
        })
        const targetHeading = screen.getByRole('heading', { name: 'В работе' })

        await dragTo(getDragHandle(taskTitle), getSortableContainer(targetHeading))

        await waitFor(async () => {
            await runtime?.flush()
            expect(within(targetHeading.closest('article') as HTMLElement).getByText(
                'Подготовить план запуска welcome-цепочки'
            )).toBeInstanceOf(HTMLElement)
        })
    })

    test('renders summary metrics', async () => {
        const sourceWorker = createExtensionSourceWorker(
            new URL('@cases/tasksModule/index.ts', import.meta.url)
        )

        runtime = await createSandboxWorkerRuntime({
            descriptorUuid: descriptor.code,
            ready: sourceWorker.ready,
            worker: sourceWorker.worker,
        })

        await runtime.runPage(descriptor.pages[1].code)

        expect(await screen.findByRole('heading', { name: 'Сводка по задачам' })).toBeInstanceOf(HTMLElement)
        expect(screen.getByRole('link', { name: 'Открыть доску' })).toBeInstanceOf(HTMLAnchorElement)
        expect(screen.getByText('Всего задач')).toBeInstanceOf(HTMLElement)
        expect(screen.getByText('6')).toBeInstanceOf(HTMLElement)
        expect(screen.getByRole('heading', { name: 'Фокус сейчас' })).toBeInstanceOf(HTMLElement)
    })
})
