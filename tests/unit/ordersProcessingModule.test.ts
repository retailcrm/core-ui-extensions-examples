import { describe, expect, test } from 'vitest'

import {
    buildProcessingQuery,
    mapManagers,
    toScalar,
} from '@cases/ordersProcessingModule/utils'

describe('ordersProcessingModule utilities', () => {
    test('builds a location query from non-empty filters', () => {
        expect(buildProcessingQuery({
            assigneeId: '17',
            orderType: '',
            site: 'main',
            status: 'assembling',
        })).toEqual({
            assignee: '17',
            site: 'main',
            status: 'assembling',
        })
    })

    test('normalizes query values to one scalar value', () => {
        expect(toScalar('main')).toBe('main')
        expect(toScalar(['first', 'second'])).toBe('first')
        expect(toScalar([])).toBe('')
        expect(toScalar()).toBe('')
    })

    test('maps manager records to select options', () => {
        expect(mapManagers([
            { id: 17, firstName: 'Анна', lastName: 'Смирнова' },
            { id: 21, firstName: 'Иван', lastName: '' },
        ])).toEqual([
            { id: 17, name: 'Анна Смирнова' },
            { id: 21, name: 'Иван' },
        ])
    })
})
