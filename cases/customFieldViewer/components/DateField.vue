<template>
    <UiField :id="id" :label="label" :readonly="readonly">
        <template #default="{ id: fieldId }">
            <UiDatePicker
                :id="fieldId"
                v-model:value="model"
                nullable
                :placeholder="placeholder"
                :readonly="readonly"
            />
        </template>
    </UiField>
</template>

<script lang="ts" remote setup>
import { UiDatePicker, UiField } from '@retailcrm/embed-ui-v1-components/remote'

import { computed } from 'vue'
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
const readonlyField = useCustomField(custom, props.code, {
    kind: 'date',
    readonly: true,
})
const writableField = useCustomField(custom, props.code, { kind: 'date' })
const field = computed<string | null>({
    get: () => props.readonly ? readonlyField.value : writableField.value,
    set: value => {
        if (props.readonly) {
            return
        }

        writableField.value = value
    },
})

const model = computed<Date | null>({
    get: () => parseDate(field.value),
    set: value => field.value = value ? formatDate(value) : null,
})

function formatDate(value: Date): string {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function parseDate(value: unknown): Date | null {
    if (typeof value !== 'string') {
        return null
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) {
        return null
    }

    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])

    return new Date(year, month, day)
}
</script>
