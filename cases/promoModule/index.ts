import { createI18n } from 'vue-i18n'
import { defineRunner, runEndpoint } from '@retailcrm/embed-ui-v1-endpoint/remote'

import SettingsPage from './SettingsPage.vue'
import WidgetApp from './WidgetApp.vue'

const createI18nInstance = () => createI18n({
    legacy: false,
    locale: 'ru-RU',
    fallbackLocale: 'en-GB',
})

runEndpoint(defineRunner({
    widgets: [{
        'order/card:common.after': {
            async run (createApp, root, pinia, target) {
                const app = createApp(WidgetApp, { target })
                app.use(pinia)
                app.use(createI18nInstance())
                app.mount(root)

                return () => app.unmount()
            },
        },
    }],
    pages: [{
        settings: {
            async run (createApp, root, pinia, code) {
                const app = createApp(SettingsPage, { code })
                app.use(pinia)
                app.use(createI18nInstance())
                app.mount(root)

                return () => app.unmount()
            },
        },
    }],
}))
