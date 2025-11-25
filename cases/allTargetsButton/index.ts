import { createI18n } from 'vue-i18n'
import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'

import WidgetApp from './WidgetApp.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia, target) {
        const i18n = createI18n({ legacy: false, fallbackLocale: 'en-GB' })
        const app = createApp(WidgetApp, { target })

        app.use(pinia)
        app.use(i18n)
        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
