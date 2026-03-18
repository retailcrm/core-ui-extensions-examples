<template>
    <section
        :class="$style['list-panel']"
        :aria-busy="loading ? 'true' : 'false'"
    >
        <div :class="$style['list-panel__head']">
            <div>
                <h2 :class="$style['list-panel__title']">
                    {{ t('list.title') }}
                </h2>
            </div>
        </div>

        <UiLoader v-if="loading" :overlay="false" />

        <template v-else>
            <UiError v-if="error" :message="error" />

            <UiTable
                v-else
                :rows="rows"
                :row-class="$style['list-panel__table-row']"
                row-key="id"
                bordered
                fixed
                @row:click="onRowClick"
            >
                <UiTableColumn
                    v-slot="{ row }"
                    :label="t('list.columns.order')"
                    width="100"
                >
                    №{{ row.order.number }}
                </UiTableColumn>

                <UiTableColumn
                    v-slot="{ row }"
                    :label="t('list.columns.items')"
                    min-width="220"
                >
                    <div :class="$style['list-panel__table-products']">
                        <div
                            v-for="product in row.items"
                            :key="`${row.id}-${product.name}`"
                            :class="$style['list-panel__table-product']"
                        >
                            <span :class="$style['list-panel__product-name']">
                                {{ product.name }}
                            </span>

                            <span :class="$style['list-panel__product-details']">
                                {{ formatListProductLine(product) }}
                            </span>
                        </div>
                    </div>
                </UiTableColumn>

                <UiTableColumn
                    v-slot="{ row }"
                    :label="t('list.columns.amount')"
                    width="120"
                    min-width="120"
                    align="right"
                >
                    <span
                        :class="[
                            $style['list-panel__table-value'],
                            $style['list-panel__table-value_amount']
                        ]"
                        v-text="formatListCurrency(row.amount)"
                    />
                </UiTableColumn>

                <UiTableColumn
                    v-slot="{ row }"
                    :label="t('list.columns.date')"
                    width="104"
                    min-width="104"
                >
                    {{ formatListDateLabel(row.date) }}
                </UiTableColumn>

                <UiTableColumn
                    v-slot="{ row }"
                    :label="t('list.columns.status')"
                    width="150"
                    min-width="150"
                >
                    <UiTag :background="getStatusBackground(row.status)">
                        {{ statusLabels[row.status] }}
                    </UiTag>
                </UiTableColumn>

                <UiTableColumn
                    width="88"
                    min-width="88"
                    align="right"
                >
                    <UiButton appearance="tertiary">
                        {{ t('actions.open') }}
                    </UiButton>
                </UiTableColumn>

                <template #empty>
                    <div :class="$style['list-panel__empty']">
                        <h3 :class="$style['list-panel__empty-title']">
                            {{ t('list.emptyTitle') }}
                        </h3>

                        <p :class="$style['list-panel__empty-text']">
                            {{ t('list.emptyText') }}
                        </p>
                    </div>
                </template>

                <template #footer-summary>
                    {{ t('list.caption', { count: listTotal }) }}
                </template>

                <template #footer-pagination>
                    <UiTableFooterSection
                        v-if="totalPages > 1"
                        :class="$style['list-panel__table-pagination']"
                    >
                        <div :class="$style['list-panel__pagination']">
                            <div
                                :class="[
                                    $style['list-panel__pagination-arrows'],
                                    $style['list-panel__pagination-arrows_left'],
                                    $style['list-panel__pagination-arrows_start']
                                ]"
                            >
                                <UiTableFooterButton
                                    :class="$style['list-panel__pagination-button']"
                                    :disabled="currentPage === 1 || loading"
                                    @click="emit('change-page', currentPage - 1)"
                                >
                                    {{ t('pagination.previous') }}
                                </UiTableFooterButton>
                            </div>

                            <div :class="$style['list-panel__pagination-list']">
                                <UiTableFooterButton
                                    :class="[
                                        $style['list-panel__pagination-button'],
                                        { [$style['list-panel__pagination-button_active']]: currentPage === 1 }
                                    ]"
                                    :disabled="loading"
                                    @click="emit('change-page', 1)"
                                >
                                    1
                                </UiTableFooterButton>

                                <UiTableFooterButton
                                    v-for="page in tailVisiblePages"
                                    :key="page"
                                    :class="{
                                        [$style['list-panel__pagination-button']]: true,
                                        [$style['list-panel__pagination-button_active']]: page === currentPage
                                    }"
                                    :disabled="loading"
                                    @click="emit('change-page', page)"
                                >
                                    {{ page }}
                                </UiTableFooterButton>
                            </div>

                            <div
                                :class="[
                                    $style['list-panel__pagination-arrows'],
                                    $style['list-panel__pagination-arrows_right'],
                                    $style['list-panel__pagination-arrows_end']
                                ]"
                            >
                                <UiTableFooterButton
                                    :class="$style['list-panel__pagination-button']"
                                    :disabled="currentPage === totalPages || loading"
                                    @click="emit('change-page', currentPage + 1)"
                                >
                                    {{ t('pagination.next') }}
                                </UiTableFooterButton>
                            </div>
                        </div>
                    </UiTableFooterSection>
                </template>
            </UiTable>
        </template>
    </section>
</template>

<script lang="ts" remote setup>
import type { ReturnItem, ReturnRecord } from '../types'

import {
    UiButton,
    UiError,
    UiLoader,
    UiTable,
    UiTableColumn,
    UiTableFooterButton,
    UiTableFooterSection,
    UiTag,
} from '@retailcrm/embed-ui-v1-components/remote'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatCurrency, formatDateLabel, formatProductLine } from '../formatters'

import { ReturnStatus } from '../enums'

const props = defineProps<{
    rows: ReturnRecord[];
    loading: boolean;
    error: string;
    listTotal: number;
    currentPage: number;
    totalPages: number;
    tailVisiblePages: number[];
    locale: string;
    getStatusBackground: (status: ReturnStatus) => string;
}>()

const emit = defineEmits<{
    'row-click': [ReturnRecord];
    'change-page': [number];
}>()

const { t } = useI18n({ useScope: 'parent' })

const statusLabels = computed(() => ({
    [ReturnStatus.New]: t('status.new'),
    [ReturnStatus.Approved]: t('status.approved'),
    [ReturnStatus.Completed]: t('status.completed'),
    [ReturnStatus.Cancelled]: t('status.cancelled'),
}))

const onRowClick = ({ row }: { row: ReturnRecord }) => {
    emit('row-click', row)
}

const formatListCurrency = (amount: number) => formatCurrency(amount, props.locale)
const formatListDateLabel = (value: string) => formatDateLabel(value, props.locale)
const formatListProductLine = (item: ReturnItem) => {
    return formatProductLine(
        item,
        props.locale,
        t('list.productLine', { quantity: '{quantity}', price: '{price}' })
    )
}
</script>

<style module lang="less">
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/palette.less";

.list-panel {
  .reset-box-sizing();

  display: flex;
  flex-direction: column;
  gap: @spacing-s;
  min-width: 0;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: @spacing-s;
    flex-wrap: wrap;
  }

  &__title {
      .h4-accent();

    margin: 0;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    gap: @spacing-xs;
    padding: @spacing-m;
    background: @grey-100;
    border-radius: @border-radius-lg;
    text-align: center;
  }

  &__empty-title {
      .h4-accent();

    margin: 0;
  }

  &__empty-text {
      .text-small();

    margin: 0;
    color: @grey-900;
  }

  &__table-row {
    cursor: pointer;
    transition: background-color @transition;

    &:hover {
      background: @grey-100;
    }
  }

  &__table-value {
    display: inline-flex;
    align-items: center;
    min-width: 0;
  }

  &__table-value_amount {
    justify-content: flex-end;
    width: 100%;
  }

  &__table-products {
    display: flex;
    flex-direction: column;
    gap: @spacing-xxs;
  }

  &__table-product {
    display: flex;
    flex-direction: column;
    gap: @spacing-xxs;
    min-width: 0;
  }

  &__product-name {
      .text-small-accent();

    color: @black-500;
  }

  &__product-details {
      .text-tiny();

    color: @grey-900;
  }

  &__table-pagination {
    width: 100%;
  }

  &__pagination {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  &__pagination-arrows {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__pagination-arrows_left {
    order: 0;
  }

  &__pagination-arrows_right {
    order: 2;
  }

  &__pagination-arrows_start {
    padding-right: 8px;
    border-right: 1px solid @grey-500;
  }

  &__pagination-arrows_end {
    padding-left: 8px;
    border-left: 1px solid @grey-500;
  }

  &__pagination-list {
    order: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__pagination-button {
    all: unset;
      .reset-box-sizing();

    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    min-height: 36px;
    padding: 0 @spacing-xs;
    border-radius: @border-radius-sm;
    color: @black-500;
    cursor: pointer;
    user-select: none;
    transition: background-color @transition, color @transition, border-color @transition, opacity @transition;

    &:not(:disabled):not(&_active):hover {
      background: @blue-transparent;
      color: @blue-500;
    }

    &:not(:disabled):not(&_active):active {
      background: @blue-transparent;
      color: @blue-500;
      border: 1px solid currentColor;
    }

    &:not(&_active):focus-visible {
      outline: 2px solid @blue-500;
      outline-offset: 2px;
    }

    &:not(&_active):disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &__pagination-button_active {
    background: @blue-500;
    border-color: @blue-500;
    color: white;
  }
}

@container (max-width: 1180px) {
  .list-panel {
    &__head,
    &__table-pagination {
      flex-direction: column;
      align-items: stretch;
    }

    &__pagination,
    &__pagination-list {
      justify-content: flex-start;
    }
  }
}
</style>
