const customerFirstNames = [
    'Анна',
    'Илья',
    'Мария',
    'Дмитрий',
    'Виктория',
    'Егор',
    'Наталья',
    'Артем',
]

const customerLastNames = [
    'Смирнова',
    'Петров',
    'Морозова',
    'Орлов',
    'Соколова',
    'Лебедев',
    'Иванова',
    'Кузнецов',
]

export const processingColumns = [{
    id: 'unassigned',
    accent: '#FFE8C2',
}, {
    id: 'assigned',
    accent: '#DDEBFF',
}, {
    id: 'in_progress',
    accent: '#D9F4EA',
}, {
    id: 'processed',
    accent: '#E9E4FF',
}]

export const transitionsMap = {
    unassigned: ['assigned'],
    assigned: ['unassigned', 'in_progress'],
    in_progress: ['assigned', 'processed'],
    processed: ['in_progress'],
}

export const managers = [{
    id: 11,
    firstName: 'Елена',
    lastName: 'Андреева',
    patronymic: 'Игоревна',
    position: 'Старший менеджер',
    photoUrl: '',
    active: true,
    online: true,
    status: 'online',
    isManager: true,
    groups: [{ id: 501, name: 'Продажи' }],
}, {
    id: 12,
    firstName: 'Максим',
    lastName: 'Козлов',
    patronymic: 'Павлович',
    position: 'Менеджер',
    photoUrl: '',
    active: true,
    online: false,
    status: 'offline',
    isManager: true,
    groups: [{ id: 501, name: 'Продажи' }],
}, {
    id: 13,
    firstName: 'София',
    lastName: 'Миронова',
    patronymic: 'Александровна',
    position: 'Менеджер B2B',
    photoUrl: '',
    active: true,
    online: true,
    status: 'online',
    isManager: true,
    groups: [{ id: 502, name: 'B2B' }],
}, {
    id: 14,
    firstName: 'Никита',
    lastName: 'Волков',
    patronymic: 'Сергеевич',
    position: 'Менеджер',
    photoUrl: '',
    active: true,
    online: true,
    status: 'online',
    isManager: true,
    groups: [{ id: 501, name: 'Продажи' }],
}, {
    id: 15,
    firstName: 'Ольга',
    lastName: 'Громова',
    patronymic: 'Ивановна',
    position: 'Менеджер',
    photoUrl: '',
    active: true,
    online: false,
    status: 'offline',
    isManager: true,
    groups: [{ id: 503, name: 'VIP' }],
}]

export const statuses = [{
    code: 'new',
    name: 'Новый',
    group: 'new',
    active: true,
    ordering: 10,
}, {
    code: 'approval',
    name: 'Согласование',
    group: 'processing',
    active: true,
    ordering: 20,
}, {
    code: 'assembling',
    name: 'Комплектация',
    group: 'processing',
    active: true,
    ordering: 30,
}, {
    code: 'delivery',
    name: 'Доставка',
    group: 'delivery',
    active: true,
    ordering: 40,
}, {
    code: 'complete',
    name: 'Выполнен',
    group: 'complete',
    active: true,
    ordering: 50,
}]

export const orderTypes = [{
    code: 'eshop-individual',
    name: 'Интернет-магазин',
}, {
    code: 'eshop-b2b',
    name: 'B2B',
}, {
    code: 'marketplace',
    name: 'Маркетплейс',
}]

export const sites = [{
    code: 'moysklad',
    name: 'Основной сайт',
}, {
    code: 'b2b',
    name: 'B2B портал',
}, {
    code: 'market',
    name: 'Маркет',
}]

export const managerById = new Map(managers.map(manager => [manager.id, manager]))
export const statusByCode = new Map(statuses.map(status => [status.code, status]))
export const orderTypeByCode = new Map(orderTypes.map(type => [type.code, type]))
export const siteByCode = new Map(sites.map(site => [site.code, site]))

const formatDateOffset = (offset) => {
    const date = new Date(Date.UTC(2026, 3, 5 - offset, 8 + (offset % 8), 15, 0))

    return date.toISOString()
}

export const mockOrders = Array.from({ length: 64 }, (_, index) => {
    const id = 21001 + index
    const number = String(120500 + index)
    const firstName = customerFirstNames[index % customerFirstNames.length]
    const lastName = customerLastNames[(index * 2) % customerLastNames.length]
    const status = statuses[index % statuses.length]
    const orderType = orderTypes[index % orderTypes.length]
    const site = sites[index % sites.length]
    const manager = managers[(index + 1) % managers.length]
    const managerId = index % 5 === 0 ? null : manager.id

    return {
        id,
        number,
        status: status.code,
        createdAt: formatDateOffset(index),
        totalSumm: 1490 + (index % 9) * 730,
        firstName,
        lastName,
        phone: `+7 900 000-${String(10 + index).padStart(2, '0')}-${String(20 + index).padStart(2, '0')}`,
        managerId,
        orderType: orderType.code,
        site: site.code,
        customerComment: index % 4 === 0 ? 'Позвонить перед доставкой.' : '',
        managerComment: index % 3 === 0 ? 'Проверить наличие бонусов.' : '',
    }
})
