import { createI18n } from 'vue-i18n'
import {
    definePageRunner,
    defineRunner,
    runEndpoint,
} from '@retailcrm/embed-ui-v1-endpoint/remote'

import ReturnsPage from './ReturnsPage.vue'

const createI18nInstance = () => createI18n({
    legacy: false,
    locale: 'ru-RU',
    fallbackLocale: 'en-GB',
})

runEndpoint(defineRunner({
    widgets: [{}],
    pages: [{
        returns: definePageRunner(ReturnsPage, app => {
            app.use(createI18nInstance())
        }),
    }],
}))
