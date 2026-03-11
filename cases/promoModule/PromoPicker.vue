<template>
    <UiToolbarButton @click="opened = true">
        {{ t('promos') }}
    </UiToolbarButton>

    <UiModalSidebar v-model:opened="opened">
        <template #title>
            {{ t('promos') }}
        </template>

        <div :class="$style.body" />
    </UiModalSidebar>
</template>

<script lang="ts" setup>
import { UiModalSidebar } from '@retailcrm/embed-ui-v1-components/remote'
import { UiToolbarButton } from '@retailcrm/embed-ui-v1-components/remote'

import { ref } from 'vue'
import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { watch } from 'vue'

const opened = ref(false)

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, value => i18n.locale.value = value, { immediate: true })
</script>

<style lang="less" module>
.body {
    min-height: 120px;
}
</style>

<i18n locale="en-GB">
{
    "promos": "Promotions"
}
</i18n>

<i18n locale="ru-RU">
{
    "promos": "Акции"
}
</i18n>
