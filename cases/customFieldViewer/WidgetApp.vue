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
                <BooleanField
                    v-if="f.kind === 'boolean'"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="getFieldLabel(f.kind, f.readonly)"
                    :class="$style['field']"
                    :readonly="f.readonly"
                />

                <DateField
                    v-else-if="f.kind === 'date'"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="getFieldLabel(f.kind, f.readonly)"
                    :placeholder="getFieldPlaceholder(f.kind, f.readonly)"
                    :class="$style['field']"
                    :readonly="f.readonly"
                />

                <DateTimeField
                    v-else-if="f.kind === 'datetime'"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="getFieldLabel(f.kind, f.readonly)"
                    :placeholder="getFieldPlaceholder(f.kind, f.readonly)"
                    :class="$style['field']"
                    :readonly="f.readonly"
                />

                <DictionaryField
                    v-else-if="['dictionary', 'multiselect_dictionary'].includes(f.kind)"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="getFieldLabel(f.kind, f.readonly)"
                    :placeholder="getFieldPlaceholder(f.kind, f.readonly)"
                    :class="$style['field']"
                    :readonly="f.readonly"
                />

                <TextField
                    v-else-if="['email', 'string', 'text'].includes(f.kind)"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="getFieldLabel(f.kind, f.readonly)"
                    :multiline="f.kind === 'text'"
                    :placeholder="getFieldPlaceholder(f.kind, f.readonly)"
                    :class="$style['field']"
                    :readonly="f.readonly"
                />

                <NumberField
                    v-else-if="['integer', 'numeric'].includes(f.kind)"
                    :id="uid + '-field-' + f.code"
                    :code="f.code"
                    :label="getFieldLabel(f.kind, f.readonly)"
                    :class="$style['field']"
                    :integer="f.kind === 'integer'"
                    :placeholder="getFieldPlaceholder(f.kind, f.readonly)"
                    :readonly="f.readonly"
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

<script lang="ts" remote setup>
import {
    UiButton,
    UiModalSidebar,
    UiRadio,
    UiToolbarLink,
} from '@retailcrm/embed-ui-v1-components/remote'

import { ref } from 'vue'
import { useContext } from '@retailcrm/embed-ui-v1-contexts/remote/custom'
import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { watch } from 'vue'

import { v4 } from 'uuid'

import BooleanField from './components/BooleanField.vue'
import DateField from './components/DateField.vue'
import DateTimeField from './components/DateTimeField.vue'
import DictionaryField from './components/DictionaryField.vue'
import NumberField from './components/NumberField.vue'
import TextField from './components/TextField.vue'

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

function getFieldLabel(kind: string, readonly: boolean): string {
    if (readonly) {
        return t('currentValue')
    }

    if (kind === 'boolean') {
        return t('toggle')
    }

    return t('setValue')
}

function getFieldPlaceholder(kind: string, readonly: boolean): string {
    if (readonly) {
        return t('emptyValue')
    }

    if (kind === 'email') {
        return t('enterEmail')
    }

    if (['integer', 'numeric'].includes(kind)) {
        return t('enterNumber')
    }

    if (['date', 'datetime'].includes(kind)) {
        return t('selectDate')
    }

    if (['dictionary', 'multiselect_dictionary'].includes(kind)) {
        return t('selectValue')
    }

    return t('enterValue')
}
</script>

<i18n locale="en-GB">
{
    "customFields": "Campos personalizados",
    "open": "Open custom field viewer",
    "close": "Close",
    "setValue": "Set a new value",
    "currentValue": "Current value",
    "toggle": "Toggle",
    "emptyValue": "Value is empty",
    "enterValue": "Enter value",
    "enterEmail": "Enter email",
    "enterNumber": "Enter number",
    "selectDate": "Select date",
    "selectValue": "Select value"
}
</i18n>

<i18n locale="es-ES">
{
    "customFields": "Пользовательские поля",
    "open": "Abrir visor de campo personalizado",
    "close": "Cerrar",
    "setValue": "Establecer un nuevo valor",
    "currentValue": "Valor actual",
    "toggle": "Alternar",
    "emptyValue": "El valor esta vacio",
    "enterValue": "Introduzca un valor",
    "enterEmail": "Introduzca un email",
    "enterNumber": "Introduzca un numero",
    "selectDate": "Seleccione una fecha",
    "selectValue": "Seleccione un valor"
}
</i18n>

<i18n locale="ru-RU">
{
    "customFields": "Пользовательские поля",
    "open": "Открыть просмотрщик пользовательских полей",
    "close": "Закрыть",
    "setValue": "Задать новое значение",
    "currentValue": "Текущее значение",
    "toggle": "Переключить",
    "emptyValue": "Значение пусто",
    "enterValue": "Введите значение",
    "enterEmail": "Введите email",
    "enterNumber": "Введите число",
    "selectDate": "Выберите дату",
    "selectValue": "Выберите значение"
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
