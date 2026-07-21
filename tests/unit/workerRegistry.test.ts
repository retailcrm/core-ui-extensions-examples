import { describe, expect, test } from 'vitest'

import ordersProcessingDescriptor from '@cases/ordersProcessingModule/extensionrc.json'
import promoDescriptor from '@cases/promoModule/extensionrc.json'
import returnsDescriptor from '@cases/returnsModule/extensionrc.json'
import tasksDescriptor from '@cases/tasksModule/extensionrc.json'

import registry from '../../cases.json'

const workerDescriptors = [
    ordersProcessingDescriptor,
    promoDescriptor,
    returnsDescriptor,
    tasksDescriptor,
]

describe('worker descriptor registry', () => {
    test.each(workerDescriptors)('keeps $code delivery metadata in sync', descriptor => {
        const record = registry.items.find(item => item.uuid === descriptor.uuid)

        expect(descriptor.runner).toBe('worker')
        expect(record).toMatchObject({
            uuid: descriptor.uuid,
            name: descriptor.code,
            script: `${descriptor.code}.js`,
            stylesheet: `${descriptor.code}.css`,
        })
    })
})
