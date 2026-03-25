export type LaneId = 'queue' | 'inProgress' | 'review' | 'done'

export type Priority = 'high' | 'medium' | 'low'

export type Assignee = {
    id: string;
    name: string;
    role: string;
}

export type Task = {
    id: string;
    title: string;
    customerName: string;
    orderNumber: string;
    assigneeId: string;
    assigneeName: string;
    dueDate: string;
    estimate: string;
    priority: Priority;
}

export type Board = Record<LaneId, Task[]>

export type ActivityState = (
    | { kind: 'idle' }
    | { kind: 'dragstart'; title: string }
    | { kind: 'cancel'; title: string }
    | { kind: 'ignored'; itemId: string }
    | { kind: 'notFound'; itemId: string }
    | { kind: 'moved'; title: string; laneId: LaneId }
)
