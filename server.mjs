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
    <script type="module" src="${manifest['dist/runtime.js']}"></script>
    <script type="module" src="${manifest['dist/vendor.js']}"></script>
    <script type="module" src="${manifest['dist/vue.js']}"></script>
    <script type="module" src="${manifest['dist/remote-ui.js']}"></script>
    <script type="module" src="${manifest[entrypoint]}"></script>
</head>
<body></body>
</html>`
}

const records = [{
    uuid: '62aa8145-ed53-4862-b28f-f1bc6b36a3a3',
    name: 'Yandex maps',
    scope: 'order-card',
    entrypoint: 'dist/extension.js',
    stylesheet: 'dist/extension.css',
}, {
    uuid: '776baea8-1c95-4e95-a3a4-f75c7d87773a',
    name: 'Stub',
    scope: 'order-card',
    entrypoint: 'dist/extension-that-fails-on-run.js',
    stylesheet: null,
}]

app.use(cors())
app.use('/dist', express.static(path.join(__dirname, '/dist')))

app.get('/', (_, response) => {
    response.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/extension/:uuid', async (request, response) => {
    const uuid = request.params.uuid
    const manifest = await readManifest(path.join(__dirname, '/dist/manifest.json'))

    const record = records.find(r => r.uuid === uuid)
    if (record) {
        response.send(render(record.name, manifest, record.entrypoint))
    } else {
        response.sendStatus(404)
    }
})

app.get('/extension/:uuid/stylesheet', async (request, response) => {
    const uuid = request.params.uuid
    const manifest = await readManifest(path.join(__dirname, '/dist/manifest.json'))

    const record = records.find(r => r.uuid === uuid)
    if (record) {
        response.sendFile(path.join(__dirname, manifest[record.stylesheet]))
    } else {
        response.sendStatus(404)
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
