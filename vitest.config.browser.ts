import { join } from 'node:path'

import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import svg from 'vite-svg-loader'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import vueRemoteVitePlugin from '@omnicajs/vue-remote/vite-plugin'

export default defineConfig({
    plugins: [
        vueRemoteVitePlugin(),
        svg(),
        vue(),
        vueI18n({
            defaultSFCLang: 'json',
        }),
    ],
    resolve: {
        alias: {
            '~@retailcrm/embed-ui-v1-components': join(
                __dirname,
                'node_modules/@retailcrm/embed-ui-v1-components'
            ),
        },
    },
    optimizeDeps: {
        include: [
            '@omnicajs/symfony-router',
            '@omnicajs/vue-remote/host',
            '@omnicajs/vue-remote/remote',
            '@remote-ui/rpc',
            '@retailcrm/embed-ui',
            '@retailcrm/embed-ui-v1-components/host',
            '@retailcrm/embed-ui-v1-components/remote',
            '@retailcrm/embed-ui-v1-contexts/remote/order/card',
            '@retailcrm/embed-ui-v1-contexts/remote/settings',
            '@retailcrm/embed-ui-v1-endpoint/remote',
            'vue',
            'vue-i18n',
        ],
    },
    server: {
        allowedHosts: true,
    },
    test: {
        include: ['tests/browser/**/*.browser.test.ts'],
        reporters: ['dot'],
        browser: {
            enabled: true,
            provider: playwright({
                launchOptions: {
                    channel: 'chromium',
                },
            }),
            headless: true,
            screenshotFailures: true,
            screenshotDirectory: 'artifacts/browser/screenshots',
            instances: [{ browser: 'chromium' }],
        },
    },
})
