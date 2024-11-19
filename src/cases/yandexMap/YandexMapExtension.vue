<template>
    <UiButton appearance="secondary" @click="opened = true">
        <IconMapOutlined />
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
            :address="address || ''"
            @change="address = $event"
        />

        <template #footer>
            <UiButton appearance="secondary" @click="opened = false">
                Закрыть
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

import IconMapOutlined from './assets/map-outlined.svg'

import { onMounted, ref } from 'vue'

import {
    useOrderCardContext,
    useField,
} from '@retailcrm/embed-ui'

const order = useOrderCardContext()

const opened = ref(false)
const address = useField(order, 'delivery.address')

onMounted(() => order.initialize())
</script>

<style lang="less" module>
.window :global(.omnica-modal-window__content) {
    padding: 0;
}
</style>
