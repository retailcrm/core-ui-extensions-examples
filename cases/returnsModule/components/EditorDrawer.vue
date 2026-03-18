<template>
    <UiModalSidebar
        :opened="opened"
        :class="$style['editor-drawer']"
        @update:opened="emit('update:opened', $event)"
    >
        <template #title>
            {{ title }}
        </template>

        <UiLoader v-if="loading" :overlay="false" />

        <div
            v-else
            :class="$style['editor-drawer__body']"
            :aria-busy="loading ? 'true' : 'false'"
        >
            <UiError
                v-for="(error, index) in errors"
                :key="`${index}-${error}`"
                :message="error"
            />

            <div :class="$style['editor-drawer__grid']">
                <UiField
                    id="returns-form-date"
                    :label="t('drawer.fields.date')"
                    :required="mode === 'create'"
                >
                    <UiDatePicker
                        v-if="mode === 'create'"
                        id="returns-form-date"
                        :value="date"
                        @update:value="onDateChange"
                    />

                    <div v-else :class="$style['editor-drawer__static']">
                        {{ date ? formatDrawerDate(date) : t('drawer.emptyValue') }}
                    </div>
                </UiField>

                <UiField id="returns-form-status" :label="t('drawer.fields.status')" required>
                    <UiSelect
                        id="returns-form-status"
                        :value="status"
                        @update:value="onStatusChange"
                    >
                        <UiSelectOption
                            v-for="statusOption in statusOptions"
                            :key="statusOption.value"
                            :value="statusOption.value"
                            :label="statusOption.label"
                        />
                    </UiSelect>
                </UiField>
            </div>

            <UiField id="returns-form-order" :label="t('drawer.fields.order')" required>
                <div v-if="selectedOrder" :class="$style['editor-drawer__selected-order']">
                    <div>
                        <strong :class="$style['editor-drawer__selected-order-number']">
                            №{{ selectedOrder.number }}
                        </strong>

                        <p :class="$style['editor-drawer__selected-order-text']">
                            {{ formatSelectedOrderSummary(selectedOrder) }}
                        </p>
                    </div>

                    <UiTag :background="'#D8F8EE'">
                        {{ t('drawer.currentOrder') }}
                    </UiTag>
                </div>

                <div :class="$style['editor-drawer__search-box']">
                    <div :class="$style['editor-drawer__search-row']">
                        <UiTextbox
                            id="returns-form-order"
                            :value="orderQuery"
                            :placeholder="t('drawer.orderPlaceholder')"
                            @update:value="onOrderQueryChange"
                        />

                        <UiButton appearance="secondary" @click="emit('search-orders')">
                            {{ t('actions.findOrder') }}
                        </UiButton>
                    </div>

                    <UiLoader v-if="orderSearchLoading" :overlay="false" />

                    <UiError v-else-if="orderSearchError" :message="orderSearchError" />

                    <div
                        v-else-if="hasOrderSearchAttempt && orderSearchResults.length === 0"
                        :class="$style['editor-drawer__search-empty']"
                    >
                        {{ t('drawer.noOrdersFound') }}
                    </div>

                    <div v-else-if="orderSearchResults.length > 0" :class="$style['editor-drawer__search-results']">
                        <button
                            v-for="order in orderSearchResults"
                            :key="order.id"
                            type="button"
                            :class="$style['editor-drawer__search-result']"
                            @click="emit('select-order', order)"
                        >
                            <span :class="$style['editor-drawer__search-result-number']">
                                №{{ order.number }}
                            </span>

                            <span :class="$style['editor-drawer__search-result-text']">
                                {{ formatSearchResultSummary(order) }}
                            </span>
                        </button>
                    </div>
                </div>
            </UiField>

            <UiField
                v-if="mode === 'edit'"
                id="returns-form-items"
                :label="t('drawer.fields.items')"
            >
                <div :class="$style['editor-drawer__field-value']">
                    <ul :class="$style['editor-drawer__products-list']">
                        <li
                            v-for="product in items"
                            :key="`${product.name}-${product.quantity}`"
                            :class="$style['editor-drawer__product']"
                        >
                            <span :class="$style['editor-drawer__product-name']">
                                {{ product.name }}
                            </span>

                            <span :class="$style['editor-drawer__product-details']">
                                {{ formatDrawerProductLine(product) }}
                            </span>
                        </li>
                    </ul>
                </div>
            </UiField>
        </div>

        <template #footer>
            <div :class="$style['editor-drawer__actions']">
                <UiButton appearance="secondary" :disabled="saving" @click="emit('update:opened', false)">
                    {{ t('actions.cancel') }}
                </UiButton>

                <UiButton appearance="primary" :disabled="saving" @click="emit('save')">
                    {{ saving ? t('actions.saving') : t('actions.save') }}
                </UiButton>
            </div>
        </template>
    </UiModalSidebar>
</template>

<script lang="ts" remote setup>
import type { DrawerMode, OrderOption, ReturnItem } from '../types'

import { computed } from 'vue'
import {
    UiButton,
    UiDatePicker,
    UiError,
    UiField,
    UiLoader,
    UiModalSidebar,
    UiSelect,
    UiSelectOption,
    UiTag,
    UiTextbox,
} from '@retailcrm/embed-ui-v1-components/remote'
import { useI18n } from 'vue-i18n'

import {
    formatCurrency,
    formatDateLabel,
    formatDateQuery,
    formatProductLine,
} from '../formatters'

import { isReturnStatus, ReturnStatus } from '../enums'

const props = defineProps<{
    opened: boolean;
    title: string;
    mode: DrawerMode;
    loading: boolean;
    saving: boolean;
    errors: string[];
    date: Date | null;
    status: ReturnStatus;
    selectedOrder: OrderOption | null;
    items: ReturnItem[];
    orderQuery: string;
    orderSearchResults: OrderOption[];
    orderSearchLoading: boolean;
    orderSearchError: string;
    hasOrderSearchAttempt: boolean;
    locale: string;
}>()

const emit = defineEmits<{
    'update:opened': [boolean];
    'update:date': [Date | null];
    'update:status': [ReturnStatus];
    'update:order-query': [string];
    'search-orders': [];
    'select-order': [OrderOption];
    'save': [];
}>()

const { t } = useI18n({ useScope: 'parent' })

const formatOrderSummary = (template: string, order: OrderOption) => {
    return template
        .replace('{customer}', order.customer)
        .replace('{amount}', formatCurrency(order.amount, props.locale))
}

const formatSelectedOrderSummary = (order: OrderOption) => {
    return formatOrderSummary(
        t('drawer.selectedOrder', { customer: '{customer}', amount: '{amount}' }),
        order
    )
}

const formatSearchResultSummary = (order: OrderOption) => {
    return formatOrderSummary(
        t('drawer.orderResult', { customer: '{customer}', amount: '{amount}' }),
        order
    )
}

const formatDrawerDate = (value: Date) => formatDateLabel(formatDateQuery(value), props.locale)

const formatDrawerProductLine = (item: ReturnItem) => {
    return formatProductLine(
        item,
        props.locale,
        t('list.productLine', { quantity: '{quantity}', price: '{price}' })
    )
}

const statusLabels = computed(() => ({
    [ReturnStatus.New]: t('status.new'),
    [ReturnStatus.Approved]: t('status.approved'),
    [ReturnStatus.Completed]: t('status.completed'),
    [ReturnStatus.Cancelled]: t('status.cancelled'),
}))

const statusOptions = computed(() => [
    ReturnStatus.New,
    ReturnStatus.Approved,
    ReturnStatus.Completed,
    ReturnStatus.Cancelled,
].map(status => ({
    value: status,
    label: statusLabels.value[status],
})))

const onDateChange = (value: Date | Date[] | null) => {
    emit('update:date', value instanceof Date ? value : null)
}

const onStatusChange = (value: unknown) => {
    if (isReturnStatus(value)) {
        emit('update:status', value as ReturnStatus)
    }
}

const onOrderQueryChange = (value: string | number) => {
    emit('update:order-query', String(value))
}
</script>

<style module lang="less">
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/palette.less";

.editor-drawer {
    container-type: inline-size;

    &__body {
        display: flex;
        flex-direction: column;
        gap: @spacing-s;
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: @spacing-s;
    }

    &__field-value {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
        min-height: 48px;
        padding: @spacing-xs @spacing-s;
        background: @grey-100;
        border: 1px solid @grey-500;
        border-radius: @border-radius-md;
    }

    &__selected-order {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: @spacing-s;
        padding: @spacing-xs @spacing-s;
        background: @green-transparent;
        border-radius: @border-radius-lg;
        margin-bottom: @spacing-xs;
    }

    &__selected-order-number {
          .text-regular-accent();

        display: block;
    }

    &__selected-order-text {
          .text-small();

        margin: @spacing-xxs 0 0;
        color: @grey-900;
    }

    &__search-box {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
    }

    &__search-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: @spacing-xs;
        align-items: center;
    }

    &__search-empty {
          .text-small();

        padding: @spacing-xs @spacing-s;
        background: @grey-100;
        border-radius: @border-radius-md;
        color: @grey-900;
    }

    &__search-results {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
    }

    &__search-result {
        display: flex;
        flex-direction: column;
        gap: @spacing-xxs;
        width: 100%;
        padding: @spacing-xs @spacing-s;
        text-align: left;
        background: white;
        border: 1px solid @grey-500;
        border-radius: @border-radius-md;
        cursor: pointer;
        transition: border-color @transition, background-color @transition;

        &:hover {
            background: @grey-100;
            border-color: @blue-400;
        }
    }

    &__search-result-number {
          .text-small-accent();

        color: @black-500;
    }

    &__search-result-text {
          .text-tiny();

        color: @grey-900;
    }

    &__products-list {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__product {
        display: flex;
        flex-direction: column;
        gap: @spacing-xxs;
        padding: @spacing-xs;
        background: @grey-100;
        border-radius: @border-radius-md;
    }

    &__product-name {
          .text-small-accent();

        color: @black-500;
    }

    &__product-details {
          .text-tiny();

        color: @grey-900;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: @spacing-xs;
    }

    &__static {
        display: inline-flex;
        width: fit-content;
        height: 36px;
        padding: 6px 12px;
        background: @grey-400;
        border-radius: @border-radius-sm;
        .text-regular();
    }
}

@container (max-width: 1180px) {
    .editor-drawer {
        &__actions,
        &__selected-order {
            flex-direction: column;
            align-items: stretch;
        }

        &__search-row {
            grid-template-columns: minmax(0, 1fr);
        }
    }
}

@container (max-width: 940px) {
    .editor-drawer {
        &__grid,
        &__products-list {
            grid-template-columns: minmax(0, 1fr);
        }
    }
}
</style>
