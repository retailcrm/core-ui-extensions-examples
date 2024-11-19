import { createWidgetEndpoint } from '@retailcrm/embed-ui'
import { fromInsideIframe } from '@remote-ui/rpc'

import FiscalReceiptsExtension from './FiscalReceiptsExtension.vue'

createWidgetEndpoint({
    async run (createApp, root, pinia, target) {
        const app = createApp(FiscalReceiptsExtension, { target })

        app.use(pinia)
        app.mount(root)

        return () => app.unmount()
    },
}, fromInsideIframe())
