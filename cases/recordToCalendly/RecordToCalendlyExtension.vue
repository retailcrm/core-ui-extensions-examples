<template>
    <UiToolbarButton @click="opened = true">
        <IconCalendar class="UiIcon-icon-2pR-" />
        {{ t('recordToMeeting') }}
    </UiToolbarButton>
    <UiModalWindow v-model:opened="opened">
        <template #title>
            {{ t('recordToMeeting') }}
        </template>
        <template #default>
            <iframe
                :src="`https://calendly.com/embed-demo-sales/discovery-call?embed_domain=www.calendly-embed.com&embed_type=Inline&name=${firstName}&&email=${email}`"
                width="100%"
                height="1200px"
                frameborder="0"
            />
        </template>
        <template #footer>
            <UiToolbarButton @click="opened = false">
                {{ t('close') }}
            </UiToolbarButton>
        </template>
    </UiModalWindow>
</template>

<script lang="ts" setup>
import {
    useOrderCardContext,
    useField,
    useSettingsContext,
} from '@retailcrm/embed-ui'

import { UiToolbarButton, UiModalWindow } from '@retailcrm/embed-ui-v1-components/remote';

import IconCalendar from  '@retailcrm/embed-ui-v1-components/assets/sprites/actions/calendar-month.svg'

import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'

// set locale
const settings = useSettingsContext()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

// init reactive fields
const context = useOrderCardContext()
const firstName = useField(context, 'customer.firstName')
const email = useField(context, 'customer.email')

context.initialize()

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
