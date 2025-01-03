<template>
    <div>
        <UiCheckbox
            :id="id"
            v-model:model="field"
        />

        <label :for="id" :class="$style['label']">
            {{ label }}
        </label>
    </div>
</template>

<script lang="ts" setup>
import { UiCheckbox } from '@retailcrm/embed-ui-v1-components/remote'

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
    kind: 'boolean',
})
</script>

<style lang="less" module>
.label {
  margin-left: 8px;
}
</style>