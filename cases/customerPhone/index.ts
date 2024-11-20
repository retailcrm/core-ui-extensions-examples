import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'

import CustomerPhoneExtension from './CustomerPhoneExtension.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia) {
        const app = createApp(CustomerPhoneExtension)

        app.use(pinia)
        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())