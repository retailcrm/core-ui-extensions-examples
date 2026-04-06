import { readFile } from 'node:fs/promises'

export const readManifest = async (path) => {
    try {
        const data = await readFile(path, 'utf-8')

        return data ? JSON.parse(data) : {}
    } catch (error) {
        console.error('An error occurred reading the file', error)

        return {}
    }
}
