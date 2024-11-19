import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'

import YandexMapExtension from './YandexMapExtension.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia, target) {
        const app = createApp(YandexMapExtension, { target })

        app.use(pinia)
        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
