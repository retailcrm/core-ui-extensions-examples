import type { ReturnItem } from './types'

export const parseDateString = (value: string) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)

    if (!match) {
        return null
    }

    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export const formatDateQuery = (date: Date | null) => {
    if (!date) {
        return ''
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

export const formatDateLabel = (value: string, locale: string) => {
    const date = parseDateString(value)

    return date
        ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
        : value
}

export const formatCurrency = (amount: number, locale: string) => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(amount)
}

export const formatProductLine = (item: ReturnItem, locale: string, template: string) => {
    return template
        .replace('{quantity}', String(item.quantity))
        .replace('{price}', formatCurrency(item.price, locale))
}
