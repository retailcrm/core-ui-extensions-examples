import { join } from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        alias: {
            '@cases': join(__dirname, 'cases'),
        },
    },
    test: {
        environment: 'jsdom',
        include: ['tests/unit/**/*.test.ts'],
        reporters: ['dot'],
    },
})
