export enum ProcessingStatus {
    Unassigned = 'unassigned',
    Assigned = 'assigned',
    InProgress = 'in_progress',
    Processed = 'processed',
}

export enum ErrorCode {
    LoadBoard = 'loadBoard',
    LoadColumn = 'loadColumn',
    MoveCard = 'moveCard',
    TransitionUnavailable = 'transitionUnavailable',
}

export interface ManagerOption {
    id: number;
    name: string;
}

export interface DictionaryOption {
    code: string;
    name: string;
}

export interface OrderFilter {
    assigneeId: string;
    orderType: string;
    site: string;
    status: string;
}

export interface Order {
    id: number;
    number: string;
    orderType: string;
    orderTypeLabel: string;
    site: string;
    siteLabel: string;
    customerName: string;
    phone: string;
    totalSumm: number;
    assigneeId: number | null;
    assigneeName: string;
    customerComment: string;
    managerComment: string;
    status: string;
    statusLabel: string;
    createdAt: string;
    processingStatus: ProcessingStatus;
}

export interface ProcessingGroup {
    id: ProcessingStatus;
    accent: string;
    orders: Order[];
    page: number;
    limit: number;
    totalOrders: number;
    totalPages: number;
    initializing: boolean;
    loading: boolean;
    error: ErrorCode | null;
}

export interface ProcessingGroupFilter {
    column: ProcessingStatus;
    assigneeIds: string[];
    statuses: string[];
    orderTypes: string[];
    sites: string[];
    page: number;
    limit: number;
}

export interface ProcessingGroupPayload {
    items: Order[];
    pagination: {
        currentPage: number;
        limit: number;
        totalCount: number;
        totalPageCount: number;
    };
}

export type MoveContext = {
    itemId: string;
    sourceColumnId: ProcessingStatus;
    targetColumnId: ProcessingStatus;
    targetIndex: number;
}

export interface MoveSnapshot {
    item: Order;
    sourceColumnId: ProcessingStatus;
    sourceIndex: number;
    sourceTotalCount: number;
    targetColumnId: ProcessingStatus;
    targetIndex: number;
    targetTotalCount: number;
}

export type MoveResult =
    | { ok: true; item: Order, error: null }
    | { ok: false; item: null, error: ErrorCode }
