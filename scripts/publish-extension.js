#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

require('dotenv').config({ path: '.env' })

const caseName = process.argv[2]

if (!caseName) {
    console.error('Usage: node scripts/publish-extension.js <case-name>')
    process.exit(1)
}

const manifestPath = path.join(__dirname, '..', 'cases', caseName, 'extensionrc.json')

if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`)
    process.exit(1)
}

const raw = fs.readFileSync(manifestPath, 'utf-8')
const manifest = JSON.parse(raw)

const crmHost = process.env.CRM_API_HOST
const crmKey = process.env.CRM_API_KEY
const baseUrl = manifest.baseUrl || process.env.MODULE_URL || process.env.EXTENSION_BASE_URL

if (!crmHost || !crmKey) {
    console.error('Missing CRM_API_HOST or CRM_API_KEY in .env')
    process.exit(1)
}

if (!baseUrl) {
    console.error('Missing MODULE_URL (or EXTENSION_BASE_URL) in .env or extensionrc.json')
    process.exit(1)
}

if (!manifest.uuid) {
    console.error('Missing "uuid" in extensionrc.json')
    process.exit(1)
}

const code = manifest.code || caseName
const name = manifest.name || code
const clientId = manifest.clientId || 'client-id-xxx'

if (!Array.isArray(manifest.targets) || manifest.targets.length === 0) {
    console.error('Missing or empty "targets" in extensionrc.json')
    process.exit(1)
}

const entrypoint = manifest.entrypoint || `/extension/${manifest.uuid}`
let stylesheet = null

if (typeof manifest.stylesheet === 'string') {
    stylesheet = manifest.stylesheet
} else if (manifest.stylesheet === true) {
    stylesheet = `/extension/${manifest.uuid}/stylesheet`
}

const pages = manifest.pages

if (pages && !Array.isArray(pages)) {
    console.error('"pages" must be an array when provided')
    process.exit(1)
}

const embedJs = {
    entrypoint,
    targets: manifest.targets,
}

if (stylesheet) {
    embedJs.stylesheet = stylesheet
}

if (pages && pages.length > 0) {
    embedJs.pages = pages
}

const integrationModule = {
    code,
    integrationCode: code,
    active: true,
    name,
    clientId,
    baseUrl,
    integrations: {
        embedJs,
    },
}

if (typeof fetch !== 'function' || typeof FormData === 'undefined') {
    console.error('This script requires Node.js with global fetch and FormData (Node 18+)')
    process.exit(1)
}

const form = new FormData()
form.append('integrationModule', JSON.stringify(integrationModule))

const url = new URL(`/api/v5/integration-modules/${code}/edit`, crmHost)

const run = async () => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-Api-Key': crmKey,
        },
        body: form,
    })

    const text = await response.text()

    if (!response.ok) {
        console.error(`Request failed: ${response.status} ${response.statusText}`)
        console.error(text)
        process.exit(1)
    }

    console.log(text)
}

run().catch((error) => {
    console.error('Unexpected error:', error)
    process.exit(1)
})
