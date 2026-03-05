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
import { ref, watch } from 'vue'
import { UiModalSidebar, UiToolbarButton } from '@retailcrm/embed-ui-v1-components/remote'
import { useI18n } from 'vue-i18n'
import { useField, useSettingsContext as useSettings } from '@retailcrm/embed-ui'

const opened = ref(false)

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, value => i18n.locale.value = value, { immediate: true })
</script>

<style module lang="less">
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
