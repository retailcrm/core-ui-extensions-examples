<template>
    <UiToolbarButton>
        {{ t('demoButton1') }}
    </UiToolbarButton>
    <UiToolbarButton>
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            class="UiIcon-icon-2pR-"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M19.902 3.44l.659.658c.28.28.439.66.439 1.058v.758c.005.404-.153.793-.44 1.078l-1.845 1.816a.499.499 0 01-.708 0l-2.804-2.844a.499.499 0 010-.698l1.806-1.827A1.497 1.497 0 0118.087 3h.758c.397 0 .777.158 1.057.44zm-3.082 7.245a.5.5 0 000-.699l-2.854-2.814a.499.499 0 00-.708 0l-8.052 8.053a1.995 1.995 0 00-.449.68l-1.716 4.33a.499.499 0 00.19.62.499.499 0 00.538.109l4.33-1.757c.255-.101.486-.254.679-.449l8.042-8.073z"
            />
        </svg>
        {{ t('elseButton2') }}
    </UiToolbarButton>
    <UiToolbarButton v-if="additional">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="UiIcon-icon-2pR-"
        >
            <path
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16zm1-9h2.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H13v2.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V13H8.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5H11V8.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5V11z"
                fill-rule="evenodd"
                clip-rule="evenodd"
            />
        </svg>
    </UiToolbarButton>
    <UiToolbarLink v-if="additional">
        {{ t('link') }}
    </UiToolbarLink>
</template>

<script lang="ts" setup>
import { UiToolbarButton, UiToolbarLink } from '@retailcrm/embed-ui-v1-components/remote'
import type { PropType } from 'vue'
import type { WidgetTarget } from '@retailcrm/embed-ui/types/widget'

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
