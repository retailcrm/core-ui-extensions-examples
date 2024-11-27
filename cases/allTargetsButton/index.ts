import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'
import { createI18n } from 'vue-i18n';

import AllTargetsButtonExtension from './AllTargetsButtonExtension.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia, target) {
        const i18n = createI18n({ legacy: false, fallbackLocale: 'en-GB' })
        const app = createApp(AllTargetsButtonExtension, { target })

        app.use(pinia)
        app.use(i18n)
        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
