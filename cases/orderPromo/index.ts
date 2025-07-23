import WidgetApp from './WidgetApp.vue'

import { createI18n } from 'vue-i18n'
import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'
import { useContext as useOrder } from '@retailcrm/embed-ui-v1-contexts/remote/order/card'
import { useContext as useSettings } from '@retailcrm/embed-ui-v1-contexts/remote/settings'
import { useContext as useUser } from '@retailcrm/embed-ui-v1-contexts/remote/user/current'

createWidgetEndpoint({
    async run (createApp, root, pinia) {
        const app = createApp(WidgetApp)

        app.use(pinia)
        app.use(createI18n({
            fallbackLocale: 'en-GB',
            legacy: false,
        }))

        await Promise.allSettled([
            useOrder(),
            useSettings(),
            useUser(),
        ].map(c => c.initialize()))

        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
