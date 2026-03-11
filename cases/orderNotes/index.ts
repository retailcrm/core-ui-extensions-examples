import { createI18n } from 'vue-i18n'
import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'
import { useOrderCardContext as useOrder } from '@retailcrm/embed-ui'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { useCurrentUserContext as useUser } from '@retailcrm/embed-ui'

import WidgetApp from './WidgetApp.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia) {
        const i18n = createI18n({ legacy: false, fallbackLocale: 'en-GB' })
        const app = createApp(WidgetApp)

        app.use(pinia)
        app.use(i18n)

        await Promise.allSettled([
            useOrder(),
            useSettings(),
            useUser(),
        ].map(c => c.initialize()))

        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
