import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'

import WidgetApp from './WidgetApp.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia, target) {
        const app = createApp(WidgetApp, { target })

        app.use(pinia)
        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
