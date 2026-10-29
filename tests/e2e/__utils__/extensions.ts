import type { Page } from '@playwright/test'
import type {
    SandboxExtensionFixtureDescriptor,
} from '@retailcrm/embed-ui-v1-sandbox/automation/playwright'

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
    getExtensionPageCodes,
    getExtensionTargets,
    getSandboxExtensionBaseUrl,
    launchSandboxExtension,
} from '@retailcrm/embed-ui-v1-sandbox/automation/playwright'

export const readExtensionDescriptor = (
    caseName: string
): SandboxExtensionFixtureDescriptor => {
    const descriptorPath = resolve(process.cwd(), 'cases', caseName, 'extensionrc.json')

    return JSON.parse(readFileSync(descriptorPath, 'utf8')) as SandboxExtensionFixtureDescriptor
}

export const getExternalExtensionUrl = (descriptor: SandboxExtensionFixtureDescriptor): string => {
    const base = getSandboxExtensionBaseUrl()
    if (!base) throw new Error('SANDBOX_EXTENSION_URL is required')
    return new URL(descriptor.uuid, base).href
}

export const launchExample = async (
    page: Page,
    descriptor: SandboxExtensionFixtureDescriptor,
    options: Omit<Parameters<typeof launchSandboxExtension>[1], 'descriptor'>
) => {
    const url = getExternalExtensionUrl(descriptor)
    await page.goto('/')
    await launchSandboxExtension(page, {
        ...options,
        descriptor: {
            entrypoint: `${url}/script`,
            stylesheet: `${url}/stylesheet`,
            targets: getExtensionTargets(descriptor),
            pages: getExtensionPageCodes(descriptor),
            runner: 'worker',
        },
    })
}
