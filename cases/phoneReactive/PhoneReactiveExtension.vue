<template>
    <UiToolbarButton v-if="phone" @click="phone = t('callMade')">
        {{ t('callOn') }}{{ phone }}
    </UiToolbarButton>
</template>

<script lang="ts" setup>
import { UiToolbarButton } from '@retailcrm/embed-ui-v1-components/remote'

import { useContext as useOrder } from '@retailcrm/embed-ui-v1-contexts/remote/order/card'
import { useContext as useSettings } from '@retailcrm/embed-ui-v1-contexts/remote/settings'
import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'

import { watch } from 'vue'

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

const order = useOrder()
const phone = useField(order, 'customer.phone')

order.initialize()
</script>

<i18n locale="en-GB">
{
    "callOn": "Let's call on ",
    "callMade": "Call made"
}
</i18n>

<i18n locale="es-ES">
{
    "callOn": "Vamos a llamar a ",
    "callMade": "Llamada realizada"
}
</i18n>

<i18n locale="ru-RU">
{
    "callOn": "Звоним на ",
    "callMade": "Звонок совершен"
}
</i18n>
