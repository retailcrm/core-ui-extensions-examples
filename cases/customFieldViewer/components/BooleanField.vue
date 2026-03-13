<template>
    <UiField :id="id" :label="label" :readonly="readonly">
        <template #default="{ id: fieldId }">
            <UiSwitch :id="fieldId" v-model:value="field" :disabled="readonly" />
        </template>
    </UiField>
</template>

<script lang="ts" remote setup>
import { UiField, UiSwitch } from '@retailcrm/embed-ui-v1-components/remote'

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

    readonly: {
        type: Boolean,
        default: false,
    },
})

const custom = useContext('order')
const field = useCustomField(custom, props.code, {
    kind: 'boolean',
    readonly: props.readonly,
})
</script>
