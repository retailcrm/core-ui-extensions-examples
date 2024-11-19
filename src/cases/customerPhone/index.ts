import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'

import CustomerPhoneExtension from './CustomerPhoneExtension.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia, target) {
        const app = createApp(CustomerPhoneExtension, { target })

        app.use(pinia)
        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
