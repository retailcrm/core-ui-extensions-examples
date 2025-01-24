import cors from 'cors'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

const readManifest = (path) => {
    return new Promise((resolve) => {
        fs.readFile(path, 'utf-8', (e, data) => {
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

app.use(cors())
app.use('/dist', express.static(path.join(__dirname, '/dist')))

app.get('/', (_, response) => {
    response.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/extension/:uuid', async (request, response) => {
    const uuid = request.params.uuid

    const known = await readManifest(path.join(__dirname, '/cases.json'))
    const record = known.items.find(r => r.uuid === uuid)

    if (record) {
        const manifest = await readManifest(path.join(__dirname, `/dist/${record.name}/manifest.json`))

        response.send(renderEntrypoint(record.name, manifest, record.script))
    } else {
        response.sendStatus(404)
    }
})

app.get('/extension/:uuid/stylesheet', async (request, response) => {
    const uuid = request.params.uuid

    const known = await readManifest(path.join(__dirname, '/cases.json'))
    const record = known.items.find(r => r.uuid === uuid)

    if (record && record.stylesheet) {
        const manifest = await readManifest(path.join(__dirname, `/dist/${record.name}/manifest.json`))

        response.sendFile(path.join(__dirname, 'dist', record.name, manifest[record.stylesheet]))
    } else {
        response.sendStatus(404)
    }
})

// fiscalReceipts routes

app.post('/receipts-count', async (request, response) => {
    response.status(200).json({ count: 2 })
})

const receipts = [{
    id: 645,
    details: {
        receiptTime: '17.11.2024 11:51',
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
        receiptTime: '28.10.2024 10:32',
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

app.post('/receipts', express.urlencoded(), async (request, response) => {
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

app.post('/notes/new', express.urlencoded(), async (request, response) => {
    const payload = JSON.parse(request.body.payload)
    const resultNotes = [payload.note, ...notes]
    response.status(200).json({ notes: resultNotes })
})

// customerINN routes

app.post('/customer/by-inn', express.urlencoded(), async (request, response) => {
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

const server = app.listen(3000, () => {
    console.log('Serving on port 3000')
})

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server has been stopped')
        process.exit(0)
    })
})
