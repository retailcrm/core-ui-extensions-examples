<template>
    <div
        :id="id"
        :aria-labelledby="id + '-label'"
    >
        <label :id="id + '-label'" :class="$style['label']">
            {{ label }}
        </label>

        <div v-if="!loaded">
            ...
        </div>

        <div
            v-for="o in options"
            :key="o.code"
            :class="$style['option']"
        >
            <UiCheckbox
                v-if="descriptor && descriptor.kind == 'multiselect_dictionary'"
                :id="id + '-option-' + o.code"
                v-model:model="field"
                :value="o.code"
            />

            <UiRadio
                v-else
                :id="id + '-option-' + o.code"
                v-model:model="field"
                :value="o.code"
            />

            <label :for="id + '-option-' + o.code" :class="$style['option-label']">
                {{ o.text }}
            </label>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { CustomDictionary } from '@retailcrm/embed-ui-v1-types/context'

import {
    UiCheckbox,
    UiRadio,
} from '@retailcrm/embed-ui-v1-components/remote'

import { useContext } from '@retailcrm/embed-ui-v1-contexts/remote/custom'
import { useCustomField } from '@retailcrm/embed-ui'
import { useDictionary } from '@retailcrm/embed-ui-v1-contexts/remote/custom'

import { ref } from 'vue'

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
    kind: ['dictionary', 'multiselect_dictionary'],
})

const dictionary = useDictionary()

const options = ref<CustomDictionary>([])
const loaded = ref(false)

const descriptor = custom.schema?.fields.find(f => f.code === props.code)

if (descriptor && 'dictionaryCode' in descriptor) {
    dictionary.query(descriptor.dictionaryCode).then((result) => {
        options.value = result
        loaded.value = true
    })
} else {
    throw new Error('No dictionary for field with code ' + props.code)
}
</script>

<style lang="less" module>
.label {
  display: inline-block;
  margin-bottom: 12px;
}

.option {
  display: flex;
  align-items: center;

  & + & {
    margin-top: 12px;
  }
}

.option-label {
  display: inline-block;
  margin-left: 12px;
}
</style>
