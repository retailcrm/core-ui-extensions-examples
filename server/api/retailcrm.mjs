export {
    createRetailCrmClient,
    getRetailCrmConfig,
    isRetailCrmConfigured,
} from './retailcrm/client.mjs'

export {
    deriveSitesFromOrders,
    extractOrderTypes,
    normalizeManager,
    normalizeOrder,
    normalizeOrderType,
    normalizeStatus,
} from './retailcrm/normalizers.mjs'
