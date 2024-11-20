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

const render = (name, manifest, entrypoint) => {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>UI Extension: ${name}</title>
    <script type="module" src="${manifest[entrypoint]}"></script>
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
    const manifest = await readManifest(path.join(__dirname, '/dist/manifest.json'))
    const records = await readManifest(path.join(__dirname, '/cases.json'))

    const record = records.items.find(r => r.uuid === uuid)
    if (record) {
        response.send(render(record.name, manifest, record.entrypoint))
    } else {
        response.sendStatus(404)
    }
})

app.get('/extension/:uuid/stylesheet', async (request, response) => {
    const uuid = request.params.uuid
    const manifest = await readManifest(path.join(__dirname, '/dist/manifest.json'))
    const records = await readManifest(path.join(__dirname, '/cases.json'))

    const record = records.items.find(r => r.uuid === uuid)
    if (record) {
        response.sendFile(path.join(__dirname, manifest[record.stylesheet]))
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

app.post('/receipts', async (request, response) => {
    response.status(200).json({ receipts })
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
