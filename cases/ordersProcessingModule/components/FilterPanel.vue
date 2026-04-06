<template>
    <section
        v-if="isSkeletonVisible"
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
        <UiField id="orders-processing-manager" :label="t('filters.manager.label')">
            <UiSelect
                id="orders-processing-manager"
                :value="draft.assigneeId"
                :placeholder="t('filters.manager.placeholder')"
                width="fluid"
                @update:value="draft.assigneeId = String($event ?? '')"
            >
                <UiSelectOption value="" :label="t('filters.manager.any')" />
                <UiSelectOption
                    v-for="manager in managers"
                    :key="manager.id"
                    :value="String(manager.id)"
                    :label="manager.name"
                />
            </UiSelect>
        </UiField>

        <UiField id="orders-processing-crm-status" :label="t('filters.status.label')">
            <UiSelect
                id="orders-processing-crm-status"
                :value="draft.crmStatus"
                :placeholder="t('filters.status.placeholder')"
                width="fluid"
                @update:value="draft.crmStatus = String($event ?? '')"
            >
                <UiSelectOption value="" :label="t('filters.status.any')" />
                <UiSelectOption
                    v-for="statusOption in statuses"
                    :key="statusOption.code"
                    :value="statusOption.code"
                    :label="statusOption.name"
                />
            </UiSelect>
        </UiField>

        <UiField id="orders-processing-order-type" :label="t('filters.orderType.label')">
            <UiSelect
                id="orders-processing-order-type"
                :value="draft.orderType"
                :placeholder="t('filters.orderType.placeholder')"
                width="fluid"
                @update:value="draft.orderType = String($event ?? '')"
            >
                <UiSelectOption value="" :label="t('filters.orderType.any')" />
                <UiSelectOption
                    v-for="type in orderTypes"
                    :key="type.code"
                    :value="type.code"
                    :label="type.name"
                />
            </UiSelect>
        </UiField>

        <UiField id="orders-processing-site" :label="t('filters.site.label')">
            <UiSelect
                id="orders-processing-site"
                :value="draft.site"
                :placeholder="t('filters.site.placeholder')"
                width="fluid"
                @update:value="draft.site = String($event ?? '')"
            >
                <UiSelectOption value="" :label="t('filters.site.any')" />

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
                :disabled="isApplying"
                @click="submitDraft"
            >
                {{ t('actions.applyFilters') }}
            </UiButton>

            <UiButton
                :aria-label="t('actions.resetFilters')"
                appearance="secondary"
                type="button"
                :disabled="isApplying"
                @click="resetDraft"
            >
                <IconClear aria-hidden="true" />
            </UiButton>
        </div>
    </form>
</template>

<script lang="ts" remote setup>
import type { DictionaryOption, ManagerOption, ProcessingFilters } from '../types'

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
    managers: ManagerOption[];
    orderTypes: DictionaryOption[];
    sites: DictionaryOption[];
    statuses: DictionaryOption[];
    filters: ProcessingFilters;
    isApplying: boolean;
    isSkeletonVisible: boolean;
}>()

const emit = defineEmits<{
    submit: [ProcessingFilters];
}>()

const { t } = useI18n({ useScope: 'local' })

const createEmptyFilters = (): ProcessingFilters => ({
    assigneeId: '',
    orderType: '',
    site: '',
    crmStatus: '',
})

const draft = reactive<ProcessingFilters>(createEmptyFilters())

watch(
    () => props.filters,
    value => {
        draft.assigneeId = value.assigneeId
        draft.crmStatus = value.crmStatus
        draft.orderType = value.orderType
        draft.site = value.site
    },
    { immediate: true, deep: true }
)

const submitDraft = () => {
    emit('submit', {
        assigneeId: draft.assigneeId,
        crmStatus: draft.crmStatus,
        orderType: draft.orderType,
        site: draft.site,
    })
}

const resetDraft = () => {
    draft.assigneeId = ''
    draft.crmStatus = ''
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
    "filters": {
        "manager": {
            "label": "Manager",
            "placeholder": "Select manager",
            "any": "All managers"
        },
        "orderType": {
            "label": "Order type",
            "placeholder": "Select order type",
            "any": "All types"
        },
        "site": {
            "label": "Site",
            "placeholder": "Select site",
            "any": "All sites"
        },
        "status": {
            "label": "CRM status",
            "placeholder": "Select CRM status",
            "any": "All statuses"
        }
    },
    "actions": {
        "applyFilters": "Apply filters",
        "resetFilters": "Reset filters"
    }
}
</i18n>

<i18n locale="es-ES">
{
    "filters": {
        "manager": {
            "label": "Gestor",
            "placeholder": "Seleccione gestor",
            "any": "Todos los gestores"
        },
        "orderType": {
            "label": "Tipo de pedido",
            "placeholder": "Seleccione tipo de pedido",
            "any": "Todos los tipos"
        },
        "site": {
            "label": "Sitio",
            "placeholder": "Seleccione sitio",
            "any": "Todos los sitios"
        },
        "status": {
            "label": "Estado CRM",
            "placeholder": "Seleccione estado CRM",
            "any": "Todos los estados"
        }
    },
    "actions": {
        "applyFilters": "Aplicar filtros",
        "resetFilters": "Restablecer filtros"
    }
}
</i18n>

<i18n locale="ru-RU">
{
    "filters": {
        "manager": {
            "label": "Менеджер",
            "placeholder": "Выберите менеджера",
            "any": "Все менеджеры"
        },
        "orderType": {
            "label": "Тип заказа",
            "placeholder": "Выберите тип заказа",
            "any": "Все типы"
        },
        "site": {
            "label": "Сайт",
            "placeholder": "Выберите сайт",
            "any": "Все сайты"
        },
        "status": {
            "label": "CRM-статус",
            "placeholder": "Выберите CRM-статус",
            "any": "Все статусы"
        }
    },
    "actions": {
        "applyFilters": "Применить фильтр",
        "resetFilters": "Сбросить фильтры"
    }
}
</i18n>
