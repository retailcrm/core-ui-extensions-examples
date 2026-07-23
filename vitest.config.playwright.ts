import { resolve } from 'node:path'

import { config as configEnv } from 'dotenv'
import { defineConfig, devices } from '@playwright/test'

configEnv({ path: resolve(process.cwd(), '.env.sandbox') })
configEnv({ path: resolve(process.cwd(), '.env') })

const localSandboxUrl = 'http://127.0.0.1:4173'
const localExtensionPort = Number(process.env.EXTENSION_PORT || 3000)

if (!Number.isInteger(localExtensionPort) || localExtensionPort < 1 || localExtensionPort > 65535) {
    throw new Error('EXTENSION_PORT must be an integer between 1 and 65535.')
}

const localExtensionServerUrl = `http://127.0.0.1:${localExtensionPort}`
const localExtensionBaseUrl = `${localExtensionServerUrl}/extension/`
const sandboxBaseUrl = process.env.SANDBOX_BASE_URL || localSandboxUrl
const configuredExtensionBaseUrl = process.env.SANDBOX_EXTENSION_URL || localExtensionBaseUrl
const extensionBaseUrl = configuredExtensionBaseUrl.endsWith('/')
    ? configuredExtensionBaseUrl
    : `${configuredExtensionBaseUrl}/`

const localWebServers = [
    ...(!process.env.SANDBOX_BASE_URL ? [{
        command: 'yarn serve:sandbox',
        reuseExistingServer: !process.env.CI,
        url: localSandboxUrl,
    }] : []),
    ...(!process.env.SANDBOX_EXTENSION_URL ? [{
        command: 'yarn build && yarn serve:extension',
        port: localExtensionPort,
        reuseExistingServer: false,
    }] : []),
]

process.env.SANDBOX_EXTENSION_URL = extensionBaseUrl

export default defineConfig({
    testDir: './tests/e2e',
    testMatch: '**/*.e2e.ts',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['list'],
        ['html', {
            open: 'never',
            outputFolder: 'artifacts/playwright/report',
        }],
    ],
    outputDir: 'artifacts/playwright/results',
    use: {
        baseURL: sandboxBaseUrl,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
    },
    projects: [{
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
    }],
    webServer: localWebServers,
})
