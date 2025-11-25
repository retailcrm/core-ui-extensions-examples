<template>
    <div>
        <label :for="id" :class="$style['label']">
            {{ label }}
        </label>

        <div>
            <UiTextbox
                :id="id"
                :value="field"
                :decimals="integer ? 0 : '*'"
                :readonly="readonly"
                inputmode="decimal"
                @update:value="field = Number($event)"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { UiTextbox } from '@retailcrm/embed-ui-v1-components/remote'

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

    readonly: {
        type: Boolean,
        default: false,
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
  margin-bottom: 4px;
}
</style>
