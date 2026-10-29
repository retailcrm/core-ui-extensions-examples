import { createI18n } from 'vue-i18n'
import {
    defineRunner,
    defineWidgetRunner,
    runEndpoint,
} from '@retailcrm/embed-ui-v1-endpoint/remote'
import {
    useContext as useSettings,
} from '@retailcrm/embed-ui-v1-contexts/remote/settings'
import {
    useContext as useTicket,
} from '@retailcrm/embed-ui-v1-contexts/remote/ticket/edit'
import {
    useContext as useTicketSettings,
} from '@retailcrm/embed-ui-v1-contexts/remote/ticket/edit-settings'

import WidgetApp from './WidgetApp.vue'

import messages from './messages.json'

runEndpoint(defineRunner({
    pages: [{}],
    widgets: [{
        'ticket/edit:issues.after': defineWidgetRunner(WidgetApp, async (app, pinia) => {
            const settings = useSettings(pinia)

            await Promise.all([
                settings.initialize(),
                useTicket(pinia).initialize(),
                useTicketSettings(pinia).initialize(),
            ])
            app.use(createI18n({ legacy: false, locale: settings['system.locale'], fallbackLocale: 'en-GB', messages }))
        }),
    }],
}))
