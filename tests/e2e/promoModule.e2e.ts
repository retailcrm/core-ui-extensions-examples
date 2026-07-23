import { expect, test } from '@playwright/test'

import {
    createExternalExtensionUrl,
    createSandboxWidgetPath,
    getExtensionTargets,
} from '@retailcrm/embed-ui-v1-sandbox/automation/playwright'

import { readExtensionDescriptor } from './__utils__/extensions'

const descriptor = readExtensionDescriptor('promoModule')

test('loads promo widget through extension delivery and opens its sidebar', async ({ page }) => {
    const extensionUrl = createExternalExtensionUrl(descriptor)
    const [target] = getExtensionTargets(descriptor)
    const stylesheet = await page.request.get(`${extensionUrl}/stylesheet`)

    expect(stylesheet.ok()).toBe(true)
    expect(stylesheet.headers()['content-type']).toContain('text/css')

    await page.goto(createSandboxWidgetPath({
        extensionUrl,
        manifestUrl: extensionUrl,
        targets: [target],
    }))

    const widget = page.getByRole('region', { name: `Цель виджета: ${target}` })

    await expect(widget).toBeVisible()
    await widget.getByRole('button', { name: 'Акции' }).click()

    const sidebar = page.getByRole('dialog')

    await expect(sidebar).toBeVisible()
    await expect(sidebar).toContainText('Номер заказа')
    await expect(sidebar).toContainText('#215C')
    await expect(sidebar).toContainText('3 товара в заказе')
})
