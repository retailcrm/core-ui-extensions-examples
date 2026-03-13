<template>
    <UiField :id="id" :label="label" :readonly="readonly">
        <template #default="{ id: fieldId }">
            <UiLoader v-if="!loaded" />

            <UiSelect
                v-else
                :id="fieldId"
                v-model:value="field"
                filterable
                :multiple="multiple"
                :placeholder="placeholder"
                :readonly="readonly"
            >
                <UiSelectOption
                    v-for="option in options"
                    :key="option.code"
                    :value="option.code"
                    :label="option.text"
                />
            </UiSelect>
        </template>
    </UiField>
</template>

<script lang="ts" remote setup>
import type { CustomDictionary } from '@retailcrm/embed-ui-v1-types/context'

import {
    UiField,
    UiLoader,
    UiSelect,
    UiSelectOption,
} from '@retailcrm/embed-ui-v1-components/remote'

import { useContext } from '@retailcrm/embed-ui-v1-contexts/remote/custom'
import { useCustomField } from '@retailcrm/embed-ui'
import { useDictionary } from '@retailcrm/embed-ui-v1-contexts/remote/custom'

import { computed, ref } from 'vue'

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
    kind: ['dictionary', 'multiselect_dictionary'],
    readonly: props.readonly,
})

const dictionary = useDictionary()

const options = ref<CustomDictionary>([])
const loaded = ref(false)

const descriptor = custom.schema?.fields.find(f => f.code === props.code)
const multiple = computed(() => descriptor?.kind === 'multiselect_dictionary')

if (descriptor && 'dictionaryCode' in descriptor) {
    dictionary.query(descriptor.dictionaryCode).then((result) => {
        options.value = result
        loaded.value = true
    })
} else {
    throw new Error('No dictionary for field with code ' + props.code)
}
</script>
