import type { SandboxController } from '@retailcrm/embed-ui-v1-sandbox/core'
import type {
    TicketIssueDraftChanges,
} from '@retailcrm/embed-ui-v1-contexts/types/ticket/edit'

import { createSandboxController } from '@retailcrm/embed-ui-v1-sandbox/core'
import {
    schema as editorSchema,
} from '@retailcrm/embed-ui-v1-contexts/remote/ticket/edit'
import {
    schema as editorSettingsSchema,
} from '@retailcrm/embed-ui-v1-contexts/remote/ticket/edit-settings'
import { schema as settingsSchema } from '@retailcrm/embed-ui-v1-contexts/remote/settings'

const schemas = { 'ticket/edit': editorSchema, 'ticket/edit:settings': editorSettingsSchema, settings: settingsSchema }
const statuses = [{ id: 1, code: 'new', name: 'Новый', group: { id: 1, code: 'new', name: 'Новые' } }]
const types = [{ id: 3, name: 'Претензия' }]
const topics = [{ id: 10, name: 'Товар', subtopics: [{ id: 11, name: 'Повреждение' }] }]
const question = (key: string) => ({
    id: null, key, type: null, topic: null, subtopic: null, responsible: null, status: statuses[0], sla: null,
})
export const orderItems = [{ id: 701, orderId: 501, orderNumber: '805', name: 'Чайник', article: 'K01' }]
export type EditorOptions = { rejectActionOnce?: string; rejectWrites?: boolean; failHttp?: boolean }

export const createEditorController = (options: EditorOptions = {}) => {
    let rejected = false
    const controller: SandboxController<typeof schemas> = createSandboxController({
        schemas, globalBridge: false, mode: 'standalone-test',
        contexts: {
            'ticket/edit': {
                mode: 'create', id: null, description: 'Исходное описание', loading: false, issues: [question('draft:first')],
                orders: [{ id: 501, number: '805', manager: '', statusName: null, total: { amount: 2500, currency: 'RUB' }, createdAt: '2026-10-29T10:00:00Z' }],
            },
            'ticket/edit:settings': { statuses, types, topics, creatable: true, editable: true },
            settings: { 'system.locale': 'ru-RU' },
        },
        httpMiddleware: () => ({ status: options.failHttp ? 502 : 200, body: JSON.stringify({ items: orderItems }), headers: {} }),
        actionHandler(name, args, state) {
            if (!rejected && name === options.rejectActionOnce) { rejected = true; throw new Error('Draft update rejected') }
            const issues = state.contexts['ticket/edit'].issues
            if (name === 'addIssue') {
                const key = `draft:${issues.length + 1}`
                controller.patchContext('ticket/edit', { issues: [...issues, question(key)], dirty: true })
                return key
            }
            if (name === 'updateIssue') {
                const [key, changes] = args as [string, TicketIssueDraftChanges]
                controller.patchContext('ticket/edit', {
                    issues: issues.map(issue => issue.key === key ? { ...issue,
                        type: types.find(type => type.id === changes.typeId) ?? issue.type,
                        topic: topics[0], subtopic: topics[0].subtopics.find(item => item.id === changes.subtopicId) ?? issue.subtopic,
                    } : issue), dirty: true,
                })
                return
            }
            if (name === 'addOrderItem') {
                const item = orderItems.find(item => item.id === args[0])!
                controller.patchContext('ticket/edit', { orderItems: [...state.contexts['ticket/edit'].orderItems, {
                    ...item, price: { amount: 2500, currency: 'RUB' }, image: null,
                }], dirty: true })
                return
            }
            throw new Error(`Unsupported editor action: ${name}`)
        },
    })
    const set = controller.endpointApi.set
    controller.endpointApi.set = (context, field, value, onReject) => {
        if (options.rejectWrites && context === 'ticket/edit' && field === 'description') {
            onReject?.({ message: 'Host rejected description update' })
            return
        }
        set(context, field, value, onReject)
    }
    return controller
}
