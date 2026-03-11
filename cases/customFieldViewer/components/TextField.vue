<template>
    <UiField :id="id" :label="label">
        <template #default="{ id: fieldId }">
            <UiTextbox
                :id="fieldId"
                v-model:value="field"
                :multiline="multiline"
            />
        </template>
    </UiField>
</template>

<script lang="ts" remote setup>
import { UiField, UiTextbox } from '@retailcrm/embed-ui-v1-components/remote'

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

    multiline: {
        type: Boolean,
        default: false,
    },
})

const custom = useContext('order')
const field = useCustomField(custom, props.code, {
    kind: ['email', 'string', 'text'],
})
</script>
