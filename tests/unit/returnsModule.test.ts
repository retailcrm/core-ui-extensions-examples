import { describe, expect, test } from 'vitest'

import {
    formatCurrency,
    formatDateLabel,
    formatDateQuery,
    formatProductLine,
    parseDateString,
} from '@cases/returnsModule/formatters'

describe('returnsModule formatters', () => {
    test('parses and serializes calendar dates without a timezone shift', () => {
        const date = parseDateString('2026-07-21')

        expect(date).not.toBeNull()
        expect(formatDateQuery(date)).toBe('2026-07-21')
        expect(formatDateQuery(null)).toBe('')
        expect(parseDateString('21.07.2026')).toBeNull()
    })

    test('formats labels, currency and product lines for the requested locale', () => {
        const locale = 'ru-RU'
        const item = { name: 'Чехол', quantity: 2, price: 1500 }

        expect(formatDateLabel('2026-07-21', locale)).toBe(
            new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(2026, 6, 21))
        )
        expect(formatCurrency(item.price, locale)).toBe(
            new Intl.NumberFormat(locale, {
                currency: 'RUB',
                maximumFractionDigits: 0,
                style: 'currency',
            }).format(item.price)
        )
        expect(formatProductLine(item, locale, '{quantity} × {price}')).toBe(
            `2 × ${formatCurrency(item.price, locale)}`
        )
    })
})
