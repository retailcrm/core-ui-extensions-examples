<template>
    <UiButton appearance="secondary" class="mt-4" @click="opened = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M20.2 3.00003H20.5C20.7762 3.00003 21 3.22388 21 3.50003V18.33C21.0021 18.7374 20.7568 19.1052 20.38 19.26L16.75 20.77C16.3855 20.9216 15.9947 20.9998 15.6 21H14.4C14.0053 20.9998 13.6145 20.9216 13.25 20.77L9.00001 19L4.57001 20.85C4.32576 20.9504 4.06406 21.0013 3.80001 21H3.50001C3.22387 21 3.00001 20.7762 3.00001 20.5V5.67003C2.99797 5.26268 3.24322 4.89481 3.62001 4.74003L7.25001 3.23003C7.61448 3.07845 8.00528 3.00029 8.40001 3.00003H9.60001C9.99474 3.00029 10.3855 3.07845 10.75 3.23003L15 5.00003L19.43 3.15003C19.6743 3.04968 19.936 2.9987 20.2 3.00003ZM8.00001 5.08002L5.00001 6.33002V18.5L8.00001 17.25V5.08002ZM10 17.25V5.08002L14 6.75002V18.92L10 17.25ZM16 18.92L19 17.67V5.50003L16 6.75003V18.92Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
            />
        </svg>
        На карте
    </UiButton>

    <UiModalWindow
        v-model:opened="opened"
        :class="$style['window']"
    >
        <template #title>
            Адрес
        </template>

        <CrmYandexMap 
            :api-key="'dd51f938-0693-457d-ae62-6d50fa668d0a'"
            :address="address"
            @change="address = $event"
        />

        <template #footer>
            <UiButton @click="order.set('delivery.address', address); opened = false">
                Выбрать
            </UiButton>
        </template>
    </UiModalWindow>
</template>

<script lang="ts" setup>
import {
    UiButton,
    UiModalWindow,
    CrmYandexMap,
} from '@/components'

import { ref, onMounted } from 'vue'

import { useOrderCardContext } from '@retailcrm/embed-ui'

const order = useOrderCardContext()

const opened = ref(false)
const address = ref('')

onMounted(async () => {
    await order.initialize()

    address.value = order['delivery.address'] ?? ''
})
</script>

<style lang="less" module>
.window :global(.omnica-modal-window__content) {
    padding: 0;
}
</style>
