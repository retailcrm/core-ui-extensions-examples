import type { BootstrapPayload, ColumnPayload } from '../types'

import { useHost } from '@retailcrm/embed-ui'

export const useBootstrapRequest = () => {
    const host = useHost()

    return async (): Promise<BootstrapPayload> => {
        const { body, status } = await host.httpCall('/orders-processing/bootstrap', {})

        if (status !== 200) {
            throw new Error(body)
        }

        return JSON.parse(body) as BootstrapPayload
    }
}

export const useColumnRequest = () => {
    const host = useHost()

    return async (payload: {
        column: string;
        page: number;
        limit: number;
        assigneeIds: string[];
        crmStatuses: string[];
        orderTypes: string[];
        sites: string[];
    }): Promise<ColumnPayload> => {
        const { body, status } = await host.httpCall('/orders-processing/column', payload)

        if (status !== 200) {
            throw new Error(body)
        }

        return JSON.parse(body) as ColumnPayload
    }
}
