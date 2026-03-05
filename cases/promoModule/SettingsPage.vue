<template>
    <section :class="$style.page">
        <h1 :class="$style.title">
            {{ t('settingsTitle') }}
        </h1>
        <div :class="$style.body" />
    </section>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useField, useSettingsContext as useSettings } from '@retailcrm/embed-ui'

defineProps<{ code: string }>()

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, value => i18n.locale.value = value, { immediate: true })
</script>

<style module lang="less">
.page {
  padding: 16px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px;
}

.body {
  min-height: 160px;
}
</style>

<i18n locale="en-GB">
{
    "settingsTitle": "Settings"
}
</i18n>

<i18n locale="ru-RU">
{
    "settingsTitle": "Настройки"
}
</i18n>
