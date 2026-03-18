<template>
    <section :class="$style['returns-page']">
        <header :class="$style['returns-page__hero']">
            <div :class="$style['returns-page__hero-copy']">
                <!--
                <h1 :class="$style['returns-page__title']">
                    {{ t('page.title') }}
                </h1>
                -->

                <p :class="$style['returns-page__subtitle']">
                    {{ t('page.subtitle') }}
                </p>
            </div>

            <div :class="$style['returns-page__hero-actions']">
                <div :class="$style['returns-page__hero-button']">
                    <UiButton appearance="primary" @click="openCreateDrawer()">
                        {{ t('actions.createReturn') }}
                    </UiButton>
                </div>
            </div>
        </header>

        <FilterPanel
            :value="appliedFilters"
            :loading="loadingList"
            @update:value="onFiltersUpdate"
        />

        <ListPanel
            :rows="returns"
            :loading="loadingList"
            :error="listError"
            :list-total="listTotal"
            :current-page="currentPage"
            :total-pages="totalPages"
            :tail-visible-pages="tailVisiblePages"
            :locale="getLocale()"
            :get-status-background="getStatusBackground"
            @row-click="onReturnRowClick"
            @change-page="changePage"
        />

        <EditorDrawer
            :opened="drawerOpened"
            :title="drawerTitle"
            :mode="drawerMode"
            :loading="drawerLoading"
            :saving="saving"
            :errors="formErrors"
            :date="formDate"
            :status="formStatus"
            :selected-order="selectedOrder"
            :items="formItems"
            :order-query="orderQuery"
            :order-search-results="orderSearchResults"
            :order-search-loading="orderSearchLoading"
            :order-search-error="orderSearchError"
            :has-order-search-attempt="hasOrderSearchAttempt"
            :locale="getLocale()"
            @update:opened="onDrawerOpened"
            @update:date="onFormDateChange"
            @update:status="onFormStatusChange"
            @update:order-query="onOrderQueryChange"
            @search-orders="searchOrders"
            @select-order="selectOrder"
            @save="saveReturn"
        />
    </section>
</template>

<script lang="ts" remote setup>
import type {
    DrawerMode,
    OrderOption,
    ReturnItem,
    ReturnRecord,
    ReturnsFilterValue,
} from './types'

import { UiButton } from '@retailcrm/embed-ui-v1-components/remote'

import { computed, onMounted, ref } from 'vue'
import { useField, useHost } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { watch } from 'vue'

import EditorDrawer from './components/EditorDrawer.vue'
import FilterPanel from './components/FilterPanel.vue'
import ListPanel from './components/ListPanel.vue'

import { isReturnStatus, ReturnStatus } from './enums'

import { formatDateQuery, parseDateString } from './formatters'

const ITEMS_PER_PAGE = 8

const statusBackgrounds: Record<ReturnStatus, string> = {
    [ReturnStatus.New]: '#FFF9F0',
    [ReturnStatus.Approved]: '#EDF4FF',
    [ReturnStatus.Completed]: '#D8F8EE',
    [ReturnStatus.Cancelled]: '#FFEDED',
}

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, value => i18n.locale.value = value || 'ru-RU', { immediate: true })

const host = useHost()

const listTotal = ref(0)
const returns = ref<ReturnRecord[]>([])
const loadingList = ref(false)
const listError = ref('')

const createEmptyFilters = (): ReturnsFilterValue => ({
    date: null,
    status: 'all',
    orderNumber: '',
    amount: '',
})

const cloneFilters = (value: ReturnsFilterValue): ReturnsFilterValue => ({
    date: value.date ? new Date(value.date) : null,
    status: value.status,
    orderNumber: value.orderNumber,
    amount: value.amount,
})

const appliedFilters = ref<ReturnsFilterValue>(createEmptyFilters())
const currentPage = ref(1)

const drawerMode = ref<DrawerMode>('closed')
const editingId = ref<number | null>(null)
const drawerLoading = ref(false)
const saving = ref(false)

const formDate = ref<Date | null>(new Date())
const formStatus = ref<ReturnStatus>(ReturnStatus.New)
const selectedOrder = ref<OrderOption | null>(null)
const formItems = ref<ReturnItem[]>([])
const formErrors = ref<string[]>([])

const orderQuery = ref('')
const orderSearchResults = ref<OrderOption[]>([])
const orderSearchLoading = ref(false)
const orderSearchError = ref('')
const hasOrderSearchAttempt = ref(false)

const drawerOpened = computed(() => drawerMode.value !== 'closed')
const totalPages = computed(() => Math.max(1, Math.ceil(listTotal.value / ITEMS_PER_PAGE)))
const drawerTitle = computed(() => {
    if (drawerMode.value === 'create') {
        return t('drawer.createTitle')
    }

    return editingId.value
        ? t('drawer.editTitle', { id: editingId.value })
        : t('drawer.editTitleFallback')
})

const visiblePages = computed(() => {
    const pages = new Set<number>()

    pages.add(1)
    pages.add(totalPages.value)

    for (let page = currentPage.value - 1; page <= currentPage.value + 1; page += 1) {
        if (page >= 1 && page <= totalPages.value) {
            pages.add(page)
        }
    }

    return [...pages].sort((left, right) => left - right)
})

const tailVisiblePages = computed(() => visiblePages.value.filter(page => page !== 1))

const getLocale = () => locale.value || 'ru-RU'

const cloneItems = (items: ReturnItem[]) => items.map(item => ({ ...item }))
const cloneOrder = (order: OrderOption): OrderOption => ({
    ...order,
    items: cloneItems(order.items),
})

const toScalar = (value?: string | string[]) => Array.isArray(value) ? (value[0] || '') : (value || '')

const parsePositiveInt = (value: string, fallback: number) => {
    const parsed = Number.parseInt(value, 10)

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const getStatusBackground = (status: ReturnStatus) => statusBackgrounds[status]

const resetOrderSearch = () => {
    orderQuery.value = ''
    orderSearchResults.value = []
    orderSearchError.value = ''
    orderSearchLoading.value = false
    hasOrderSearchAttempt.value = false
}

const resetForm = () => {
    formItems.value = []
    formStatus.value = ReturnStatus.New
    formDate.value = new Date()
    formErrors.value = []
    selectedOrder.value = null
    resetOrderSearch()
}

const onFormDateChange = (value: Date | null) => {
    formDate.value = value
}

const onFormStatusChange = (value: ReturnStatus) => {
    formStatus.value = value
}

const onOrderQueryChange = (value: string) => {
    orderQuery.value = value
}

const onFiltersUpdate = async (value: ReturnsFilterValue) => {
    appliedFilters.value = cloneFilters(value)
    currentPage.value = 1
    await syncQuery()
    await loadReturns()
}

const buildQuery = () => {
    const query: Record<string, string> = {}

    if (appliedFilters.value.date) {
        query.date = formatDateQuery(appliedFilters.value.date)
    }

    if (appliedFilters.value.status !== 'all') {
        query.status = appliedFilters.value.status
    }

    if (appliedFilters.value.orderNumber.trim()) {
        query.order = appliedFilters.value.orderNumber.trim()
    }

    if (appliedFilters.value.amount.trim()) {
        query.amount = appliedFilters.value.amount.trim()
    }

    if (currentPage.value > 1) {
        query.page = String(currentPage.value)
    }

    return query
}

const syncQuery = async () => {
    await host.replaceQuery(buildQuery())
}

const applyReturnToForm = (returnRecord: ReturnRecord) => {
    formDate.value = parseDateString(returnRecord.date)
    formStatus.value = returnRecord.status
    selectedOrder.value = cloneOrder(returnRecord.order)
    formItems.value = cloneItems(returnRecord.items)
    orderQuery.value = returnRecord.order.number
    orderSearchResults.value = []
    orderSearchError.value = ''
}

type Payload = {
    returns: ReturnRecord[];
    total: number;
    page: number;
}

const loadReturns = async () => {
    loadingList.value = true
    listError.value = ''
    const requestedPage = currentPage.value

    const { body, status } = await host.httpCall('/returns', {
        page: requestedPage,
        perPage: ITEMS_PER_PAGE,
        filters: {
            date: formatDateQuery(appliedFilters.value.date),
            status: appliedFilters.value.status === 'all' ? '' : appliedFilters.value.status,
            orderNumber: appliedFilters.value.orderNumber.trim(),
            amount: appliedFilters.value.amount.trim(),
        },
    })

    if (status === 200) {
        const parsed = JSON.parse(body) as Payload

        returns.value = parsed.returns
        listTotal.value = parsed.total
        currentPage.value = parsed.page

        if (parsed.page !== requestedPage) {
            await syncQuery()
        }
    } else {
        listError.value = `${t('errors.loadReturns')} ${body}`
    }

    loadingList.value = false
}

const searchOrders = async () => {
    const query = orderQuery.value.trim()

    orderSearchResults.value = []
    orderSearchError.value = ''
    hasOrderSearchAttempt.value = false

    if (!query) {
        return
    }

    orderSearchLoading.value = true

    const { body, status } = await host.httpCall('/orders/search', { query })

    if (status === 200) {
        orderSearchResults.value = JSON.parse(body).orders as OrderOption[]
        hasOrderSearchAttempt.value = true
    } else {
        orderSearchError.value = `${t('errors.loadOrders')} ${body}`
    }

    orderSearchLoading.value = false
}

const selectOrder = (order: OrderOption) => {
    selectedOrder.value = cloneOrder(order)
    orderQuery.value = order.number
    orderSearchResults.value = []
    orderSearchError.value = ''
    hasOrderSearchAttempt.value = false

    if (drawerMode.value === 'edit') {
        formItems.value = cloneItems(order.items)
    }
}

const openCreateDrawer = async () => {
    resetForm()
    drawerMode.value = 'create'
    editingId.value = null
    drawerLoading.value = false
}

const openEditDrawer = async (id: number) => {
    drawerMode.value = 'edit'
    editingId.value = id
    drawerLoading.value = true
    formErrors.value = []
    resetOrderSearch()

    const { body, status } = await host.httpCall('/return', { id })

    if (status === 200) {
        applyReturnToForm(JSON.parse(body).return as ReturnRecord)
    } else {
        formErrors.value = [`${t('errors.loadReturn')} ${body}`]
    }

    drawerLoading.value = false
}

const closeDrawer = async () => {
    drawerMode.value = 'closed'
    editingId.value = null
    drawerLoading.value = false
    formErrors.value = []
    resetOrderSearch()
}

const validateForm = () => {
    const errors: string[] = []

    if (!formDate.value) {
        errors.push(t('errors.requiredDate'))
    }

    if (!selectedOrder.value) {
        errors.push(t('errors.requiredOrder'))
    }

    formErrors.value = errors

    return errors.length === 0
}

const saveReturn = async () => {
    if (!validateForm() || !selectedOrder.value || !formDate.value) {
        return
    }

    saving.value = true

    const currentMode = drawerMode.value
    const { body, status } = await host.httpCall('/returns/save', {
        id: editingId.value,
        orderId: selectedOrder.value.id,
        mode: currentMode,
        status: formStatus.value,
        date: formatDateQuery(formDate.value),
    })

    if (status === 200) {
        if (currentMode === 'create') {
            currentPage.value = 1
        }

        await closeDrawer()
        await loadReturns()
    } else {
        formErrors.value = [`${t('errors.saveReturn')} ${body}`]
    }

    saving.value = false
}

const changePage = async (page: number) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) {
        return
    }

    currentPage.value = page
    await syncQuery()
    await loadReturns()
}

const onReturnRowClick = (row: ReturnRecord) => {
    void openEditDrawer(row.id)
}

const onDrawerOpened = (opened: boolean) => {
    if (!opened && drawerMode.value !== 'closed') {
        void closeDrawer()
    }
}

const restoreStateFromLocation = async () => {
    const location = await host.getLocation()
    const date = toScalar(location.query.date)
    const status = toScalar(location.query.status)
    const order = toScalar(location.query.order)
    const amount = toScalar(location.query.amount)
    const page = toScalar(location.query.page)
    const restoredFilters: ReturnsFilterValue = {
        date: parseDateString(date),
        status: isReturnStatus(status)
            ? status as ReturnStatus
            : 'all',
        orderNumber: order,
        amount,
    }

    appliedFilters.value = cloneFilters(restoredFilters)
    currentPage.value = parsePositiveInt(page, 1)

    await loadReturns()
}

onMounted(async () => {
    await restoreStateFromLocation()
})
</script>

<i18n locale="en-GB">
{
    "page": {
        "title": "Returns",
        "subtitle": "Demo registry of returns with filters, pagination and sidebar state stored in query string."
    },
    "filters": {
        "title": "Filters",
        "note": "Filter the registry by exact date, status, order number or amount.",
        "date": "Date",
        "status": "Status",
        "order": "Order number",
        "amount": "Amount",
        "anyStatus": "Any status",
        "orderPlaceholder": "For example 100245",
        "amountPlaceholder": "For example 1290"
    },
    "list": {
        "title": "Return list",
        "caption": "Found: {count}",
        "emptyTitle": "No returns found",
        "emptyText": "Change filters or create a new return.",
        "columns": {
            "date": "Date",
            "status": "Status",
            "order": "Order",
            "amount": "Amount",
            "items": "Items"
        },
        "productLine": "{quantity} pcs. · {price}"
    },
    "drawer": {
        "createTitle": "Create return",
        "editTitle": "Return #{id}",
        "editTitleFallback": "Edit return",
        "fields": {
            "date": "Date",
            "status": "Status",
            "order": "Order",
            "items": "Items"
        },
        "selectedOrder": "{customer} · {amount}",
        "currentOrder": "Current order",
        "orderPlaceholder": "Search order by number",
        "orderResult": "{customer} · {amount}",
        "noOrdersFound": "No matching orders were found.",
        "emptyValue": "No value"
    },
    "actions": {
        "createReturn": "Create return",
        "applyFilters": "Apply",
        "resetFilters": "Reset",
        "open": "Open",
        "findOrder": "Find",
        "cancel": "Cancel",
        "save": "Save",
        "saving": "Saving..."
    },
    "pagination": {
        "previous": "Previous",
        "next": "Next"
    },
    "status": {
        "new": "New",
        "approved": "Approved",
        "completed": "Completed",
        "cancelled": "Cancelled"
    },
    "errors": {
        "loadReturns": "Failed to load returns:",
        "loadReturn": "Failed to load return:",
        "loadOrders": "Failed to load orders:",
        "saveReturn": "Failed to save return:",
        "requiredDate": "Specify the return date.",
        "requiredOrder": "Select an order."
    }
}
</i18n>

<i18n locale="es-ES">
{
    "page": {
        "title": "Devoluciones",
        "subtitle": "Registro de devoluciones con filtros, paginación y estado de la barra lateral guardado en el query string."
    },
    "filters": {
        "title": "Filtros",
        "note": "Filtre el registro por fecha exacta, estado, número de pedido o importe.",
        "date": "Fecha",
        "status": "Estado",
        "order": "Número de pedido",
        "amount": "Importe",
        "anyStatus": "Cualquier estado",
        "orderPlaceholder": "Por ejemplo 100245",
        "amountPlaceholder": "Por ejemplo 1290"
    },
    "list": {
        "title": "Lista de devoluciones",
        "caption": "Encontradas: {count}",
        "emptyTitle": "No se encontraron devoluciones",
        "emptyText": "Cambie los filtros o cree una nueva devolución.",
        "columns": {
            "date": "Fecha",
            "status": "Estado",
            "order": "Pedido",
            "amount": "Importe",
            "items": "Productos"
        },
        "productLine": "{quantity} uds. · {price}"
    },
    "drawer": {
        "createTitle": "Crear devolución",
        "editTitle": "Devolución #{id}",
        "editTitleFallback": "Editar devolución",
        "fields": {
            "date": "Fecha",
            "status": "Estado",
            "order": "Pedido",
            "items": "Productos"
        },
        "selectedOrder": "{customer} · {amount}",
        "currentOrder": "Pedido actual",
        "orderPlaceholder": "Buscar pedido por número",
        "orderResult": "{customer} · {amount}",
        "noOrdersFound": "No se encontraron pedidos.",
        "emptyValue": "Sin valor"
    },
    "actions": {
        "createReturn": "Crear devolución",
        "applyFilters": "Aplicar",
        "resetFilters": "Restablecer",
        "open": "Abrir",
        "findOrder": "Buscar",
        "cancel": "Cancelar",
        "save": "Guardar",
        "saving": "Guardando..."
    },
    "pagination": {
        "previous": "Anterior",
        "next": "Siguiente"
    },
    "status": {
        "new": "Nuevo",
        "approved": "Aprobado",
        "completed": "Completado",
        "cancelled": "Cancelado"
    },
    "errors": {
        "loadReturns": "No se pudieron cargar las devoluciones:",
        "loadReturn": "No se pudo cargar la devolución:",
        "loadOrders": "No se pudieron cargar los pedidos:",
        "saveReturn": "No se pudo guardar la devolución:",
        "requiredDate": "Indique la fecha de la devolución.",
        "requiredOrder": "Seleccione un pedido."
    }
}
</i18n>

<i18n locale="ru-RU">
{
    "page": {
        "title": "Возвраты",
        "subtitle": "Демо-реестр возвратов с фильтрами, пагинацией и состоянием шторки, сохраненными в query string."
    },
    "filters": {
        "title": "Фильтры",
        "note": "Можно отфильтровать список по точной дате, статусу, номеру заказа и сумме.",
        "date": "Дата",
        "status": "Статус",
        "order": "Заказ по номеру",
        "amount": "Сумма",
        "anyStatus": "Все статусы",
        "orderPlaceholder": "Например 100245",
        "amountPlaceholder": "Например 1290"
    },
    "list": {
        "title": "Список возвратов",
        "caption": "Найдено: {count}",
        "emptyTitle": "Возвраты не найдены",
        "emptyText": "Измените фильтры или создайте новый возврат.",
        "columns": {
            "date": "Дата",
            "status": "Статус",
            "order": "Заказ",
            "amount": "Сумма",
            "items": "Товары"
        },
        "productLine": "{quantity} шт. · {price}"
    },
    "drawer": {
        "createTitle": "Создать возврат",
        "editTitle": "Возврат #{id}",
        "editTitleFallback": "Редактирование возврата",
        "fields": {
            "date": "Дата",
            "status": "Статус",
            "order": "Заказ",
            "items": "Товары"
        },
        "selectedOrder": "{customer} · {amount}",
        "currentOrder": "Текущий заказ",
        "orderPlaceholder": "Найти заказ по номеру",
        "orderResult": "{customer} · {amount}",
        "noOrdersFound": "Подходящие заказы не найдены.",
        "emptyValue": "Нет значения"
    },
    "actions": {
        "createReturn": "Создать возврат",
        "applyFilters": "Применить",
        "resetFilters": "Сбросить",
        "open": "Открыть",
        "findOrder": "Найти",
        "cancel": "Отмена",
        "save": "Сохранить",
        "saving": "Сохраняем..."
    },
    "pagination": {
        "previous": "Назад",
        "next": "Вперед"
    },
    "status": {
        "new": "Новый",
        "approved": "Согласован",
        "completed": "Выполнен",
        "cancelled": "Отменен"
    },
    "errors": {
        "loadReturns": "Не удалось загрузить возвраты:",
        "loadReturn": "Не удалось загрузить возврат:",
        "loadOrders": "Не удалось загрузить заказы:",
        "saveReturn": "Не удалось сохранить возврат:",
        "requiredDate": "Укажите дату возврата.",
        "requiredOrder": "Выберите заказ."
    }
}
</i18n>

<style module lang="less">
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/palette.less";

.returns-page {
    .reset-box-sizing();

  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: @spacing-s;
  min-width: 0;
  color: @black-500;

  &__hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: @spacing-s;
    min-width: 0;
  }

  &__hero-copy {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: @spacing-xs;
    min-width: 0;
    max-width: 680px;
  }

  &__title {
    .h2-accent();
    margin: 0;
  }

  &__subtitle {
    color: @grey-900;
    .text-small();
    margin: 0;
  }

  &__hero-actions {
    display: flex;
    flex: 0 1 auto;
    align-items: center;
    gap: @spacing-s;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  &__hero-button {
    flex: 0 0 auto;
  }

}

@container (max-width: 1180px) {
  .returns-page {
    &__hero,
    &__hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    &__hero-copy {
      max-width: none;
    }
  }
}
</style>
