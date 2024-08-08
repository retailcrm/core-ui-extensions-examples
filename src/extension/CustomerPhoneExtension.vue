<template>
    <ul
        :class="{
            [$style['list']]: true,
            [$style['list_order']]: isOrderCard
        }"
    >
        <li :class="$style['list__item']">
            <a :href="links.whatsapp" target="_blank">
                <svg viewBox="0 0 60 60">
                    <path
                        style="fill:#2CB742;"
                        d="M0,58l4.988-14.963C2.457,38.78,1,33.812,1,28.5C1,12.76,13.76,0,29.5,0S58,12.76,58,28.5 S45.24,57,29.5,57c-4.789,0-9.299-1.187-13.26-3.273L0,58z"
                    />
                    <path
                        style="fill:#FFFFFF;"
                        d="M47.683,37.985c-1.316-2.487-6.169-5.331-6.169-5.331c-1.098-0.626-2.423-0.696-3.049,0.42
                        c0,0-1.577,1.891-1.978,2.163c-1.832,1.241-3.529,1.193-5.242-0.52l-3.981-3.981l-3.981-3.981c-1.713-1.713-1.761-3.41-0.52-5.242
                        c0.272-0.401,2.163-1.978,2.163-1.978c1.116-0.627,1.046-1.951,0.42-3.049c0,0-2.844-4.853-5.331-6.169
                        c-1.058-0.56-2.357-0.364-3.203,0.482l-1.758,1.758c-5.577,5.577-2.831,11.873,2.746,17.45l5.097,5.097l5.097,5.097
                        c5.577,5.577,11.873,8.323,17.45,2.746l1.758-1.758C48.048,40.341,48.243,39.042,47.683,37.985z"
                    />
                </svg>
            </a>
        </li>
        <li :class="$style['list__item']">
            <a :href="links.telegram" target="_blank">
                <svg viewBox="0 0 30 30" fill="none">
                    <circle cx="16" cy="16" r="14" fill="#007DBB" />
                    <path
                        d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z"
                        fill="white"
                    />
                </svg>
            </a>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const SCOPE = {
    ORDER_CARD: 'order-card',
    CUSTOMER_CARD: 'customer-card',
}

const props = defineProps({
    scope: {
        type: String,
        default: '',
    },

    phone: {
        type: String,
        default: null,
    },
})

// Пример стилизации в зависимости от scope
const isOrderCard = computed(() => {
    return props.scope === SCOPE.ORDER_CARD
})

const links = computed(() => {
    return {
        whatsapp: `https://wa.me/${props.phone}`,
        telegram: `https://t.me/${props.phone}`,
    }
})
</script>

<style lang="less" module>
.list {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    transform: translateY(5px);

    &__item {
        list-style: none;
        width: 18px;
        height: 18px;
    }

    &_order {
        margin-top: 8px;
        margin-bottom: 12px;
        transform: none;

        .list__item {
            width: 24px;
            height: 24px;
        }
    }
}
</style>
