import { createI18n } from 'vue-i18n'
import {
    definePageRunner,
    defineRunner,
    runEndpoint,
} from '@retailcrm/embed-ui-v1-endpoint/remote'

import SummaryPage from './SummaryPage.vue'
import TasksPage from './TasksPage.vue'

const createI18nInstance = () => createI18n({
    legacy: false,
    locale: 'ru-RU',
    fallbackLocale: 'en-GB',
})

runEndpoint(defineRunner({
    widgets: [{}],
    pages: [{
        board: definePageRunner(TasksPage, app => {
            app.use(createI18nInstance())
        }),
        summary: definePageRunner(SummaryPage, app => {
            app.use(createI18nInstance())
        }),
    }],
}))
