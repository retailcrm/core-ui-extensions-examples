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

import VApp from '@/extension/VApp.vue'

import { hostEvents } from './events'

const endpoint = createEndpoint(fromInsideIframe())

const createApp = async (channel, component, props) => {
    const remoteRoot = createRemoteRoot(channel, {
        components: [
            'UiButton',
            'UiModalWindow',
            'UiModalWindowSurface',
            'CrmYandexMap',
            'CrmPlacement',
        ],
    })

    await remoteRoot.mount()

    const app = createRemoteRenderer(remoteRoot).createApp(component, props)

    app.provide('hostEventListener', hostEvents.addListener.bind(hostEvents))

    app.mount(remoteRoot)

    return app
}

let onRelease = () => {}

endpoint.expose({
    async run (channel, api, scopes) {
        retain(channel)
        retain(api)

        const app = await createApp(channel, VApp, {
            api,
            scopes,
        })

        onRelease = () => {
            hostEvents.clear()
            release(channel)
            release(api)

            app.unmount()
        }
    },

    release () {
        onRelease()
    },

    /**
     * Метод будет вызван при наступлении события в хостовом приложении
     * Например, при добавлении нового плейсмента
     */
    onEvent (eventName, eventData) {
        hostEvents.call(eventName, eventData)
    },
})
