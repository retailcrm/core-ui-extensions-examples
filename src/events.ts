interface IEventData {
    detail: {
        id: string,
        name: string
    }
}

class HostEvents {
    private _listeners

    constructor () {
        this._listeners = new Map()
    }

    addListener (eventName: string, listener: () => void) {
        const eventListeners = this._listeners.get(eventName)

        if (typeof listener !== 'function') {
            return
        }
    
        if (eventListeners) {
            eventListeners.push(listener)
            return
        }
    
        this._listeners.set(eventName, [listener])
    }

    removeListener (eventName: string, listener: () => void) {
        const listeners = this._listeners.get(eventName)
        const listenerIndex = listeners.indexOf(listener)

        if (listenerIndex > -1) {
            listeners.splice(listenerIndex, 1)
        }
    }

    call (eventName: string, eventData: IEventData) {
        (this._listeners.get(eventName) || [])
            .forEach((listener: (eventData: IEventData) => void) => listener(eventData))
    }

    clear () {
        Array.from(this._listeners.keys()).forEach(key => {
            this._listeners.delete(key)
        })
    }
}

export const hostEvents = new HostEvents()
