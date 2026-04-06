<template>
    <section :class="$style['page']">
        <UiPageHeader :value="t('page.title')">
            <template #actions>
                <UiButton appearance="secondary" @click="reloadCurrentBoard">
                    {{ t('actions.reloadBoard') }}
                </UiButton>
            </template>
        </UiPageHeader>

        <p :class="$style['page__subtitle']">
            {{ t('page.subtitle') }}
        </p>

        <FilterPanel
            :managers="managers"
            :order-types="orderTypes"
            :sites="sites"
            :statuses="crmStatuses"
            :filters="filters"
            :is-applying="applying"
            :is-skeleton-visible="initializing && columns.length === 0"
            @submit="submitFilters"
        />

        <p v-if="boardError" :class="$style['page__error']">
            {{ boardError }}
        </p>

        <KanbanBoard
            :columns="columnsView"
            :initializing="initializing"
            @move="moveCard"
            @next="next"
        />
    </section>
</template>

<script lang="ts" remote setup>
import type {
    ColumnView,
    MoveResult,
    ProcessingColumnId,
    ProcessingFilters,
} from './types'

import { UiButton, UiPageHeader } from '@retailcrm/embed-ui-v1-components/remote'

import { computed, onMounted, ref } from 'vue'
import { useField, useHost } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { watch } from 'vue'

import FilterPanel from './components/FilterPanel.vue'
import KanbanBoard from './components/KanbanBoard.vue'

import { toScalar } from './utils'
import { useBoard } from './composables/board'
import { useProcessingDragAndDrop } from './composables/dnd'

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const { t } = useI18n({ useScope: 'local' })
const { locale: globalLocale } = useI18n({ useScope: 'global' })

watch(locale, value => globalLocale.value = value || 'ru-RU', { immediate: true })

const host = useHost()

const filters = ref<ProcessingFilters>({
    assigneeId: '',
    orderType: '',
    site: '',
    crmStatus: '',
})

const applying = ref(false)

const persistCardMove = async (targetColumnId: ProcessingColumnId, itemId: string): Promise<MoveResult> => {
    const { body, status } = await host.httpCall('/orders-processing/move', {
        orderId: Number(itemId),
        targetColumnId,
        assigneeId: filters.value.assigneeId || undefined,
    })

    if (status !== 200) {
        return {
            ok: false,
            error: `${t('errors.moveCard')} ${body}`,
        }
    }

    return {
        ok: true,
        item: JSON.parse(body).item,
    }
}

const buildQuery = (): Record<string, string> => {
    const query: Record<string, string> = {}

    if (filters.value.assigneeId) query.assignee = filters.value.assigneeId
    if (filters.value.orderType) query.orderType = filters.value.orderType
    if (filters.value.site) query.site = filters.value.site
    if (filters.value.crmStatus) query.crmStatus = filters.value.crmStatus

    return query
}

const buildColumnPayload = (columnId: string, page: number, limit: number) => {
    return {
        column: columnId,
        page,
        limit,
        assigneeIds: filters.value.assigneeId ? [filters.value.assigneeId] : [],
        crmStatuses: filters.value.crmStatus ? [filters.value.crmStatus] : [],
        orderTypes: filters.value.orderType ? [filters.value.orderType] : [],
        sites: filters.value.site ? [filters.value.site] : [],
    }
}

const {
    columns,
    managers,
    orderTypes,
    sites,
    crmStatuses,
    transitions,
    boardError,
    initializing,
    bootstrap,
    next: nextColumnPage,
    reloadBoard,
    resetColumnStates,
    setBoardError,
    ensureColumnState,
} = useBoard({
    loadColumnError: message => `${t('errors.loadColumn')} ${message}`,
})

const { moveCard } = useProcessingDragAndDrop({
    appliedAssigneeId: computed(() => filters.value.assigneeId),
    ensureColumnState,
    getUnassignedLabel: () => t('shared.unassigned'),
    managers,
    persistCardMove,
    setBoardError,
    transitions,
    transitionUnavailableMessage: () => t('errors.transitionUnavailable'),
})

const columnsView = computed<ColumnView[]>(() => {
    return columns.value.map(column => {
        const state = ensureColumnState(column.id)

        return {
            ...column,
            title: {
                unassigned: t('board.columns.unassigned'),
                assigned: t('board.columns.assigned'),
                in_progress: t('board.columns.inProgress'),
                processed: t('board.columns.processed'),
            }[column.id] || column.title,
            ...state,
            loadedCount: state.items.length,
            hasMore: state.page < state.totalPageCount,
            isVisuallyEmpty: state.items.length === 0,
        }
    })
})

const reloadCurrentBoard = () => reloadBoard(buildColumnPayload)

const submitFilters = async (data: ProcessingFilters) => {
    if (applying.value) return

    filters.value = { ...data }
    applying.value = true

    try {
        resetColumnStates()
        await host.replaceQuery(buildQuery())
        await reloadBoard(buildColumnPayload)
    } finally {
        applying.value = false
    }
}

const next = async (columnId: string) => {
    await nextColumnPage(columnId, buildColumnPayload)
}

onMounted(async () => {
    try {
        const location = await host.getLocation()

        filters.value = {
            assigneeId: toScalar(location.query.assignee),
            crmStatus: toScalar(location.query.crmStatus),
            orderType: toScalar(location.query.orderType),
            site: toScalar(location.query.site),
        }
        await bootstrap()
        await reloadCurrentBoard()
    } catch (error) {
        setBoardError(error instanceof Error ? error.message : String(error))
    } finally {
        initializing.value = false
    }
})
</script>

<style lang="less" module>
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";

.page {
    display: flex;
    flex-direction: column;
    gap: @spacing-s;

    &__subtitle {
        margin: 0;
        color: #5F6B7A;
    }

    &__error {
        margin: 0;
        padding: @spacing-xs @spacing-s;
        color: #9F2D2D;
        background: #FFF1F1;
        border: 1px solid #F4C7C7;
        border-radius: @border-radius-md;
    }
}
</style>

<i18n locale="en-GB">
{
    "page": {
        "title": "Order processing",
        "subtitle": "Real order cards are enriched with our own manager processing status."
    },
    "actions": {
        "reloadBoard": "Reload board"
    },
    "board": {
        "columns": {
            "unassigned": "Unassigned",
            "assigned": "Assigned",
            "inProgress": "In progress",
            "processed": "Processed"
        }
    },
    "shared": {
        "unassigned": "Unassigned"
    },
    "errors": {
        "loadColumn": "Failed to load column:",
        "moveCard": "Failed to move card:",
        "transitionUnavailable": "This transition between columns is unavailable."
    }
}
</i18n>

<i18n locale="es-ES">
{
    "page": {
        "title": "Procesamiento de pedidos",
        "subtitle": "Las tarjetas reales de pedidos se complementan con nuestro propio estado de procesamiento por gestores."
    },
    "actions": {
        "reloadBoard": "Actualizar tablero"
    },
    "board": {
        "columns": {
            "unassigned": "Sin asignar",
            "assigned": "Asignado",
            "inProgress": "En curso",
            "processed": "Procesado"
        }
    },
    "shared": {
        "unassigned": "Sin asignar"
    },
    "errors": {
        "loadColumn": "No se pudo cargar la columna:",
        "moveCard": "No se pudo mover la tarjeta:",
        "transitionUnavailable": "Esta transición entre columnas no está disponible."
    }
}
</i18n>

<i18n locale="ru-RU">
{
    "page": {
        "title": "Обработка заказов",
        "subtitle": "Реальные карточки заказов дополняются нашим собственным статусом обработки менеджерами."
    },
    "actions": {
        "reloadBoard": "Обновить доску"
    },
    "board": {
        "columns": {
            "unassigned": "Не назначен",
            "assigned": "Назначен",
            "inProgress": "В работе",
            "processed": "Обработан"
        }
    },
    "shared": {
        "unassigned": "Не назначен"
    },
    "errors": {
        "loadColumn": "Не удалось загрузить колонку:",
        "moveCard": "Не удалось переместить карточку:",
        "transitionUnavailable": "Этот переход между колонками недоступен."
    }
}
</i18n>
