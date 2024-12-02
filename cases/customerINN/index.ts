import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'
import { createI18n } from 'vue-i18n'

import CustomerINNExtension from './CustomerINNExtension.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia) {
        const i18n = createI18n({ legacy: false, fallbackLocale: 'en-GB' })
        const app = createApp(CustomerINNExtension)

        app.use(pinia)
        app.use(i18n)
        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())