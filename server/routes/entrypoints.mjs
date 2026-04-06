import { join } from 'node:path'

import { readManifest } from '../utils/files.mjs'

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

export const registerEntrypointRoutes = (app, { rootDir }) => {
    app.get('/', (_, response) => {
        response.sendFile(join(rootDir, 'index.html'))
    })

    app.get('/extension/:uuid', async (request, response) => {
        const uuid = request.params.uuid
        const known = await readManifest(join(rootDir, 'cases.json'))
        const record = known.items.find(item => item.uuid === uuid)

        if (!record) {
            response.sendStatus(404)
            return
        }

        const manifest = await readManifest(join(rootDir, 'dist', record.name, 'manifest.json'))

        response.send(renderEntrypoint(record.name, manifest, record.script))
    })

    app.get('/extension/:uuid/script', async (request, response) => {
        const uuid = request.params.uuid
        const known = await readManifest(join(rootDir, 'cases.json'))
        const record = known.items.find(item => item.uuid === uuid)

        if (!record) {
            response.sendStatus(404)
            return
        }

        const manifest = await readManifest(join(rootDir, 'dist', record.name, 'manifest.json'))
        const script = manifest[record.script]

        if (!script) {
            response.sendStatus(404)
            return
        }

        response.type('application/javascript').sendFile(join(rootDir, 'dist', record.name, script))
    })

    app.get('/extension/:uuid/stylesheet', async (request, response) => {
        const uuid = request.params.uuid
        const known = await readManifest(join(rootDir, 'cases.json'))
        const record = known.items.find(item => item.uuid === uuid)

        if (!record || !record.stylesheet) {
            response.sendStatus(404)
            return
        }

        const manifest = await readManifest(join(rootDir, 'dist', record.name, 'manifest.json'))
        const stylesheet = manifest[record.stylesheet]

        if (!stylesheet) {
            response.sendStatus(404)
            return
        }

        response.sendFile(join(rootDir, 'dist', record.name, stylesheet))
    })
}
