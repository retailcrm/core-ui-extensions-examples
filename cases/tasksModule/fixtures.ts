import type {
    Assignee,
    Board,
    LaneId,
    Task,
} from './types'

export const laneOrder: LaneId[] = ['queue', 'inProgress', 'review', 'done']

export const assignees: Assignee[] = [{
    id: 'anna',
    name: 'Анна Смирнова',
    role: 'Руководитель продаж',
}, {
    id: 'kirill',
    name: 'Кирилл Орлов',
    role: 'Менеджер аккаунта',
}, {
    id: 'maria',
    name: 'Мария Белова',
    role: 'Старший оператор',
}, {
    id: 'nikita',
    name: 'Никита Егоров',
    role: 'Контроль качества',
}]

const TASK_101: Task = {
    id: 'task-101',
    title: 'Подготовить план запуска welcome-цепочки',
    customerName: 'ООО Северный Берег',
    orderNumber: '100241',
    assigneeId: 'anna',
    assigneeName: 'Анна Смирнова',
    dueDate: '2026-03-24',
    estimate: '2 ч',
    priority: 'high',
}

const TASK_102: Task = {
    id: 'task-102',
    title: 'Уточнить данные по возврату и способу доставки',
    customerName: 'Мария Романова',
    orderNumber: '100278',
    assigneeId: 'maria',
    assigneeName: 'Мария Белова',
    dueDate: '2026-03-25',
    estimate: '45 мин',
    priority: 'medium',
}

const TASK_103: Task = {
    id: 'task-103',
    title: 'Проверить SLA по VIP-клиентам за неделю',
    customerName: 'ИП Захаров',
    orderNumber: '100193',
    assigneeId: 'kirill',
    assigneeName: 'Кирилл Орлов',
    dueDate: '2026-03-23',
    estimate: '3 ч',
    priority: 'high',
}

const TASK_104: Task = {
    id: 'task-104',
    title: 'Собрать фидбек по отмененным заказам',
    customerName: 'ООО Клевер',
    orderNumber: '100166',
    assigneeId: 'anna',
    assigneeName: 'Анна Смирнова',
    dueDate: '2026-03-26',
    estimate: '1.5 ч',
    priority: 'low',
}

const TASK_105: Task = {
    id: 'task-105',
    title: 'Согласовать шаблон ответа по претензиям',
    customerName: 'Дмитрий Громов',
    orderNumber: '100214',
    assigneeId: 'nikita',
    assigneeName: 'Никита Егоров',
    dueDate: '2026-03-23',
    estimate: '30 мин',
    priority: 'medium',
}

const TASK_106: Task = {
    id: 'task-106',
    title: 'Разметить повторные обращения по NPS',
    customerName: 'Елена Соколова',
    orderNumber: '100121',
    assigneeId: 'maria',
    assigneeName: 'Мария Белова',
    dueDate: '2026-03-22',
    estimate: '1 ч',
    priority: 'low',
}

export const createInitialBoard = (): Board => ({
    queue: [
        { ...TASK_101 },
        { ...TASK_102 },
    ],
    inProgress: [
        { ...TASK_103 },
        { ...TASK_104 },
    ],
    review: [
        { ...TASK_105 },
    ],
    done: [
        { ...TASK_106 },
    ],
})
