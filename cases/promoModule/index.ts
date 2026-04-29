import { createI18n } from 'vue-i18n'
import {
    definePageRunner,
    defineRunner,
    defineWidgetRunner,
    runEndpoint,
} from '@retailcrm/embed-ui-v1-endpoint/remote'

import PromoPicker from './PromoPicker.vue'
import SettingsPage from './SettingsPage.vue'

const selectRussianPlural = (
    choice: number,
    choicesLength: number,
    defaultPluralRule?: (choice: number, choicesLength: number) => number
) => {
    if (choicesLength !== 4) {
        return defaultPluralRule?.(choice, choicesLength) ?? Math.min(choice, choicesLength - 1)
    }

    if (choice === 0) {
        return 0
    }

    if (!Number.isInteger(choice)) {
        return 3
    }

    const absoluteChoice = Math.abs(choice)
    const lastTwoDigits = absoluteChoice % 100
    const lastDigit = absoluteChoice % 10

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 3
    }

    if (lastDigit === 1) {
        return 1
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 2
    }

    return 3
}

const createI18nInstance = () => createI18n({
    legacy: false,
    locale: 'ru-RU',
    fallbackLocale: 'en-GB',
    pluralRules: {
        'ru-RU': selectRussianPlural,
    },
})

runEndpoint(defineRunner({
    widgets: [{
        'order/card:common.after': defineWidgetRunner(PromoPicker, app => {
            app.use(createI18nInstance())
        }),
    }],
    pages: [{
        settings: definePageRunner(SettingsPage, app => {
            app.use(createI18nInstance())
        }),
    }],
}))
