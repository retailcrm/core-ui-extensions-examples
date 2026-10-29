import { afterEach, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/dom'
import { test } from 'vitest'
import { waitFor, within } from '@testing-library/dom'

import { createEditorRuntime } from './__utils__/ticketClaimRuntime'

let runtime: Awaited<ReturnType<typeof createEditorRuntime>> | null = null

afterEach(async () => {
    try { await runtime?.teardown() } finally { runtime = null; document.body.innerHTML = '' }
})

const prepareClaim = async (createNew = true) => {
    fireEvent.click(await screen.findByRole('button', { name: 'Оформить претензию' }))
    const dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(await dialog.findByRole('checkbox', { name: 'Чайник · K01' }))
    fireEvent.input(dialog.getByRole('textbox', { name: 'Что повреждено и когда обнаружено' }), { target: { value: 'Трещина на корпусе при распаковке' } })
    if (createNew) fireEvent.click(dialog.getByRole('checkbox', { name: 'Создать отдельный вопрос' }))
    fireEvent.click(dialog.getByRole('combobox', { name: 'Тип вопроса' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Претензия' }))
    fireEvent.click(dialog.getByRole('combobox', { name: 'Тема и подтема' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Товар · Повреждение' }))
    const preview = dialog.getByRole('button', { name: 'Предпросмотр' })
    await waitFor(() => expect(preview.hasAttribute('disabled')).toBe(false))
    fireEvent.click(preview)
    await dialog.findByRole('heading', { name: 'Предпросмотр' })
    await dialog.findByRole('button', { name: 'Применить' })
    return dialog
}

test('previews a claim, then updates only the unsaved draft with a new question and order item', async () => {
    runtime = await createEditorRuntime()
    const dialog = await prepareClaim()
    expect(runtime.controller.snapshot().host.actions).toEqual([])
    expect(runtime.controller.snapshot().contexts['ticket/edit'].description).toBe('Исходное описание')
    expect(dialog.getByText(/Претензия по заказу №805/u).textContent).toContain('Трещина на корпусе')
    fireEvent.click(dialog.getByRole('button', { name: 'Применить' }))
    await dialog.findByText('Претензия добавлена в черновик. Сохраните обращение в CRM.')
    const snapshot = runtime.controller.snapshot()
    const draft = snapshot.contexts['ticket/edit']
    expect(draft.id).toBeNull()
    expect(draft.issues[0].type).toBeNull()
    expect(draft.issues[1]).toMatchObject({ key: 'draft:2', type: { id: 3 }, subtopic: { id: 11 } })
    expect(draft.orderItems.map(item => item.id)).toEqual([701])
    expect(draft.description).toContain('Исходное описание\n\nПретензия по заказу №805')
    expect(snapshot.host.actions.map(action => action.name)).toEqual(['addIssue', 'updateIssue', 'addOrderItem'])
    expect(snapshot.host.actions[1].args).toEqual(['draft:2', { typeId: 3, subtopicId: 11 }])
    expect(screen.queryByRole('button', { name: 'Сохранить' })).toBeNull()
})

test('updates the selected existing question while preserving its status and assignee', async () => {
    runtime = await createEditorRuntime()
    const before = runtime.controller.snapshot().contexts['ticket/edit'].issues[0]
    const dialog = await prepareClaim(false)
    fireEvent.click(dialog.getByRole('button', { name: 'Применить' }))
    await dialog.findByText('Претензия добавлена в черновик. Сохраните обращение в CRM.')
    const issues = runtime.controller.snapshot().contexts['ticket/edit'].issues
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ key: before.key, status: before.status, responsible: before.responsible, type: { id: 3 } })
    expect(runtime.controller.snapshot().host.actions.map(action => action.name)).toEqual(['updateIssue', 'addOrderItem'])
})

test('continues after a rejected step without adding a duplicate question', async () => {
    runtime = await createEditorRuntime({ rejectActionOnce: 'updateIssue' })
    const dialog = await prepareClaim()
    fireEvent.click(dialog.getByRole('button', { name: 'Применить' }))
    await dialog.findByText(/Часть изменений уже внесена/u)
    expect(runtime.controller.snapshot().contexts['ticket/edit'].description).toBe('Исходное описание')
    fireEvent.click(dialog.getByRole('button', { name: 'Продолжить' }))
    await dialog.findByText('Претензия добавлена в черновик. Сохраните обращение в CRM.')
    expect(runtime.controller.snapshot().contexts['ticket/edit'].issues).toHaveLength(2)
    expect(runtime.controller.snapshot().host.actions.filter(action => action.name === 'addIssue')).toHaveLength(1)
})

test('stops retry if a completed question was removed in CRM', async () => {
    runtime = await createEditorRuntime({ rejectActionOnce: 'addOrderItem' })
    const dialog = await prepareClaim()
    fireEvent.click(dialog.getByRole('button', { name: 'Применить' }))
    await dialog.findByText(/Часть изменений уже внесена/u)
    const issues = runtime.controller.snapshot().contexts['ticket/edit'].issues
    runtime.controller.patchContext('ticket/edit', { issues: [issues[0]] })
    // Receive the host change through a user-visible lifecycle transition.
    fireEvent.click(dialog.getByRole('button', { name: 'Закрыть' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Оформить претензию' }))
    const reopened = within(await screen.findByRole('dialog'))
    fireEvent.click(await reopened.findByRole('button', { name: 'Продолжить' }))
    await reopened.findByText(/Результаты предыдущих шагов изменились/u)
    expect(runtime.controller.snapshot().contexts['ticket/edit'].description).toBe('Исходное описание')
    expect(runtime.controller.snapshot().contexts['ticket/edit'].orderItems).toEqual([])
    expect(runtime.controller.snapshot().host.actions.filter(action => action.name === 'addOrderItem')).toHaveLength(1)
    expect(reopened.queryByText('Претензия добавлена в черновик. Сохраните обращение в CRM.')).toBeNull()
})

test('does not claim success when the host rejects the description', async () => {
    runtime = await createEditorRuntime({ rejectWrites: true })
    const dialog = await prepareClaim()
    fireEvent.click(dialog.getByRole('button', { name: 'Применить' }))
    await dialog.findByText(/Часть изменений уже внесена/u)
    expect(runtime.controller.snapshot().contexts['ticket/edit'].description).toBe('Исходное описание')
    expect(dialog.queryByText('Претензия добавлена в черновик. Сохраните обращение в CRM.')).toBeNull()
    fireEvent.click(dialog.getByRole('button', { name: 'Продолжить' }))
    await waitFor(() => expect(runtime!.controller.snapshot().host.actions).toHaveLength(3))
    expect(runtime.controller.snapshot().contexts['ticket/edit'].issues).toHaveLength(2)
})

test('preserves changes made in CRM after preview', async () => {
    runtime = await createEditorRuntime()
    const dialog = await prepareClaim()
    runtime.controller.patchContext('ticket/edit', { description: 'Уточнение оператора' })
    await dialog.findByText(/Черновик изменился/u)
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Применить' }).hasAttribute('disabled')).toBe(true))
    expect(runtime.controller.snapshot().contexts['ticket/edit'].description).toBe('Уточнение оператора')
    expect(runtime.controller.snapshot().host.actions).toEqual([])
})

test('locks the inline action during saving and honors create versus edit permissions', async () => {
    runtime = await createEditorRuntime()
    const open = await screen.findByRole('button', { name: 'Оформить претензию' })
    runtime.controller.patchContext('ticket/edit', { saving: true })
    await waitFor(() => expect(open.hasAttribute('disabled')).toBe(true))
    runtime.controller.patchContext('ticket/edit', { saving: false })
    runtime.controller.patchContext('ticket/edit:settings', { creatable: false, editable: true })
    await waitFor(() => expect(open.hasAttribute('disabled')).toBe(true))
    runtime.controller.patchContext('ticket/edit', { mode: 'edit', id: 124 })
    await waitFor(() => expect(open.hasAttribute('disabled')).toBe(false))
    runtime.controller.patchContext('ticket/edit:settings', { editable: false })
    await waitFor(() => expect(open.hasAttribute('disabled')).toBe(true))
})

test('shows backend failure without writing to the draft', async () => {
    runtime = await createEditorRuntime({ failHttp: true })
    fireEvent.click(await screen.findByRole('button', { name: 'Оформить претензию' }))
    expect(await screen.findByText('Не удалось загрузить товары заказов. Повторите загрузку.')).toBeInstanceOf(HTMLElement)
    expect((await screen.findByRole('button', { name: 'Предпросмотр' })).hasAttribute('disabled')).toBe(true)
    expect(runtime.controller.snapshot().host.actions).toEqual([])
})
