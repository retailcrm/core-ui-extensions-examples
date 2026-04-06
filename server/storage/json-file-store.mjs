import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export const readJsonFile = async (path, fallback) => {
    try {
        const raw = await readFile(path, 'utf-8')

        return raw ? JSON.parse(raw) : fallback
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return fallback
        }

        console.error(`Failed to read JSON file at ${path}`, error)

        return fallback
    }
}

export const writeJsonFile = async (path, payload) => {
    await mkdir(dirname(path), { recursive: true })

    const serialized = `${JSON.stringify(payload, null, 2)}\n`
    const temporaryPath = `${path}.tmp`

    await writeFile(temporaryPath, serialized, 'utf-8')
    await rename(temporaryPath, path)
}
