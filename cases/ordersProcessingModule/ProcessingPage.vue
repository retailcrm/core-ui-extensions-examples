<template>
    <section :class="$style['page']">
        <UiPageHeader :value="t('title')">
            <template #actions>
                <UiButton appearance="secondary" @click="init">
                    {{ t('reloadBoard') }}
                </UiButton>
            </template>
        </UiPageHeader>

        <p :class="$style['subtitle']">
            {{ t('subtitle') }}
        </p>

        <FilterPanel
            :managers="managers"
            :order-types="orderTypes"
            :sites="sites"
            :statuses="statuses"
            :filters="filter"
            :applying="applying"
            :initializing="initializing"
            @submit="submitFilters"
        />

        <UiAlert v-if="error">
            {{ errorLabel(error) }}
        </UiAlert>

        <KanbanBoard
            :groups="groups"
            :initializing="initializing"
            @move="move"
            @next="next"
        />
    </section>
</template>

<script lang="ts" remote setup>
import type { OrderFilter } from './types'

import { UiAlert, UiButton, UiPageHeader } from '@retailcrm/embed-ui-v1-components/remote'

import { onBeforeMount, ref } from 'vue'
import { useField, useHost } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { watch } from 'vue'

import FilterPanel from './components/FilterPanel.vue'
import KanbanBoard from './components/KanbanBoard.vue'

import { toScalar } from './utils'
import { useDictionaries } from './composables/dictionaries'
import { useGroups } from './composables/groups'
import { useMove } from './composables/dnd'

import { ErrorCode } from './types'

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const { t, ...i18n } = useI18n()

watch(locale, value => i18n.locale.value = value || 'ru-RU', { immediate: true })

const host = useHost()

const filter = ref<OrderFilter>({
    assigneeId: '',
    orderType: '',
    site: '',
    status: '',
})

const initializing = ref(true)

const applying = ref(false)

const errorLabel = (code: ErrorCode): string => {
    switch (code) {
        case ErrorCode.LoadBoard:
            return t('boardLoadFailed')
        case ErrorCode.LoadColumn:
            return t('columnLoadFailed')
        case ErrorCode.MoveCard:
            return t('cardMoveFailed')
        case ErrorCode.TransitionUnavailable:
            return t('transitionUnavailable')
    }
}

const buildQuery = (): Record<string, string> => {
    const query: Record<string, string> = {}

    if (filter.value.assigneeId) query.assignee = filter.value.assigneeId
    if (filter.value.orderType) query.orderType = filter.value.orderType
    if (filter.value.site) query.site = filter.value.site
    if (filter.value.status) query.status = filter.value.status

    return query
}

const {
    managers,
    orderTypes,
    sites,
    statuses,
    transitions,
    bootstrap,
} = useDictionaries()

const {
    groups,
    error,
    next,
    init,
    reset,
} = useGroups(filter)

const move = useMove({
    groups,
    transitions,
    onError: (value: ErrorCode | null) => { error.value = value },
})

const submitFilters = async (data: OrderFilter) => {
    if (applying.value) return

    filter.value = { ...data }
    applying.value = true

    try {
        reset()
        await host.replaceQuery(buildQuery())
        await init()
    } finally {
        applying.value = false
    }
}

const prepared = (async () => {
    const location = await host.getLocation()

    filter.value = {
        assigneeId: toScalar(location.query.assignee),
        status: toScalar(location.query.status),
        orderType: toScalar(location.query.orderType),
        site: toScalar(location.query.site),
    }
})()

onBeforeMount(async () => {
    try {
        await Promise.all([prepared, bootstrap()])
        await init()
    } catch (e) {
        console.error(e)
        error.value = ErrorCode.LoadBoard
    } finally {
        initializing.value = false
    }
})
</script>

<i18n locale="en-GB">
{
    "title": "Order processing",
    "subtitle": "Real order cards are enriched with our own manager processing status.",
    "reloadBoard": "Reload board",
    "boardLoadFailed": "Failed to load the board.",
    "columnLoadFailed": "Failed to load the column.",
    "cardMoveFailed": "Failed to move the card.",
    "transitionUnavailable": "This transition between columns is unavailable."
}
</i18n>

<i18n locale="es-ES">
{
    "title": "Procesamiento de pedidos",
    "subtitle": "Las tarjetas reales de pedidos se complementan con nuestro propio estado de procesamiento por gestores.",
    "reloadBoard": "Actualizar tablero",
    "boardLoadFailed": "No se pudo cargar el tablero.",
    "columnLoadFailed": "No se pudo cargar la columna.",
    "cardMoveFailed": "No se pudo mover la tarjeta.",
    "transitionUnavailable": "Esta transición entre columnas no está disponible."
}
</i18n>

<i18n locale="ru-RU">
{
    "title": "Обработка заказов",
    "subtitle": "Реальные карточки заказов дополняются нашим собственным статусом обработки менеджерами.",
    "reloadBoard": "Обновить доску",
    "boardLoadFailed": "Не удалось загрузить доску.",
    "columnLoadFailed": "Не удалось загрузить колонку.",
    "cardMoveFailed": "Не удалось переместить карточку.",
    "transitionUnavailable": "Этот переход между колонками недоступен."
}
</i18n>

<style lang="less" module>
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";

.page {
  display: flex;
  flex-direction: column;
  gap: @spacing-s;
}

.subtitle {
  color: @grey-900;
  margin: 0;
}
</style>
