import { parsePayload, sendJsonError } from '../utils/http.mjs'

const cloneItems = (items) => items.map(item => ({ ...item }))

const formatDateValue = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const calculateAmount = (items) => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0)
}

const productNames = [
    'Куртка Trail',
    'Кроссовки Wave',
    'Рюкзак Shift',
    'Футболка Air',
    'Термокружка Base',
    'Плед Cloud',
    'Сумка Roll',
    'Наушники Pulse',
    'Фонарик Spark',
    'Набор наклеек Simla',
]

const customers = [
    'Анна Смирнова',
    'Илья Петров',
    'Мария Морозова',
    'Дмитрий Орлов',
    'Виктория Соколова',
    'Егор Лебедев',
]

const createOrderCatalog = () => {
    return Array.from({ length: 18 }, (_, index) => {
        const id = index + 1
        const number = String(100240 + id)
        const items = Array.from({ length: 2 + (index % 3) }, (_, itemIndex) => {
            return {
                name: productNames[(index * 2 + itemIndex) % productNames.length],
                quantity: 1 + ((index + itemIndex) % 3),
                price: 590 + (((index * 3) + itemIndex) % 7) * 250,
            }
        })

        return {
            id,
            number,
            customer: customers[index % customers.length],
            amount: calculateAmount(items),
            items,
        }
    })
}

const ordersCatalog = createOrderCatalog()
const returnStatuses = ['new', 'approved', 'completed', 'cancelled']

const createReturnItemsFromOrder = (order, seed = 0) => {
    const limit = Math.min(order.items.length, 1 + ((order.id + seed) % order.items.length))

    return order.items.slice(0, limit).map((item, itemIndex) => {
        const quantity = Math.min(item.quantity, 1 + ((seed + itemIndex) % item.quantity))

        return {
            name: item.name,
            quantity,
            price: item.price,
        }
    })
}

const createOrderSnapshot = (order) => ({
    id: order.id,
    number: order.number,
    customer: order.customer,
    amount: order.amount,
    items: cloneItems(order.items),
})

const createReturnRecord = ({ id, order, date, status, items }) => ({
    id,
    date,
    status,
    order: createOrderSnapshot(order),
    amount: calculateAmount(items),
    items: cloneItems(items),
})

const seedDate = new Date(2026, 2, 16)
const seededReturnsCount = 24

let returnsRegistry = Array.from({ length: seededReturnsCount }, (_, index) => {
    const date = new Date(seedDate)
    date.setDate(seedDate.getDate() - index)

    const order = ordersCatalog[index % ordersCatalog.length]
    const items = createReturnItemsFromOrder(order, index)

    return createReturnRecord({
        id: 7001 + index,
        order,
        date: formatDateValue(date),
        status: returnStatuses[index % returnStatuses.length],
        items,
    })
}).sort((left, right) => right.date.localeCompare(left.date))

let nextReturnId = 7001 + returnsRegistry.length

const getReturnStatus = (value, fallback = 'new') => {
    return returnStatuses.includes(value) ? value : fallback
}

const filterReturns = ({ date = '', status = '', orderNumber = '', amount = '' }) => {
    const normalizedOrderNumber = String(orderNumber).trim()
    const normalizedAmount = String(amount).trim()

    return returnsRegistry.filter(returnRecord => {
        if (date && returnRecord.date !== date) {
            return false
        }

        if (status && returnRecord.status !== status) {
            return false
        }

        if (normalizedOrderNumber && !returnRecord.order.number.includes(normalizedOrderNumber)) {
            return false
        }

        if (normalizedAmount && !String(returnRecord.amount).includes(normalizedAmount)) {
            return false
        }

        return true
    })
}

export const registerReturnsRoutes = (app, { urlencoded }) => {
    app.post('/returns-count', async (_, response) => {
        try {
            response.status(200).json({ count: returnsRegistry.length })
        } catch (error) {
            sendJsonError(response, error)
        }
    })

    app.post('/returns', urlencoded, async (request, response) => {
        try {
            const payload = parsePayload(request)
            const page = Math.max(1, Number(payload.page) || 1)
            const perPage = Math.max(1, Number(payload.perPage) || 8)
            const filtered = filterReturns(payload.filters || {})
            const pages = Math.max(1, Math.ceil(filtered.length / perPage))
            const safePage = Math.min(page, pages)
            const offset = (safePage - 1) * perPage

            response.status(200).json({
                returns: filtered.slice(offset, offset + perPage),
                total: filtered.length,
                page: safePage,
                perPage,
            })
        } catch (error) {
            sendJsonError(response, error)
        }
    })

    app.post('/return', urlencoded, async (request, response) => {
        try {
            const payload = parsePayload(request)
            const returnRecord = returnsRegistry.find(item => item.id === Number(payload.id))

            if (!returnRecord) {
                response.status(404).json({ errorMsg: 'Return not found' })
                return
            }

            response.status(200).json({ return: returnRecord })
        } catch (error) {
            sendJsonError(response, error)
        }
    })

    app.post('/returns/save', urlencoded, async (request, response) => {
        try {
            const payload = parsePayload(request)
            const order = ordersCatalog.find(item => item.id === Number(payload.orderId))

            if (!order) {
                response.status(400).json({ errorMsg: 'Order not found' })
                return
            }

            if (payload.mode === 'edit') {
                const existing = returnsRegistry.find(item => item.id === Number(payload.id))

                if (!existing) {
                    response.status(404).json({ errorMsg: 'Return not found' })
                    return
                }

                const items = createReturnItemsFromOrder(order, existing.id)

                existing.status = getReturnStatus(payload.status, existing.status)
                existing.order = createOrderSnapshot(order)
                existing.items = cloneItems(items)
                existing.amount = calculateAmount(items)

                response.status(200).json({ return: existing })
                return
            }

            const items = createReturnItemsFromOrder(order, nextReturnId)
            const created = createReturnRecord({
                id: nextReturnId,
                order,
                date: payload.date || formatDateValue(new Date()),
                status: getReturnStatus(payload.status),
                items,
            })

            nextReturnId += 1
            returnsRegistry = [created, ...returnsRegistry].sort((left, right) => right.date.localeCompare(left.date))

            response.status(200).json({ return: created })
        } catch (error) {
            sendJsonError(response, error)
        }
    })

    app.post('/orders/search', urlencoded, async (request, response) => {
        try {
            const payload = parsePayload(request)
            const query = String(payload.query || '').trim()

            if (!query) {
                response.status(200).json({ orders: [] })
                return
            }

            response.status(200).json({
                orders: ordersCatalog
                    .filter(order => order.number.includes(query))
                    .slice(0, 8)
                    .map(order => createOrderSnapshot(order)),
            })
        } catch (error) {
            sendJsonError(response, error)
        }
    })
}
