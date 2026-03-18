<template>
    <section
        :class="$style['filter-panel']"
        :aria-busy="loading ? 'true' : 'false'"
    >
        <div :class="$style['filter-panel__head']">
            <div>
                <h2 :class="$style['filter-panel__title']">
                    {{ t('filters.title') }}
                </h2>

                <p :class="$style['filter-panel__note']">
                    {{ t('filters.note') }}
                </p>
            </div>
        </div>

        <div :class="$style['filter-panel__grid']">
            <UiField id="returns-filter-date" :label="t('filters.date')">
                <UiDatePicker
                    id="returns-filter-date"
                    :value="localValue.date"
                    @update:value="onDateChange"
                />
            </UiField>

            <UiField id="returns-filter-status" :label="t('filters.status')">
                <UiSelect
                    id="returns-filter-status"
                    :value="localValue.status"
                    @update:value="onStatusChange"
                >
                    <UiSelectOption
                        v-for="status in statusOptions"
                        :key="status.value"
                        :value="status.value"
                        :label="status.label"
                    />
                </UiSelect>
            </UiField>

            <UiField id="returns-filter-order" :label="t('filters.order')">
                <UiTextbox
                    id="returns-filter-order"
                    :value="localValue.orderNumber"
                    :placeholder="t('filters.orderPlaceholder')"
                    @update:value="onOrderNumberChange"
                />
            </UiField>

            <UiField id="returns-filter-amount" :label="t('filters.amount')">
                <UiTextbox
                    id="returns-filter-amount"
                    :value="localValue.amount"
                    inputmode="decimal"
                    :placeholder="t('filters.amountPlaceholder')"
                    @update:value="onAmountChange"
                />
            </UiField>
        </div>

        <div :class="$style['filter-panel__toolbar']">
            <UiButton appearance="primary" :disabled="loading" @click="applyFilters">
                {{ t('actions.applyFilters') }}
            </UiButton>

            <UiButton appearance="secondary" :disabled="loading" @click="resetFilters">
                {{ t('actions.resetFilters') }}
            </UiButton>
        </div>
    </section>
</template>

<script lang="ts" remote setup>
import type { ReturnsFilterValue } from '../types'

import {
    UiButton,
    UiDatePicker,
    UiField,
    UiSelect,
    UiSelectOption,
    UiTextbox,
} from '@retailcrm/embed-ui-v1-components/remote'

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

import { isReturnStatus, ReturnStatus } from '../enums'

const props = defineProps<{
    value: ReturnsFilterValue;
    loading?: boolean;
}>()

const emit = defineEmits<{
    'update:value': [ReturnsFilterValue];
}>()

const { t } = useI18n({ useScope: 'parent' })

const cloneDate = (value: Date | null) => value ? new Date(value) : null
const cloneFilters = (value: ReturnsFilterValue): ReturnsFilterValue => ({
    date: cloneDate(value.date),
    status: value.status,
    orderNumber: value.orderNumber,
    amount: value.amount,
})
const createEmptyFilters = (): ReturnsFilterValue => ({
    date: null,
    status: 'all',
    orderNumber: '',
    amount: '',
})

const localValue = ref<ReturnsFilterValue>(cloneFilters(props.value))

watch(() => props.value, value => {
    localValue.value = cloneFilters(value)
}, { deep: true })

const statusLabels = computed(() => ({
    [ReturnStatus.New]: t('status.new'),
    [ReturnStatus.Approved]: t('status.approved'),
    [ReturnStatus.Completed]: t('status.completed'),
    [ReturnStatus.Cancelled]: t('status.cancelled'),
}))

const statusOptions = computed(() => [
    { value: 'all' as const, label: t('filters.anyStatus') },
    ...[
        ReturnStatus.New,
        ReturnStatus.Approved,
        ReturnStatus.Completed,
        ReturnStatus.Cancelled,
    ].map(status => ({
        value: status,
        label: statusLabels.value[status],
    })),
])

const updateValue = (patch: Partial<ReturnsFilterValue>) => {
    localValue.value = {
        date: patch.date === undefined ? cloneDate(localValue.value.date) : cloneDate(patch.date),
        status: patch.status === undefined ? localValue.value.status : patch.status,
        orderNumber: patch.orderNumber === undefined ? localValue.value.orderNumber : patch.orderNumber,
        amount: patch.amount === undefined ? localValue.value.amount : patch.amount,
    }
}

const onDateChange = (value: Date | Date[] | null) => {
    updateValue({ date: value instanceof Date ? value : null })
}

const onStatusChange = (value: unknown) => {
    updateValue({
        status: value === 'all' || isReturnStatus(value)
            ? value as ReturnsFilterValue['status']
            : 'all',
    })
}

const onOrderNumberChange = (value: string | number) => {
    updateValue({ orderNumber: String(value) })
}

const onAmountChange = (value: string | number) => {
    updateValue({ amount: String(value) })
}

const applyFilters = () => {
    emit('update:value', cloneFilters(localValue.value))
}

const resetFilters = () => {
    const emptyFilters = createEmptyFilters()

    localValue.value = emptyFilters
    emit('update:value', cloneFilters(emptyFilters))
}
</script>

<style module lang="less">
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/palette.less";

.filter-panel {
  .reset-box-sizing();

  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: @spacing-s;
  padding: @spacing-s;
  background: white;
  border: 1px solid @grey-500;
  border-radius: @border-radius-lg;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: @spacing-s;
    flex-wrap: wrap;
  }

  &__title { .h4-accent(); margin: 0; }
  &__note {
    .text-small();
    color: @grey-900;
    margin: @spacing-xxs 0 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: @spacing-s;

    :global(.ui-v1-date-picker) {
      max-width: 100%;
    }
  }

  &__toolbar {
    display: flex;
    gap: @spacing-xs;
    flex-wrap: wrap;
  }
}

@container (max-width: 1180px) {
  .filter-panel {
    &__grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    &__head {
      flex-direction: column;
      align-items: stretch;
    }
  }
}

@container (max-width: 940px) {
  .filter-panel__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@container (max-width: 620px) {
  .filter-panel__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
