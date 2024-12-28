import { createI18n } from 'vue-i18n'
import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'
import { useContext } from '@retailcrm/embed-ui-v1-contexts/remote/custom'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'

import WidgetApp from './WidgetApp.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia) {
        const app = createApp(WidgetApp)
        const i18n = createI18n({ legacy: false, fallbackLocale: 'en-GB' })

        app.use(i18n)
        app.use(pinia)

        await Promise.any([
            useContext('order').initialize(),
            useSettings().initialize(),
        ])

        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
