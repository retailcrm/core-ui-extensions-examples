import type {
    ColumnPayload,
    ColumnRequestPayload,
    ColumnState,
    ColumnStateGetter,
    DictionaryOption,
    ManagerOption,
    ProcessingColumn,
    ProcessingColumnId,
} from '../types'

import { reactive, ref } from 'vue'

import { mapManagers } from '../utils'
import { useBootstrapRequest } from './requests'
import { useColumnRequest } from './requests'

type BuildColumnPayload = (columnId: string, page: number, limit: number) => ColumnRequestPayload

type ColumnRequest = (payload: ColumnRequestPayload) => Promise<ColumnPayload>
type TranslateError = (message: string) => string

const useTransitions = () => ref<Record<ProcessingColumnId, ProcessingColumnId[]>>({
    unassigned: ['assigned'],
    assigned: ['unassigned', 'in_progress'],
    in_progress: ['assigned', 'processed'],
    processed: ['in_progress'],
})

const useState = () => {
    const columns = ref<ProcessingColumn[]>([])
    const managers = ref<ManagerOption[]>([])
    const crmStatuses = ref<DictionaryOption[]>([])
    const orderTypes = ref<DictionaryOption[]>([])
    const sites = ref<DictionaryOption[]>([])
    const transitions = useTransitions()

    const bootstrap = useBootstrapRequest()

    return {
        columns,
        managers,
        orderTypes,
        sites,
        crmStatuses,
        transitions,
        bootstrap: async () => {
            const parsed = await bootstrap()

            columns.value = parsed.columns
            managers.value = mapManagers(parsed.managers)
            orderTypes.value = parsed.orderTypes
            sites.value = parsed.sites
            crmStatuses.value = parsed.crmStatuses
            transitions.value = parsed.transitionsMap
        },
    }
}

const useLoad = ({ stateOf, requestColumn, translateError }: {
    stateOf: ColumnStateGetter;
    requestColumn: ColumnRequest;
    translateError: TranslateError;
}) => async (columnId: string, payload: ColumnRequestPayload, append = false) => {
    const state = stateOf(columnId)
    const nextPage = append ? state.page + 1 : 1

    state.error = ''
    state.loading = !append
    state.loadingMore = append

    try {
        const parsed = await requestColumn({
            ...payload,
            column: columnId,
            page: nextPage,
            limit: state.limit,
        })

        state.items = append ? [...state.items, ...parsed.items] : parsed.items
        state.page = parsed.pagination.currentPage
        state.limit = parsed.pagination.limit
        state.totalCount = parsed.pagination.totalCount
        state.totalPageCount = parsed.pagination.totalPageCount
    } catch (error) {
        state.error = translateError(error instanceof Error ? error.message : String(error))
    } finally {
        state.loading = false
        state.loadingMore = false
    }
}

const resetColumnState = (state: ColumnState) => {
    state.page = 1
    state.items = []
    state.totalCount = 0
    state.totalPageCount = 1
    state.error = ''
}

const createColumnState = (): ColumnState => ({
    items: [],
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPageCount: 1,
    loading: false,
    loadingMore: false,
    error: '',
})

const useColumns = (
    columns: ReturnType<typeof useState>['columns'],
    translateError: TranslateError
) => {
    const states = reactive<Record<string, ColumnState>>({})
    const stateOf = (columnId: string): ColumnState => {
        if (!states[columnId]) { states[columnId] = createColumnState() }

        return states[columnId]
    }

    const request = useColumnRequest()
    const load = useLoad({ stateOf, translateError, requestColumn: request })

    return {
        ensureColumnState: stateOf,
        next: async (columnId: string, buildColumnPayload: BuildColumnPayload) => {
            const { page, limit } = stateOf(columnId)

            await load(columnId, buildColumnPayload(columnId, page + 1, limit), true)
        },
        reloadBoard: async (buildColumnPayload: BuildColumnPayload) => {
            await Promise.all(columns.value.map(column => load(
                column.id,
                buildColumnPayload(column.id, 1, stateOf(column.id).limit))
            ))
        },
        resetColumnStates: () => {
            columns.value.forEach(column => resetColumnState(stateOf(column.id)))
        },
    }
}

export const useBoard = ({ loadColumnError }: { loadColumnError: TranslateError; }) => {
    const state = useState()

    const { reloadBoard, ...board } = useColumns(state.columns, loadColumnError)

    const boardError = ref('')

    return {
        ...state,
        ...board,
        boardError,
        initializing: ref(true),
        setBoardError: (value: string) => { boardError.value = value },
        reloadBoard: async (buildColumnPayload: BuildColumnPayload) => {
            boardError.value = ''
            await reloadBoard(buildColumnPayload)
        },
    }
}
