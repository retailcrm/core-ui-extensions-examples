// @vitest-environment node
/// <reference types="node" />
import type { Server } from 'node:http'

import { createRequire } from 'node:module'
import { createServer } from 'node:http'

import {
    afterEach,
    beforeEach,
    expect,
    test,
    vi,
} from 'vitest'

import { registerTicketWorkflowRoutes } from '../../server/routes/ticket-workflows.mjs'

const express = createRequire(import.meta.url)('express')
const request = globalThis.fetch
let server: Server
let baseUrl: string

beforeEach(async () => {
    const app = express()
    registerTicketWorkflowRoutes(app, { urlencoded: express.urlencoded({ extended: true }) })
    server = createServer(app)
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Server did not bind')
    baseUrl = `http://127.0.0.1:${address.port}`
    vi.stubEnv('CRM_API_HOST', 'https://crm.example.test')
    vi.stubEnv('CRM_API_KEY', 'example-key')
})

afterEach(async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
})

test('reads every staff page and returns only recipient references', async () => {
    const fetchCrm = vi.fn()
        .mockResolvedValueOnce(Response.json({ users: [{ id: 7, firstName: 'Ирина', lastName: 'Волкова', email: 'private@example.test' }], pagination: { totalPageCount: 2 } }))
        .mockResolvedValueOnce(Response.json({ users: [{ id: 8, firstName: 'Олег', lastName: 'Орлов' }], pagination: { totalPageCount: 2 } }))
    vi.stubGlobal('fetch', fetchCrm)
    const response = await request(`${baseUrl}/ticket-workflows/recipients`, { method: 'POST' })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ recipients: [{ id: 7, name: 'Ирина Волкова' }, { id: 8, name: 'Олег Орлов' }] })
    const url = new URL(fetchCrm.mock.calls[1][0])
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('filter[active]')).toBe('1')
    expect(url.searchParams.get('filter[isManager]')).toBe('1')
})

test('reads each linked order once and maps item identities without changing CRM', async () => {
    const fetchCrm = vi.fn().mockResolvedValue(Response.json({ success: true, order: {
        id: 501, number: '805', items: [{ id: 701, offer: { displayName: 'Чайник', article: 'K01' } }],
    } }))
    vi.stubGlobal('fetch', fetchCrm)
    const response = await request(`${baseUrl}/ticket-workflows/order-items`, {
        method: 'POST', body: new URLSearchParams({ payload: JSON.stringify({ orderIds: [501, 501] }) }),
    })
    expect(await response.json()).toEqual({ items: [{ id: 701, orderId: 501, orderNumber: '805', name: 'Чайник', article: 'K01' }] })
    expect(fetchCrm).toHaveBeenCalledTimes(1)
    expect(String(fetchCrm.mock.calls[0][0])).toBe('https://crm.example.test/api/v5/orders/501?by=id')
    expect(fetchCrm.mock.calls[0][1]).not.toHaveProperty('method')
})

test('rejects invalid order references before contacting CRM', async () => {
    const fetchCrm = vi.fn()
    vi.stubGlobal('fetch', fetchCrm)
    const response = await request(`${baseUrl}/ticket-workflows/order-items`, {
        method: 'POST', body: new URLSearchParams({ payload: JSON.stringify({ orderIds: ['501', -1] }) }),
    })
    expect(response.status).toBe(400)
    expect(fetchCrm).not.toHaveBeenCalled()
})

test('returns an explicit error when CRM is unavailable, without synthetic recipients', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 })))
    const response = await request(`${baseUrl}/ticket-workflows/recipients`, { method: 'POST' })
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'recipients_unavailable' })
})
