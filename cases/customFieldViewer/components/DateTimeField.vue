<template>
    <UiField :id="id" :label="label">
        <template #default="{ id: fieldId }">
            <div :class="$style['inputs']">
                <UiDatePicker :id="fieldId + '-date'" v-model:value="dateValue" nullable />
                <UiTimePicker
                    :id="fieldId + '-time'"
                    v-model:value="timeValue"
                    :disabled="!dateValue"
                />
            </div>
        </template>
    </UiField>
</template>

<script lang="ts" remote setup>
import { UiDatePicker } from '@retailcrm/embed-ui-v1-components/remote'
import { UiField } from '@retailcrm/embed-ui-v1-components/remote'
import { UiTimePicker } from '@retailcrm/embed-ui-v1-components/remote'

import { ref } from 'vue'
import { useContext } from '@retailcrm/embed-ui-v1-contexts/remote/custom'
import { useCustomField } from '@retailcrm/embed-ui'
import { watch } from 'vue'

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
const field = useCustomField(custom, props.code, { kind: 'datetime' })
const dateValue = ref(extractDate(field.value))
const timeValue = ref(extractTime(field.value))

watch(field, value => {
    dateValue.value = extractDate(value)
    timeValue.value = extractTime(value)
})

watch([dateValue, timeValue], ([date, time]) => {
    field.value = buildDateTime(date, time)
})

function buildDateTime(date: Date | null, time: string): string | null {
    if (!date) {
        return null
    }

    const [hours, minutes] = parseTime(time)
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes
    ).toISOString()
}

function extractDate(value: unknown): Date | null {
    const parsed = parseDateTime(value)
    if (!parsed) {
        return null
    }

    return new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate()
    )
}

function extractTime(value: unknown): string {
    const parsed = parseDateTime(value)
    if (!parsed) {
        return ''
    }

    const hours = String(parsed.getHours()).padStart(2, '0')
    const minutes = String(parsed.getMinutes()).padStart(2, '0')

    return `${hours}:${minutes}`
}

function parseDateTime(value: unknown): Date | null {
    if (typeof value !== 'string' || !value) {
        return null
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }

    return parsed
}

function parseTime(value: string): [number, number] {
    const match = /^(\d{2}):(\d{2})$/.exec(value)
    if (!match) {
        return [0, 0]
    }

    return [Number(match[1]), Number(match[2])]
}
</script>

<style lang="less" module>
.inputs {
    display: grid;
    gap: 8px;
}
</style>
