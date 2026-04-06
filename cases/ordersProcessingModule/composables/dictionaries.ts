import type { DictionaryOption, ManagerOption } from '../types'

import { ref } from 'vue'

import { mapManagers } from '../utils'
import { useDictionaryRequest } from './api'

import { ProcessingStatus } from '../types'

export const useDictionaries = () => {
    const managers = ref<ManagerOption[]>([])
    const statuses = ref<DictionaryOption[]>([])
    const orderTypes = ref<DictionaryOption[]>([])
    const sites = ref<DictionaryOption[]>([])
    const transitions = ref<Record<ProcessingStatus, ProcessingStatus[]>>({
        [ProcessingStatus.Unassigned]: [ProcessingStatus.Assigned],
        [ProcessingStatus.Assigned]: [ProcessingStatus.Unassigned, ProcessingStatus.InProgress],
        [ProcessingStatus.InProgress]: [ProcessingStatus.Assigned, ProcessingStatus.Processed],
        [ProcessingStatus.Processed]: [ProcessingStatus.InProgress],
    })
    const request = useDictionaryRequest()

    return {
        managers,
        orderTypes,
        sites,
        statuses,
        transitions,
        bootstrap: async () => {
            const parsed = await request()

            managers.value = mapManagers(parsed.managers)
            orderTypes.value = parsed.orderTypes
            sites.value = parsed.sites
            statuses.value = parsed.statuses
            transitions.value = parsed.transitionsMap
        },
    }
}
