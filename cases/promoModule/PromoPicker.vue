<template>
    <UiToolbarButton @click="opened = true">
        {{ t('promos') }}
    </UiToolbarButton>

    <UiModalSidebar v-model:opened="opened">
        <template #title>
            {{ t('promos') }}
        </template>

        <div :class="$style['promo-picker']">
            <dl :class="$style['promo-picker__summary']">
                <div :class="$style['promo-picker__summary-row']">
                    <dt :class="$style['promo-picker__summary-label']">
                        {{ t('order.number') }}
                    </dt>

                    <dd :class="$style['promo-picker__summary-value']">
                        {{ orderNumber ? `#${orderNumber}` : t('order.notAssigned') }}
                    </dd>
                </div>

                <div :class="$style['promo-picker__summary-row']">
                    <dt :class="$style['promo-picker__summary-label']">
                        {{ t('order.summary') }}
                    </dt>

                    <dd :class="$style['promo-picker__summary-value']">
                        {{ t('order.products', {
                            count: new Intl.NumberFormat(locale).format(totalQuantity),
                        }, totalQuantity) }}
                    </dd>
                </div>
            </dl>
        </div>
    </UiModalSidebar>
</template>

<script lang="ts" remote setup>
import { UiModalSidebar } from '@retailcrm/embed-ui-v1-components/remote'
import { UiToolbarButton } from '@retailcrm/embed-ui-v1-components/remote'

import { computed } from 'vue'
import { ref } from 'vue'
import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import { useContext as useOrder } from '@retailcrm/embed-ui-v1-contexts/remote/order/card'
import {
    useContext as useSettings,
} from '@retailcrm/embed-ui-v1-contexts/remote/settings'
import { watch } from 'vue'

defineProps<{ target?: string }>()

const opened = ref(false)

const order = useOrder()
const orderNumber = useField(order, 'number')
const orderItems = useField(order, 'items')

order.initialize()

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, value => i18n.locale.value = value, { immediate: true })

const totalQuantity = computed(() => orderItems.value.reduce((total, item) => total + item.quantity, 0))
</script>

<i18n locale="en-GB">
{
    "promos": "Promotions",
    "order": {
        "number": "Order number",
        "summary": "Summary",
        "notAssigned": "Not assigned yet",
        "products": "{count} products in the order | {count} product in the order | {count} products in the order"
    }
}
</i18n>

<i18n locale="es-ES">
{
    "promos": "Promociones",
    "order": {
        "number": "Número de pedido",
        "summary": "Resumen",
        "notAssigned": "Aún no asignado",
        "products": "{count} productos en el pedido | {count} producto en el pedido | {count} productos en el pedido"
    }
}
</i18n>

<i18n locale="ru-RU">
{
    "promos": "Акции",
    "order": {
        "number": "Номер заказа",
        "summary": "Сводка",
        "notAssigned": "Пока не присвоен",
        "products": "{count} товаров в заказе | {count} товар в заказе | {count} товара в заказе | {count} товаров в заказе"
    }
}
</i18n>

<style lang="less" module>
@import (reference) "@retailcrm/embed-ui-v1-components/assets/stylesheets/layout.less";
@import (reference) "@retailcrm/embed-ui-v1-components/assets/stylesheets/palette.less";
@import (reference) "@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";

.promo-picker {
    .text-small();

    min-height: 120px;
    color: @grey-900;

    &__summary {
        display: flex;
        flex-direction: column;
        gap: @spacing-sm;
        margin: 0;
    }

    &__summary-row {
        display: flex;
        gap: @spacing-md;
        justify-content: space-between;
        padding-bottom: @spacing-sm;
        border-bottom: 1px solid @grey-400;

        &:last-child {
            padding-bottom: 0;
            border-bottom: 0;
        }
    }

    &__summary-label {
        color: @grey-800;
    }

    &__summary-value {
        .text-regular-accent();

        margin: 0;
        color: @grey-900;
        text-align: right;
        word-break: break-word;
    }
}
</style>
