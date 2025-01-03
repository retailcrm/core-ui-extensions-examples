<template>
    <div>
        <label :for="id" :class="$style['label']">
            {{ label }}
        </label>

        <div>
            <TextInput :id="id" v-model:value="raw" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import TextInput from './TextInput.vue'

import { ref, watch } from 'vue'

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
const field = useCustomField(custom, props.code, { kind: 'date' })
const raw = ref(field.value)

watch(field, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        raw.value = newValue
    }
})

watch(raw, raw => {
    if (!isNaN(Date.parse(raw ?? ''))) {
        field.value = raw
    }
})
</script>

<style lang="less" module>
.label {
  display: inline-block;
  margin-bottom: 8px;
}
</style>