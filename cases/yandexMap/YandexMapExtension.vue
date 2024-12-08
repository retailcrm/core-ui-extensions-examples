<template>
    <UiToolbarButton @click="opened = true">
        <IconMapOutlined />
        {{ t('onTheMap') }}
    </UiToolbarButton>

    <UiModalWindow
        v-model:opened="opened"
        :class="$style['window']"
    >
        <template #title>
            {{ t('address') }}
        </template>

        <UiYandexMap
            :api-key="'dd51f938-0693-457d-ae62-6d50fa668d0a'"
            :address="address || ''"
            @change="address = $event"
        />

        <template #footer>
            <UiButton appearance="secondary" @click="opened = false">
                {{ t('close') }}
            </UiButton>
        </template>
    </UiModalWindow>
</template>

<script lang="ts" setup>
import {
    UiButton,
    UiModalWindow,
    UiToolbarButton,
    UiYandexMap,
} from '@retailcrm/embed-ui-v1-components/remote'

import IconMapOutlined from './assets/map-outlined.svg'

import { onMounted, ref, watch } from 'vue'

import { useContext as useOrder } from '@retailcrm/embed-ui-v1-contexts/remote/order/card'
import { useContext as useSettings } from '@retailcrm/embed-ui-v1-contexts/remote/settings'
import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

const order = useOrder()

const opened = ref(false)
const address = useField(order, 'delivery.address')

onMounted(() => order.initialize())
</script>

<i18n locale="en-GB">
{
    "address": "Address",
    "close": "Close",
    "onTheMap": "On the map"
}
</i18n>

<i18n locale="es-ES">
{
    "address": "Dirección",
    "close": "Cerrar",
    "onTheMap": "En el mapa"
}
</i18n>

<i18n locale="ru-RU">
{
    "address": "Адрес",
    "close": "Закрыть",
    "onTheMap": "На карте"
}
</i18n>

<style lang="less" module>
.window :global(.ui-v1-modal-window__content) {
    padding: 0;
}
</style>
