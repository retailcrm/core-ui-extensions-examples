#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { spawnSync } = require('node:child_process')
const { z } = require('zod')

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
const manifestRaw = JSON.parse(raw)

const translationSchema = z.object({
    ru: z.string().min(1, 'ru translation must be a non-empty string'),
    en: z.string().min(1, 'en translation must be a non-empty string'),
    es: z.string().min(1, 'es translation must be a non-empty string'),
})

const descriptorPageSchema = z.object({
    code: z.string().min(1),
    menu: z.string().nullable().optional(),
    parentMenuItemCode: z.string().nullable().optional(),
    menuItemOrdering: z.number().nullable().optional(),
    menuItemTitle: translationSchema.optional(),
    pageHelpLink: translationSchema.nullable().optional(),
})

const descriptorPagePayloadSchema = z.union([
    z.string().min(1),
    descriptorPageSchema,
])

const manifestSchema = z.object({
    code: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    uuid: z.string().min(1),
    version: z.string().min(1),
    targets: z.array(z.string().min(1)).nonempty(),
    stylesheet: z.union([z.boolean(), z.string().min(1)]).optional(),
    pages: z.array(descriptorPagePayloadSchema).optional(),
    baseUrl: z.string().min(1).optional(),
    clientId: z.string().min(1).optional(),
    entrypoint: z.string().min(1).optional(),
})

const parsedManifest = manifestSchema.safeParse(manifestRaw)

if (!parsedManifest.success) {
    console.error('Invalid extensionrc.json:')
    parsedManifest.error.issues.forEach((issue) => {
        const pathLabel = issue.path.length ? issue.path.join('.') : 'root'
        console.error(`- ${pathLabel}: ${issue.message}`)
    })
    process.exit(1)
}

const manifest = parsedManifest.data

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
const version = manifest.version

if (!Array.isArray(manifest.targets) || manifest.targets.length === 0) {
    console.error('Missing or empty "targets" in extensionrc.json')
    process.exit(1)
}

if (!version) {
    console.error('Missing "version" in extensionrc.json')
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

const distDir = path.join(__dirname, '..', 'dist', caseName)
const webpackManifestPath = path.join(distDir, 'manifest.json')

if (!fs.existsSync(distDir)) {
    console.error(`Build directory not found: ${distDir}`)
    process.exit(1)
}

if (!fs.existsSync(webpackManifestPath)) {
    console.error(`Webpack manifest not found: ${webpackManifestPath}`)
    process.exit(1)
}

const webpackManifest = JSON.parse(fs.readFileSync(webpackManifestPath, 'utf-8'))
const distFiles = fs.readdirSync(distDir).filter(file => file !== 'manifest.json')

const normalizeManifestPath = (value) => value && value.startsWith('./') ? value.slice(2) : value
const pickFromManifest = (keys) => {
    for (const key of keys) {
        if (webpackManifest[key]) {
            return normalizeManifestPath(webpackManifest[key])
        }
    }
    return null
}
const pickFromFiles = (ext) => distFiles.find(file => file.endsWith(ext)) || null

const entryHtml = pickFromManifest(['index.html']) || pickFromFiles('.html')
const scriptFile = pickFromManifest([`${caseName}.js`, `${code}.js`]) || pickFromFiles('.js')
const styleFile = pickFromManifest([`${caseName}.css`, `${code}.css`]) || pickFromFiles('.css')

if (!entryHtml || !scriptFile) {
    console.error('Missing build artifacts. Ensure build produced HTML and JS files.')
    process.exit(1)
}

const extensionManifest = {
    code,
    version,
    targets: manifest.targets,
    entrypoint: entryHtml,
    scripts: [scriptFile],
}

if (styleFile) {
    extensionManifest.stylesheet = styleFile
}

if (pages && pages.length > 0) {
    extensionManifest.pages = pages
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `extension-${caseName}-`))
const extensionManifestPath = path.join(tempDir, 'manifest.json')
fs.writeFileSync(extensionManifestPath, JSON.stringify(extensionManifest), 'utf-8')

const zipPath = path.join(path.dirname(distDir), `${caseName}.zip`)
const zipFiles = distFiles.map(file => path.join(distDir, file))
zipFiles.push(extensionManifestPath)

try {
    const zipResult = spawnSync('zip', ['-jFS', zipPath, ...zipFiles], { stdio: 'inherit' })

    if (zipResult.error) {
        console.error(`Zip command failed: ${zipResult.error.message}`)
        process.exit(1)
    }

    if (zipResult.status !== 0) {
        console.error('Zip archive creation failed')
        process.exit(1)
    }
} finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
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
