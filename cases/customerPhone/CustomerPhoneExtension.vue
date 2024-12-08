<template>
    <ul v-if="phone" :class="$style['list']">
        <li :class="$style['list__item']">
            <a :href="`https://wa.me/${phone}`" target="_blank">
                <IconWhatsapp />
            </a>
        </li>

        <li :class="$style['list__item']">
            <a :href="`https://t.me/${phone}`" target="_blank">
                <IconTelegram />
            </a>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import type { ComputedRef, PropType } from 'vue'
import type { WidgetTarget } from '@retailcrm/embed-ui/types/widget'

import IconTelegram from './assets/telegram.svg'
import IconWhatsapp from './assets/whatsapp.svg'

import { computed } from 'vue'

import { useContext as useOrder } from '@retailcrm/embed-ui-v1-contexts/remote/order/card'
import { useContext as usePhone } from '@retailcrm/embed-ui-v1-contexts/remote/customer/card-phone'

import { useField } from '@retailcrm/embed-ui'

const props = defineProps({
    target: {
        type: String as PropType<WidgetTarget>,
        required: true,
    },
})

let phone: ComputedRef<string | null>

if (props.target === 'customer/card:phone') {
    const context = usePhone()

    context.initialize()

    phone = useField(context, 'value')
} else if (props.target === 'order/card:customer.phone') {
    const context = useOrder()

    context.initialize()

    phone = useField(context, 'customer.phone')
} else {
    phone = computed(() => '')
}
</script>

<style lang="less" module>
.list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: inline-flex;
    align-items: center;
    grid-gap: 4px;

    &__item {
        width: 18px;
        height: 18px;
    }
}
</style>
