import { expect } from '@playwright/test'
import { readSandboxSnapshot } from '@retailcrm/embed-ui-v1-sandbox/automation/playwright'
import { test } from '@playwright/test'

import {
    getExternalExtensionUrl,
    launchExample,
    readExtensionDescriptor,
} from './__utils__/extensions'

const descriptor = readExtensionDescriptor('ticketEscalation')

test('delivers the handoff widget, loads staff through its backend and applies the reviewed plan', async ({ page }) => {
    const stylesheet = await page.request.get(`${getExternalExtensionUrl(descriptor)}/stylesheet`)
    expect(stylesheet.ok()).toBe(true)
    expect(stylesheet.headers()['content-type']).toContain('text/css')
    await launchExample(page, descriptor, {
        mode: 'widget', fixture: 'ticket-basic', targets: ['ticket/view:common.before'],
    })
    await page.getByRole('button', { name: /Escalate to second line|Передать на вторую линию/u }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox').first().check()
    await dialog.getByRole('combobox', { name: /Assign to|Кому передать/u }).click()
    await page.getByRole('option').first().click()
    await dialog.getByRole('combobox', { name: /New question status|Новый статус вопросов/u }).click()
    await page.getByRole('option', { name: 'Resolved', exact: true }).click()
    await dialog.getByRole('textbox', { name: /What has been done|Что уже сделано/u }).fill('Requested photos of the damaged item')
    await dialog.getByRole('textbox', { name: /Decision required|Какое решение требуется/u }).fill('Approve a replacement')
    await dialog.getByRole('button', { name: /Preview|Предпросмотр/u }).click()
    expect((await readSandboxSnapshot(page)).host.actions).toEqual([])
    await dialog.getByRole('button', { name: /Apply|Применить/u }).click()
    await expect(dialog.getByText(/Questions handed off|Вопросы переданы/u)).toBeVisible()
    const snapshot = await readSandboxSnapshot(page)
    expect(snapshot.host.actions.map(action => action.name)).toEqual(['changeIssueResponsible', 'changeIssueStatus', 'createComment'])
    expect(snapshot.host.actions[2].args[0]).toContain('Approve a replacement')
})
