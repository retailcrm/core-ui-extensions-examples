<template>
    <div>
        <div>
            <label :for="id">{{ label }}</label>
        </div>

        <TextInput
            :id="id"
            v-model:value="field"
            :multiline="multiline"
        />
    </div>
</template>

<script lang="ts" setup>
import TextInput from './TextInput.vue'

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
