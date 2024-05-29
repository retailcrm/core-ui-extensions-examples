import {
    createEndpoint,
    fromInsideIframe,
    release,
    retain,
} from '@remote-ui/rpc'

import {
    createRemoteRoot,
    createRemoteRenderer,
} from '@omnicajs/vue-remote/remote'

import VExtension from '@/extension/VExtension.vue'

const endpoint = createEndpoint(fromInsideIframe())

const createApp = async (channel, component, props) => {
    const remoteRoot = createRemoteRoot(channel, {
        components: [
            'UiButton',
            'UiModalWindow',
            'UiModalWindowSurface',
            'CrmYandexMap',
        ],
    })

    await remoteRoot.mount()

    const app = createRemoteRenderer(remoteRoot).createApp(component, props)

    app.mount(remoteRoot)

    return app
}

let onRelease = () => {}

endpoint.expose({
    async run (channel, api) {
        retain(channel)
        retain(api)

        const app = await createApp(channel, VExtension, {
            api,
        })

        onRelease = () => {
            release(channel)
            release(api)

            app.unmount()
        }
    },

    release () {
        onRelease()
    },
})
