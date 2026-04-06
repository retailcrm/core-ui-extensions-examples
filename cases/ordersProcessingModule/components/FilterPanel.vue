<template>
    <section
        v-if="initializing"
        :class="$style['filters']"
    >
        <div
            v-for="column in 4"
            :key="column"
            :class="$style['filters__skeleton-field']"
        >
            <UiSkeleton
                appearance="text"
                animation="shimmer"
                size="sm"
                width="36%"
            />

            <UiSkeleton
                appearance="rectangle"
                animation="shimmer"
                height="38px"
                width="100%"
            />
        </div>

        <div :class="$style['filters__actions']">
            <UiSkeleton
                appearance="rectangle"
                animation="shimmer"
                height="36px"
                width="148px"
            />

            <UiSkeleton
                appearance="rectangle"
                animation="shimmer"
                height="36px"
                width="36px"
            />
        </div>
    </section>

    <form
        v-else
        :class="$style['filters']"
        @submit.prevent="submitDraft"
    >
        <UiField id="orders-processing-manager" :label="t('managerLabel')">
            <UiSelect
                id="orders-processing-manager"
                :value="draft.assigneeId"
                :placeholder="t('managerPlaceholder')"
                width="fluid"
                @update:value="draft.assigneeId = String($event ?? '')"
            >
                <UiSelectOption value="" :label="t('managerAny')" />
                <UiSelectOption
                    v-for="manager in managers"
                    :key="manager.id"
                    :value="String(manager.id)"
                    :label="manager.name"
                />
            </UiSelect>
        </UiField>

        <UiField id="orders-processing-crm-status" :label="t('statusLabel')">
            <UiSelect
                id="orders-processing-crm-status"
                :value="draft.status"
                :placeholder="t('statusPlaceholder')"
                width="fluid"
                @update:value="draft.status = String($event ?? '')"
            >
                <UiSelectOption value="" :label="t('statusAny')" />
                <UiSelectOption
                    v-for="statusOption in statuses"
                    :key="statusOption.code"
                    :value="statusOption.code"
                    :label="statusOption.name"
                />
            </UiSelect>
        </UiField>

        <UiField id="orders-processing-order-type" :label="t('orderTypeLabel')">
            <UiSelect
                id="orders-processing-order-type"
                :value="draft.orderType"
                :placeholder="t('orderTypePlaceholder')"
                width="fluid"
                @update:value="draft.orderType = String($event ?? '')"
            >
                <UiSelectOption value="" :label="t('orderTypeAny')" />
                <UiSelectOption
                    v-for="type in orderTypes"
                    :key="type.code"
                    :value="type.code"
                    :label="type.name"
                />
            </UiSelect>
        </UiField>

        <UiField id="orders-processing-site" :label="t('siteLabel')">
            <UiSelect
                id="orders-processing-site"
                :value="draft.site"
                :placeholder="t('sitePlaceholder')"
                width="fluid"
                @update:value="draft.site = String($event ?? '')"
            >
                <UiSelectOption value="" :label="t('siteAny')" />

                <UiSelectOption
                    v-for="siteOption in sites"
                    :key="siteOption.code"
                    :value="siteOption.code"
                    :label="siteOption.name"
                />
            </UiSelect>
        </UiField>

        <div :class="$style['filters__actions']">
            <UiButton
                appearance="secondary"
                type="button"
                :disabled="applying"
                @click="submitDraft"
            >
                {{ t('applyFilters') }}
            </UiButton>

            <UiButton
                :aria-label="t('resetFilters')"
                appearance="secondary"
                type="button"
                :disabled="applying"
                @click="resetDraft"
            >
                <IconClear aria-hidden="true" />
            </UiButton>
        </div>
    </form>
</template>

<script lang="ts" remote setup>
import type { DictionaryOption, ManagerOption, OrderFilter } from '../types'

import {
    UiButton,
    UiField,
    UiSelect,
    UiSelectOption,
    UiSkeleton,
} from '@retailcrm/embed-ui-v1-components/remote'

import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

import IconClear from '@retailcrm/embed-ui-v1-components/assets/sprites/actions/clear.svg'

const props = defineProps<{
    filters: OrderFilter;
    managers: ManagerOption[];
    orderTypes: DictionaryOption[];
    sites: DictionaryOption[];
    statuses: DictionaryOption[];
    applying: boolean;
    initializing: boolean;
}>()

const emit = defineEmits<{
    submit: [OrderFilter];
}>()

const { t } = useI18n()

const createEmptyFilters = (): OrderFilter => ({
    assigneeId: '',
    orderType: '',
    site: '',
    status: '',
})

const draft = reactive<OrderFilter>(createEmptyFilters())

watch(
    () => props.filters,
    value => {
        draft.assigneeId = value.assigneeId
        draft.status = value.status
        draft.orderType = value.orderType
        draft.site = value.site
    },
    { immediate: true, deep: true }
)

const submitDraft = () => {
    emit('submit', {
        assigneeId: draft.assigneeId,
        status: draft.status,
        orderType: draft.orderType,
        site: draft.site,
    })
}

const resetDraft = () => {
    draft.assigneeId = ''
    draft.status = ''
    draft.orderType = ''
    draft.site = ''

    submitDraft()
}
</script>

<style lang="less" module>
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";

.filters {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: @spacing-s;
    align-items: end;
    padding: @spacing-s;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: @border-radius-lg;

    &__actions {
        display: flex;
        flex-wrap: wrap;
        gap: @spacing-xs;
        grid-column: 1 / -1;
    }

    &__skeleton-field {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
    }
}
</style>

<i18n locale="en-GB">
{
    "managerLabel": "Manager",
    "managerPlaceholder": "Select manager",
    "managerAny": "All managers",
    "orderTypeLabel": "Order type",
    "orderTypePlaceholder": "Select order type",
    "orderTypeAny": "All types",
    "siteLabel": "Site",
    "sitePlaceholder": "Select site",
    "siteAny": "All sites",
    "statusLabel": "CRM status",
    "statusPlaceholder": "Select CRM status",
    "statusAny": "All statuses",
    "applyFilters": "Apply filters",
    "resetFilters": "Reset filters"
}
</i18n>

<i18n locale="es-ES">
{
    "managerLabel": "Gestor",
    "managerPlaceholder": "Seleccione gestor",
    "managerAny": "Todos los gestores",
    "orderTypeLabel": "Tipo de pedido",
    "orderTypePlaceholder": "Seleccione tipo de pedido",
    "orderTypeAny": "Todos los tipos",
    "siteLabel": "Sitio",
    "sitePlaceholder": "Seleccione sitio",
    "siteAny": "Todos los sitios",
    "statusLabel": "Estado CRM",
    "statusPlaceholder": "Seleccione estado CRM",
    "statusAny": "Todos los estados",
    "applyFilters": "Aplicar filtros",
    "resetFilters": "Restablecer filtros"
}
</i18n>

<i18n locale="ru-RU">
{
    "managerLabel": "Менеджер",
    "managerPlaceholder": "Выберите менеджера",
    "managerAny": "Все менеджеры",
    "orderTypeLabel": "Тип заказа",
    "orderTypePlaceholder": "Выберите тип заказа",
    "orderTypeAny": "Все типы",
    "siteLabel": "Сайт",
    "sitePlaceholder": "Выберите сайт",
    "siteAny": "Все сайты",
    "statusLabel": "CRM-статус",
    "statusPlaceholder": "Выберите CRM-статус",
    "statusAny": "Все статусы",
    "applyFilters": "Применить фильтр",
    "resetFilters": "Сбросить фильтры"
}
</i18n>
