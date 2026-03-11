import { createI18n } from 'vue-i18n'
import {
    definePageRunner,
    defineRunner,
    defineWidgetRunner,
    runEndpoint,
} from '@retailcrm/embed-ui-v1-endpoint/remote'

import PromoPicker from './PromoPicker.vue'
import SettingsPage from './SettingsPage.vue'

const createI18nInstance = () => createI18n({
    legacy: false,
    locale: 'ru-RU',
    fallbackLocale: 'en-GB',
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
