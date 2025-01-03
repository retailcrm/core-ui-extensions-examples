<template>
    <input
        v-if="!multiline"
        type="text"
        :value="value"
        v-bind="$attrs"
        @input="onInput"
    />

    <textarea
        v-else
        :value="value"
        v-bind="$attrs"
        @input="onInput"
    />
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'

import { onSerializedEvent } from '../serialized'

defineProps({
    value: {
        type: null as unknown as PropType<number | string | null>,
        required: true,
    },

    multiline: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:value'])

const onInput = onSerializedEvent<InputEvent>(event => {
    emit('update:value', event.target.value)
})
</script>
