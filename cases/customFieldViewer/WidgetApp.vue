<template>
    <UiToolbarLink @click="open = true">
        {{ t('open') }}
    </UiToolbarLink>

    <UiModalSidebar v-model:opened="open" direction="left">
        <template #title>
            {{ t('customFields') }}
        </template>

        <div v-for="f in schema.fields" :key="f.code" :class="$style['row']">
            <div>
                <UiRadio
                    :id="uid + '-option-' + f.code"
                    v-model:model="code"
                    :value="f.code"
                />

                <label :for="uid + '-option-' + f.code" :class="$style['label']">
                    {{ f.code }} ({{ f.kind }})
                </label>
            </div>

            <template v-if="f.code === code">
                <div
                    v-if="f.readonly"
                    v-text="JSON.stringify(custom.values[f.code])"
                />

                <BooleanField
                    v-else-if="f.kind === 'boolean'"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="t('toggle')"
                    :class="$style['field']"
                />

                <DateField
                    v-else-if="f.kind === 'date'"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="t('setValue')"
                    :class="$style['field']"
                />

                <DateTimeField
                    v-else-if="f.kind === 'datetime'"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="t('setValue')"
                    :class="$style['field']"
                />

                <DictionaryField
                    v-else-if="['dictionary', 'multiselect_dictionary'].includes(f.kind)"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="t('setValue')"
                    :class="$style['field']"
                />

                <TextField
                    v-else-if="['email', 'string', 'text'].includes(f.kind)"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="t('setValue')"
                    :multiline="f.kind === 'text'"
                    :class="$style['field']"
                />

                <NumberField
                    v-else-if="['integer', 'numeric'].includes(f.kind)"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="t('setValue')"
                    :class="$style['field']"
                />
            </template>
        </div>

        <template #footer>
            <UiButton appearance="secondary" @click="open = false">
                {{ t('close') }}
            </UiButton>
        </template>
    </UiModalSidebar>
</template>

<script lang="ts" setup>
import {
    UiButton,
    UiModalSidebar,
    UiRadio,
    UiToolbarLink,
} from '@retailcrm/embed-ui-v1-components/remote'

import BooleanField from './components/BooleanField.vue'
import DateField from './components/DateField.vue'
import DateTimeField from './components/DateTimeField.vue'
import DictionaryField from './components/DictionaryField.vue'
import NumberField from './components/NumberField.vue'
import TextField from './components/TextField.vue'

import { ref, watch } from 'vue'

import { useContext } from '@retailcrm/embed-ui-v1-contexts/remote/custom'
import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'

import { v4 } from 'uuid'

const uid = 'id-' + v4()

const open = ref(false)

const settings = useSettings()

const i18n = useI18n()
const t = i18n.t

const locale = useField(settings, 'system.locale')

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

const custom = useContext('order')
const schema = custom.schema
if (!schema) {
    throw new Error('No custom schema for order')
}

const code = ref('')
</script>

<i18n locale="en-GB">
{
    "customFields": "Campos personalizados",
    "open": "Open custom field viewer",
    "close": "Close",
    "setValue": "Set a new value",
    "toggle": "Toggle"
}
</i18n>

<i18n locale="es-ES">
{
    "customFields": "Пользовательские поля",
    "open": "Abrir visor de campo personalizado",
    "close": "Cerrar",
    "setValue": "Establecer un nuevo valor",
    "toggle": "Alternar"
}
</i18n>

<i18n locale="ru-RU">
{
    "customFields": "Пользовательские поля",
    "open": "Открыть просмотрщик пользовательских полей",
    "close": "Закрыть",
    "setValue": "Задать новое значение",
    "toggle": "Переключить"
}
</i18n>

<style lang="less" module>
.field,
.row {
    margin-bottom: 16px;
}

.field {
    padding-left: 20px + 8px;
}

.label {
    margin-left: 8px;
}
</style>