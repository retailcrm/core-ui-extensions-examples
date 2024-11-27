<template>
    <UiToolbarButton>{{ t('demoButton1') }}</UiToolbarButton>

    <UiToolbarButton>
        <IconEdit class="UiIcon-icon-2pR-" />
        {{ t('elseButton2') }}
    </UiToolbarButton>

    <UiToolbarButton v-if="additional">
        <IconAdd class="UiIcon-icon-2pR-" />
    </UiToolbarButton>

    <UiToolbarLink v-if="additional">
        {{ t('link') }}
    </UiToolbarLink>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { WidgetTarget } from '@retailcrm/embed-ui/types/widget'

import IconAdd from  '@retailcrm/embed-ui-v1-components/assets/sprites/actions/add-circle-outlined.svg'
import IconEdit from '@retailcrm/embed-ui-v1-components/assets/sprites/ui/edit.svg'

import {
    UiToolbarButton,
    UiToolbarLink,
} from '@retailcrm/embed-ui-v1-components/remote'

import {
    useField,
    useSettingsContext,
} from '@retailcrm/embed-ui'

import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

const props = defineProps({
    target: {
        type: String as PropType<WidgetTarget>,
        required: true,
    },
})

// set locale
const settings = useSettingsContext()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

let additional = true
if (
    [
        'order/card:customer.email',
        'order/card:customer.phone',
        'order/card:delivery.address',
    ].includes(props.target)
) {
    additional = false
}

</script>

<i18n locale="en-GB">
{
    "demoButton1": "Demo Button 1",
    "elseButton2": "Else Button 2",
    "link": "Link"
}
</i18n>

<i18n locale="es-ES">
{
    "demoButton1": "Botón de demostración 1",
    "elseButton2": "Botón más 2",
    "link": "Enlace"
}
</i18n>

<i18n locale="ru-RU">
{
    "demoButton1": "Демо-кнопка 1",
    "elseButton2": "Ещё кнопка 2",
    "link": "Ссылка"
}
</i18n>
