export enum ReturnStatus {
    New = 'new',
    Approved = 'approved',
    Completed = 'completed',
    Cancelled = 'cancelled',
}

export const isReturnStatus = (value: unknown): value is ReturnStatus => {
    return typeof value === 'string' && Object.values(ReturnStatus).includes(value as ReturnStatus)
}
