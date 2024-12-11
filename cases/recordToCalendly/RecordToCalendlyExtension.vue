<template>
    <UiToolbarButton @click="opened = true">
        <IconCalendar class="UiIcon-icon-2pR-" />
        {{ t('recordToMeeting') }}
    </UiToolbarButton>

    <UiModalWindow v-model:opened="opened">
        <template #title>
            {{ t('recordToMeeting') }}
        </template>

        <iframe
            :src="`https://calendly.com/embed-demo-sales/discovery-call?embed_domain=www.calendly-embed.com&embed_type=Inline&name=${firstName}&&email=${email}`"
            width="100%"
            height="1200px"
            frameborder="0"
        />

        <template #footer>
            <UiToolbarButton @click="opened = false">
                {{ t('close') }}
            </UiToolbarButton>
        </template>
    </UiModalWindow>
</template>

<script lang="ts" setup>

import IconCalendar from  '@retailcrm/embed-ui-v1-components/assets/sprites/actions/calendar-month.svg'

import {
    UiModalWindow,
    UiToolbarButton,
} from '@retailcrm/embed-ui-v1-components/remote'

import { useOrderCardContext as useOrder } from '@retailcrm/embed-ui'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'

import { ref, watch } from 'vue'

// set locale
const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

// init reactive fields
const order = useOrder()
const firstName = useField(order, 'customer.firstName')
const email = useField(order, 'customer.email')

order.initialize()

// data
const opened = ref(false)
</script>

<i18n locale="en-GB">
{
    "recordToMeeting": "Record to meeting",
    "close": "Close"
}
</i18n>

<i18n locale="es-ES">
{
    "recordToMeeting": "Grabar a la reunión",
    "close": "Cerrar"
}
</i18n>

<i18n locale="ru-RU">
{
    "recordToMeeting": "Записать на встречу",
    "close": "Закрыть"
}
</i18n>
