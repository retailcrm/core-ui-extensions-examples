import type { SerializedEventType } from '@omnicajs/vue-remote/types/events'

export const onSerializedEvent = <T extends Event>(handler: (event: SerializedEventType<T>) => void) => {
    return (event: Event) => {
        handler(event as SerializedEventType<T>)
    }
}
