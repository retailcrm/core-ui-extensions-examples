import type {
    SandboxExtensionFixtureDescriptor,
} from '@retailcrm/embed-ui-v1-sandbox/automation/playwright'

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const readExtensionDescriptor = (
    caseName: string
): SandboxExtensionFixtureDescriptor => {
    const descriptorPath = resolve(process.cwd(), 'cases', caseName, 'extensionrc.json')

    return JSON.parse(readFileSync(descriptorPath, 'utf8')) as SandboxExtensionFixtureDescriptor
}
