import type { Recipient } from './types'

import { useHost } from '@retailcrm/embed-ui'

export const useRecipientsRequest = () => {
    const host = useHost()

    return async (): Promise<Recipient[]> => {
        const { body, status } = await host.httpCall('/ticket-workflows/recipients')
        if (status !== 200) throw new Error('Recipients unavailable')
        const data = JSON.parse(body) as { recipients: Recipient[] }
        if (!Array.isArray(data.recipients) || data.recipients.some(item => !Number.isSafeInteger(item.id) || !item.name)) {
            throw new Error('Invalid recipients')
        }
        return data.recipients
    }
}
