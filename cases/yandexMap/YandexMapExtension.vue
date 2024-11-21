<template>
    <UiButton appearance="secondary" size="xs" @click="opened = true">
        <IconMapOutlined />
        {{ t('onTheMap') }}
    </UiButton>

    <UiModalWindow
        v-model:opened="opened"
        :class="$style['window']"
    >
        <template #title>
            {{ t('address') }}
        </template>

        <CrmYandexMap 
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
    CrmYandexMap,
} from './components'

import IconMapOutlined from './assets/map-outlined.svg'

import { onMounted, watch, ref } from 'vue'

import { useI18n } from 'vue-i18n'

import {
    useSettingsContext,
    useOrderCardContext,
    useField,
} from '@retailcrm/embed-ui'

const settings = useSettingsContext()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

const order = useOrderCardContext()

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
.window :global(.omnica-modal-window__content) {
    padding: 0;
}
</style>
