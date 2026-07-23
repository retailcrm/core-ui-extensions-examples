import { expect, test } from '@playwright/test'

import {
    createExternalExtensionUrl,
    createSandboxPagePath,
    getExtensionPageCodes,
    readSandboxSnapshot,
} from '@retailcrm/embed-ui-v1-sandbox/automation/playwright'

import { readExtensionDescriptor } from './__utils__/extensions'

const descriptor = readExtensionDescriptor('returnsModule')

test('loads returns page through delivery, filters, opens and saves a return', async ({ page }) => {
    const extensionUrl = createExternalExtensionUrl(descriptor)
    const [pageCode] = getExtensionPageCodes(descriptor)

    await page.goto(createSandboxPagePath({
        extensionUrl,
        manifestUrl: extensionUrl,
        pageCode,
    }))

    await expect(page).toHaveURL(/mode=page/u)
    await expect(page.getByRole('heading', { name: 'Список возвратов' })).toBeVisible()

    await page.getByPlaceholder('Например 100245').fill('100245')
    await page.getByRole('button', { name: 'Применить' }).click()

    await expect(page.locator('body')).toContainText('Найдено: 2')

    const row = page.getByRole('row', { name: /№100245/u }).first()

    await expect(row).toBeVisible()
    await row.getByRole('button', { name: 'Открыть' }).click()

    const sidebar = page.getByRole('dialog')

    await expect(sidebar).toBeVisible()
    await expect(sidebar).toContainText('№100245')
    await sidebar.getByRole('button', { name: 'Сохранить' }).click()
    await expect(sidebar).toBeHidden()

    const snapshot = await readSandboxSnapshot(page)
    const actions = snapshot.host.http.map(record => record.action)

    expect(actions).toEqual(expect.arrayContaining(['/returns', '/return', '/returns/save']))
    expect(snapshot.host.http.every(record => record.response.status === 200)).toBe(true)
})
