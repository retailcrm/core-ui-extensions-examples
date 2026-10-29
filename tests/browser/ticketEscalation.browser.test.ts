import type {
    SandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'
import type { TicketSandboxSchemas } from '@retailcrm/embed-ui-v1-sandbox/scenario'

import { afterEach } from 'vitest'
import {
    createExtensionSourceWorker,
    createSandboxWorkerRuntime,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'
import { expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/dom'
import { test } from 'vitest'
import { waitFor, within } from '@testing-library/dom'

let runtime: SandboxWorkerRuntime<TicketSandboxSchemas> | null = null

afterEach(async () => {
    await runtime?.teardown()
    runtime = null
    document.body.innerHTML = ''
    window.history.replaceState(null, '', '/')
})

const start = async (fixture: 'ticket-basic' | 'ticket-readonly' = 'ticket-basic', failHttp = false) => {
    const source = createExtensionSourceWorker(new URL('@cases/ticketEscalation/index.ts', import.meta.url))
    runtime = await createSandboxWorkerRuntime({ ...source, fixture,
        httpMiddleware: () => ({ status: failHttp ? 502 : 200, body: JSON.stringify({ recipients: [{ id: 29, name: 'Ирина Волкова' }] }), headers: {} }),
    })
    runtime.patchContext('settings', { 'system.locale': 'ru-RU' })
    await runtime.runWidget('ticket/view:common.before')
    fireEvent.click(await screen.findByRole('button', { name: 'Передать на вторую линию' }))
    return within(await screen.findByRole('dialog'))
}

const prepareHandoff = async () => {
    const dialog = await start()
    await waitFor(() => expect(dialog.getAllByRole('checkbox')[0].hasAttribute('disabled')).toBe(false))
    fireEvent.click(dialog.getAllByRole('checkbox')[0])
    fireEvent.click(dialog.getByRole('combobox', { name: 'Кому передать' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Ирина Волкова' }))
    fireEvent.click(dialog.getByRole('combobox', { name: 'Новый статус вопросов' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Resolved' }))
    fireEvent.input(dialog.getByRole('textbox', { name: 'Что уже сделано' }), { target: { value: 'Запросили фотографии товара' } })
    fireEvent.input(dialog.getByRole('textbox', { name: 'Какое решение требуется' }), { target: { value: 'Согласовать замену' } })
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Предпросмотр' }).hasAttribute('disabled')).toBe(false))
    fireEvent.click(dialog.getByRole('button', { name: 'Предпросмотр' }))
    await dialog.findByRole('heading', { name: 'Предпросмотр' })
    await dialog.findByRole('button', { name: 'Применить' })
    return dialog
}

test('previews then hands off only selected questions and adds a structured comment', async () => {
    const dialog = await prepareHandoff()
    const before = runtime!.snapshot().contexts['ticket/view'].issues
    expect(runtime!.snapshot().host.actions).toEqual([])
    fireEvent.click(dialog.getByRole('button', { name: 'Применить' }))
    await dialog.findByText('Вопросы переданы. Сводка добавлена в комментарии.')
    const snapshot = runtime!.snapshot()
    expect(snapshot.contexts['ticket/view'].issues[0]).toMatchObject({ responsible: { id: 29, kind: 'user' }, status: { id: 2 } })
    expect(snapshot.contexts['ticket/view'].issues.slice(1)).toEqual(before.slice(1))
    expect(snapshot.host.actions.map(action => action.name)).toEqual(['changeIssueResponsible', 'changeIssueStatus', 'createComment'])
    expect(snapshot.host.actions[0].args).toEqual([before[0].id, { kind: 'user', id: 29 }])
    expect(snapshot.host.actions[2].args[0]).toContain('Что уже сделано: Запросили фотографии товара')
    expect(snapshot.host.actions[2].args[0]).toContain('Ожидаемое решение: Согласовать замену')
    expect(dialog.queryByRole('button', { name: 'Применить' })).toBeNull()
})

test('resumes remaining steps after a rejected status change without repeating assignment', async () => {
    const dialog = await prepareHandoff()
    const statuses = runtime!.snapshot().contexts['ticket/view:settings'].statuses
    runtime!.patchContext('ticket/view:settings', { statuses: statuses.filter(status => status.id !== 2) })
    await runtime!.flush()
    fireEvent.click(dialog.getByRole('button', { name: 'Применить' }))
    await dialog.findByText(/Часть изменений уже сохранена/u)
    expect(runtime!.snapshot().host.actions.filter(action => action.name === 'createComment')).toHaveLength(0)
    runtime!.patchContext('ticket/view:settings', { statuses })
    await runtime!.flush()
    fireEvent.click(dialog.getByRole('button', { name: 'Продолжить' }))
    await dialog.findByText('Вопросы переданы. Сводка добавлена в комментарии.')
    expect(runtime!.snapshot().host.actions.filter(action => action.name === 'changeIssueResponsible')).toHaveLength(1)
    expect(runtime!.snapshot().host.actions.filter(action => action.name === 'createComment')).toHaveLength(1)
})

test('stops retry when the completed assignment has been changed in CRM', async () => {
    const dialog = await prepareHandoff()
    const statuses = runtime!.snapshot().contexts['ticket/view:settings'].statuses
    runtime!.patchContext('ticket/view:settings', { statuses: [] })
    await runtime!.flush()
    fireEvent.click(dialog.getByRole('button', { name: 'Применить' }))
    await dialog.findByText(/Часть изменений уже сохранена/u)
    const issues = runtime!.snapshot().contexts['ticket/view'].issues
    runtime!.patchContext('ticket/view', { issues: issues.map(issue => ({ ...issue, responsible: null })) })
    runtime!.patchContext('ticket/view:settings', { statuses })
    await runtime!.flush()
    fireEvent.click(dialog.getByRole('button', { name: 'Продолжить' }))
    await dialog.findByText(/Результаты предыдущих шагов изменились/u)
    expect(runtime!.snapshot().host.actions.filter(action => action.name === 'createComment')).toHaveLength(0)
    expect(runtime!.snapshot().host.actions.filter(action => action.name === 'changeIssueStatus')).toHaveLength(1)
    expect(dialog.queryByText('Вопросы переданы. Сводка добавлена в комментарии.')).toBeNull()
})

test('rejects a stale preview without changing questions', async () => {
    const dialog = await prepareHandoff()
    const issues = runtime!.snapshot().contexts['ticket/view'].issues
    runtime!.patchContext('ticket/view', { issues: issues.map(issue => ({ ...issue, responsible: null })) })
    await runtime!.flush()
    fireEvent.click(dialog.getByRole('button', { name: 'Применить' }))
    await dialog.findByText(/Не удалось передать вопросы/u)
    expect(runtime!.snapshot().host.actions).toEqual([])
})

test('honors readonly permissions and reacts to locale and loading changes', async () => {
    const dialog = await start('ticket-readonly')
    expect(dialog.getAllByRole('checkbox').every(element => element.hasAttribute('disabled'))).toBe(true)
    expect(dialog.getByRole('button', { name: 'Предпросмотр' }).hasAttribute('disabled')).toBe(true)
    runtime!.patchContext('settings', { 'system.locale': 'en-GB' })
    await screen.findByRole('button', { name: 'Escalate to second line' })
    runtime!.patchContext('ticket/view', { loadFailed: true })
    await waitFor(() => expect(dialog.getByRole('button', { name: 'History' }).hasAttribute('disabled')).toBe(true))
    expect(runtime!.snapshot().host.actions).toEqual([])
})

test('offers backend retry and keeps mutations disabled when recipients cannot load', async () => {
    const dialog = await start('ticket-basic', true)
    await dialog.findByText('Не удалось загрузить сотрудников. Повторите загрузку.')
    expect(dialog.getByRole('button', { name: 'Повторить загрузку' })).toBeInstanceOf(HTMLElement)
    expect(dialog.getByRole('button', { name: 'Предпросмотр' }).hasAttribute('disabled')).toBe(true)
    expect(runtime!.snapshot().host.actions).toEqual([])
})
