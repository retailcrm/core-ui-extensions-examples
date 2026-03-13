<template>
    <UiField :id="id" :label="label" :readonly="readonly">
        <template #default="{ id: fieldId }">
            <UiNumberStepper
                :id="fieldId"
                v-model:value="field"
                :decimals="integer ? 0 : '*'"
                :textbox-options="{ placeholder }"
                :readonly="readonly"
                nullable
            />
        </template>
    </UiField>
</template>

<script lang="ts" remote setup>
import { UiField, UiNumberStepper } from '@retailcrm/embed-ui-v1-components/remote'

import { useContext } from '@retailcrm/embed-ui-v1-contexts/remote/custom'
import { useCustomField } from '@retailcrm/embed-ui'

const props = defineProps({
    id: {
        type: String,
        required: true,
    },

    code: {
        type: String,
        required: true,
    },

    label: {
        type: String,
        required: true,
    },

    integer: {
        type: Boolean,
        default: false,
    },

    placeholder: {
        type: String,
        default: '',
    },

    readonly: {
        type: Boolean,
        default: false,
    },
})

const custom = useContext('order')
const field = useCustomField(custom, props.code, {
    kind: ['integer', 'numeric'],
    readonly: props.readonly,
})
</script>
