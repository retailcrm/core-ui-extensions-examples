import type { EditorOptions } from '../__fixtures__/ticketClaim'

import type { Channel } from '@omnicajs/vue-remote/remote'

import { createApp } from 'vue'
import { createEndpoint } from '@remote-ui/rpc'
import {
    createExtensionSourceWorker,
} from '@retailcrm/embed-ui-v1-sandbox/automation/browser'
import { createProvider } from '@retailcrm/embed-ui-v1-components/host'
import { createReceiver } from '@omnicajs/vue-remote/host'
import { fromWebWorker } from '@remote-ui/rpc'
import { h } from 'vue'
import { HostedTree } from '@omnicajs/vue-remote/host'
import { markRaw } from 'vue'
import { nextTick } from 'vue'

import { createEditorController } from '../__fixtures__/ticketClaim'

// Sandbox 0.9.33 has no editor fixture. Use the public core and an actual worker
// to exercise the editor contract without patching or casting the built-in runtime.
export const createEditorRuntime = async (options: EditorOptions = {}) => {
    const source = createExtensionSourceWorker(new URL('@cases/ticketClaim/index.ts', import.meta.url))
    const controller = createEditorController(options)
    const receiver = markRaw(createReceiver())
    const provider = markRaw(createProvider())
    const app = createApp({ render: () => h(HostedTree, { receiver, provider }) })
    const root = document.createElement('div')
    const config = { id: 'ticket-editor-example', target: 'ticket/edit:issues.after' }
    const endpoint = createEndpoint<{
        run(channel: Channel, config: { id: string; target: string }): Promise<void>;
        release(config: { id: string; target: string }): Promise<void>;
            }>(fromWebWorker(source.worker))

    endpoint.expose(controller.endpointApi)
    document.body.append(root)
    app.mount(root)
    let workerReady = false
    const teardown = async () => {
        try {
            app.unmount()
            await nextTick()
            await receiver.flush()
            if (workerReady) await endpoint.call.release(config)
        } finally {
            endpoint.terminate()
            source.worker.terminate()
            controller.dispose()
            root.remove()
        }
    }
    try {
        await source.ready
        workerReady = true
        await endpoint.call.run(receiver.receive, config)
        return { controller, teardown }
    } catch (error) {
        await teardown()
        throw error
    }
}
