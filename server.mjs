import cors from 'cors'
import express from 'express'

import { config as configEnv } from 'dotenv'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { readFile } from 'node:fs'

configEnv({ path: '.env' })

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()

const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true)
            return
        }

        if (corsOrigins.length === 0 || corsOrigins.includes(origin)) {
            callback(null, true)
            return
        }

        callback(new Error(`Not allowed by CORS: ${origin}`))
    },
    credentials: true,
}

const urlencoded = express.urlencoded({ extended: true })

const readManifest = (path) => {
    return new Promise((resolve) => {
        readFile(path, 'utf-8', (e, data) => {
            if (e) {
                console.error('An error occurred reading the file', e)
                resolve({})
            } else if (data) {
                resolve(JSON.parse(data))
            } else {
                console.error('Unexpected empty buffer')
                resolve({})
            }
        })
    })
}

const renderEntrypoint = (name, manifest, entry) => {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>UI Extension: ${name}</title>
    <script type="module" src="/dist/${name}/${manifest[entry].slice(2)}"></script>
</head>
<body></body>
</html>`
}

const parsePayload = (request) => {
    const raw = request.body?.payload

    if (!raw) {
        return {}
    }

    if (typeof raw === 'object') {
        return raw
    }

    try {
        return JSON.parse(raw)
    } catch {
        return {}
    }
}

const sendJsonError = (response, error, status = 500) => {
    console.error(error)
    response.status(status).json({
        errorMsg: error instanceof Error ? error.message : String(error),
    })
}

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

// Prepopulate the mock registry so the returns page always has enough data for pagination.
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

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use('/dist', express.static(join(__dirname, '/dist')))

app.get('/', (_, response) => {
    response.sendFile(join(__dirname, '/index.html'))
})

app.get('/extension/:uuid', async (request, response) => {
    const uuid = request.params.uuid

    const known = await readManifest(join(__dirname, '/cases.json'))
    const record = known.items.find(r => r.uuid === uuid)

    if (record) {
        const manifest = await readManifest(join(__dirname, `/dist/${record.name}/manifest.json`))

        response.send(renderEntrypoint(record.name, manifest, record.script))
    } else {
        response.sendStatus(404)
    }
})

app.get('/extension/:uuid/script', async (request, response) => {
    const uuid = request.params.uuid

    const known = await readManifest(join(__dirname, '/cases.json'))
    const record = known.items.find(r => r.uuid === uuid)

    if (!record) {
        response.sendStatus(404)
        return
    }

    const manifest = await readManifest(join(__dirname, `/dist/${record.name}/manifest.json`))
    const script = manifest[record.script]

    if (!script) {
        response.sendStatus(404)
        return
    }

    response.type('application/javascript').sendFile(join(__dirname, 'dist', record.name, script))
})

app.get('/extension/:uuid/stylesheet', async (request, response) => {
    const uuid = request.params.uuid

    const known = await readManifest(join(__dirname, '/cases.json'))
    const record = known.items.find(r => r.uuid === uuid)

    if (record && record.stylesheet) {
        const manifest = await readManifest(join(__dirname, `/dist/${record.name}/manifest.json`))

        response.sendFile(join(__dirname, 'dist', record.name, manifest[record.stylesheet]))
    } else {
        response.sendStatus(404)
    }
})

// returnsModule routes

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

// fiscalReceipts routes

app.post('/receipts-count', async (request, response) => {
    response.status(200).json({ count: 2 })
})

const receipts = [{
    id: 645,
    details: {
        receiptTime: '2024-11-17T11:51:00+03:00',
        shiftNumber: 16,
        machineNumber: 'KZN030315',
        taxSystem: 'OSN',
        onlinePayment: true,
        fnNumber: '7380440801381848',
        kktRegistrationNumber: '0007642722037997',
        fdNumber: 41859,
        fpd: 2975038937,
        ffdVersion: '1.2',
    },
}, {
    id: 813,
    details: {
        receiptTime: '2024-10-28T10:32:00+03:00',
        shiftNumber: 18,
        machineNumber: 'KZN1001202',
        taxSystem: 'OSN',
        onlinePayment: true,
        fnNumber: '7380440800998420',
        kktRegistrationNumber: '0007642686026725',
        fdNumber: 4696,
        fpd: 3632111203,
        ffdVersion: '1.2',
    },
}]

app.post('/receipts', urlencoded, async (request, response) => {
    const payload = JSON.parse(request.body.payload)
    const responseReceipts = receipts.map(receipt => {
        return {
            ...receipt,
            id: `ORDER${payload.order_number}_${receipt.id}`,
        }
    })
    response.status(200).json({ receipts: responseReceipts })
})

// orderNotes routes
const avatar = 'https://on-desktop.com/wps/Animals___Cats_Red_Cat_with_open_mouth_044663_.jpg'

const notes = [{
    id: 1,
    author: {
        id: 1, // Этот ID не настоящий и используется только для демонстрации
        name: 'Василий Петров',
        avatar,
    },
    date: '2024-10-15T16:00:00',
    text: 'Клиент просил оставить заказ у двери',
}, {
    id: 2,
    author: {
        id: 2, // Этот ID не настоящий и используется только для демонстрации
        name: 'Николай Понкратов',
        avatar,
    },
    avatar: '',
    date: '2024-10-12T00:00:00',
    text: 'Просил оповестить, как появятся мандарины, хочет добавить к заказу',
}]

app.post('/notes-count', async (request, response) => {
    response.status(200).json({ count: notes.length })
})

app.post('/notes', async (request, response) => {
    response.status(200).json({ notes })
})

app.post('/notes/new', urlencoded, async (request, response) => {
    const payload = JSON.parse(request.body.payload)

    response.status(200).json({ notes: [payload.note, ...notes] })
})

// customerINN routes

app.post('/customer/by-inn', urlencoded, async (request, response) => {
    const { inn } = JSON.parse(request.body.payload)

    if (inn === '1234567890') {
        return response.status(200).json({
            data: {
                name: 'МФО ТомскАсбоцементПивБанк',
                bank: 'Сбербанк России, ОАО, г. Москва',
                bankAccount: '415219379646',
                bankAddress: '877568, Липецкая область, город Клин, наб. Косиора, 61',
                legalName: 'ОАО Глав',
                legalAddress: '877568, Липецкая область, город Клин, наб. Косиора, 61',
                corrAccount: '601630812474',
                OGRN: '1027700132195',
                OGRNIP: '304770000000571',
                INN: '2872865074',
                OKPO: '10720877',
                BIK: '38630490',
                KPP: '287201001',
                certificate: {
                    date: '15.03.2020',
                    number: '78-20-567890',
                },
            },
        })
    }

    response.status(400)
})

app.post('/promos', async (request, response) => {
    response.status(200).json({
        promos: [{
            code: 'gift',
            name: 'Подарок',
            description: 'Доступен товар в подарок',
        }, {
            code: 'discount',
            name: 'Скидка 5% при оплате СБП',
            description: 'Применяется скидка 5% при оплате СБП',
        }, {
            code: 'third',
            name: 'Третий товар в подарок',
            description: 'При покупке двух товаров третий в подарок.',
        }],
    })
})

app.post('/offers', async (request, response) => {
    if (!process.env.CRM_API_KEY) {
        response.status(500).json({ errors: ['CRM_API_KEY is not defined'] })
        return
    }

    try {
        response.status(200).json(await (
            await fetch(process.env.CRM_API_HOST + '/api/v5/store/offers?filter[active]=1', {
                headers: { 'X-API-KEY': process.env.CRM_API_KEY },
            })
        ).json())
    } catch (e) {
        response.status(500).json({ errors: [String(e)] })
        console.error(e)
    }
})

const server = app.listen(3000, () => {
    console.log('Serving on port 3000')
})

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server has been stopped')
        process.exit(0)
    })
})
