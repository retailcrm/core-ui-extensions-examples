import cors from 'cors'
import express from 'express'

import { config as configEnv } from 'dotenv'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { registerDemoRoutes } from './server/routes/demo.mjs'
import { registerEntrypointRoutes } from './server/routes/entrypoints.mjs'
import { registerOrdersProcessingRoutes } from './server/routes/orders-processing.mjs'
import { registerReturnsRoutes } from './server/routes/returns.mjs'

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

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use('/dist', express.static(join(__dirname, 'dist')))

registerEntrypointRoutes(app, { rootDir: __dirname })
registerReturnsRoutes(app, { urlencoded })
registerOrdersProcessingRoutes(app, { urlencoded })
registerDemoRoutes(app, { urlencoded })

const server = app.listen(3000, () => {
    console.log('Serving on port 3000')
})

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server has been stopped')
        process.exit(0)
    })
})
