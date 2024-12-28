<template>
    <div>
        <label :for="id" :class="$style['label']">
            {{ label }}
        </label>

        <div>
            <TextInput
                :id="id"
                :value="field"
                @update:value="field = Number($event)"
            />
        </div>
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
})

const custom = useContext('order')
const field = useCustomField(custom, props.code, {
    kind: ['integer', 'numeric'],
})
</script>

<style lang="less" module>
.label {
  display: inline-block;
  margin-bottom: 8px;
}
</style>
