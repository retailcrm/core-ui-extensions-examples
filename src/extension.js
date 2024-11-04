import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'

import VExtension from '@/extension/VExtension.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia, target) {
        const app = createApp(VExtension, { target })

        app.use(pinia)
        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
