export type ProcessingColumnId = 'unassigned' | 'assigned' | 'in_progress' | 'processed'

export interface ManagerOption {
    id: number;
    name: string;
}

export interface DictionaryOption {
    code: string;
    name: string;
}

export interface ProcessingFilters {
    assigneeId: string;
    crmStatus: string;
    orderType: string;
    site: string;
}

export interface ProcessingColumn {
    id: ProcessingColumnId;
    title: string;
    accent: string;
}

export interface OrderCard {
    id: number;
    number: string;
    crmStatus: string;
    crmStatusLabel: string;
    processingStatus: ProcessingColumnId;
    customerName: string;
    phone: string;
    totalSumm: number;
    createdAt: string;
    assigneeId: number | null;
    assigneeName: string;
    crmManagerId: number | null;
    crmManagerName: string;
    site: string;
    siteLabel: string;
    orderType: string;
    orderTypeLabel: string;
    customerComment: string;
    managerComment: string;
}

export interface ColumnState {
    items: OrderCard[];
    page: number;
    limit: number;
    totalCount: number;
    totalPageCount: number;
    loading: boolean;
    loadingMore: boolean;
    error: string;
}

export type ColumnStateGetter = (columnId: string) => ColumnState

export interface ColumnView extends ProcessingColumn, ColumnState {
    loadedCount: number;
    hasMore: boolean;
    isVisuallyEmpty: boolean;
}

export interface BootstrapPayload {
    columns: ProcessingColumn[];
    transitionsMap: Record<ProcessingColumnId, ProcessingColumnId[]>;
    managers: Array<{ id: number; firstName: string; lastName: string }>;
    crmStatuses: DictionaryOption[];
    orderTypes: DictionaryOption[];
    sites: DictionaryOption[];
}

export interface ColumnPayload {
    items: OrderCard[];
    pagination: {
        currentPage: number;
        limit: number;
        totalCount: number;
        totalPageCount: number;
    };
}

export interface ColumnRequestPayload {
    column: string;
    page: number;
    limit: number;
    assigneeIds: string[];
    crmStatuses: string[];
    orderTypes: string[];
    sites: string[];
}

export interface ProcessingLocationQuery {
    assignee?: string;
    crmStatus?: string;
    orderType?: string;
    site?: string;
}

export interface MoveSnapshot {
    item: OrderCard;
    sourceColumnId: ProcessingColumnId;
    sourceIndex: number;
    sourceTotalCount: number;
    targetColumnId: ProcessingColumnId;
    targetIndex: number;
    targetTotalCount: number;
}

export type MoveResult =
    | { ok: true; item: OrderCard }
    | { ok: false; error: string }
