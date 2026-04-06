import { createI18n } from 'vue-i18n'
import {
    definePageRunner,
    defineRunner,
    runEndpoint,
} from '@retailcrm/embed-ui-v1-endpoint/remote'

import OrdersProcessingPage from './ProcessingPage.vue'

const createI18nInstance = () => createI18n({
    legacy: false,
    locale: 'ru-RU',
    fallbackLocale: 'en-GB',
})

runEndpoint(defineRunner({
    widgets: [{}],
    pages: [{
        board: definePageRunner(OrdersProcessingPage, app => {
            app.use(createI18nInstance())
        }),
    }],
}))
