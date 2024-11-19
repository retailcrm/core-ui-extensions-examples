<template>
    <UiButton appearance="secondary" @click="opened = true">
        <template v-if="count">
            Фискальные чеки ({{ count }})
        </template>

        <template v-else>
            Фискальные чеки

            <!-- Анимации SVG пока не поддерживаются при выносе svg в отдельный файл -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 128 128"
                style="padding: 2px;"
            >
                <g transform="matrix(-1 0 0 1 128 0)">
                    <circle cx="16" cy="64" r="13" />
                    <circle cx="16" cy="64" r="11.344" transform="rotate(45 64 64)" />
                    <circle cx="16" cy="64" r="9.531" transform="rotate(90 64 64)" />
                    <circle cx="16" cy="64" r="7.75" transform="rotate(135 64 64)" />
                    <circle cx="16" cy="64" r="7.063" transform="rotate(180 64 64)" />
                    <circle cx="16" cy="64" r="5.063" transform="rotate(225 64 64)" />
                    <circle cx="16" cy="64" r="4.438" transform="rotate(270 64 64)" />
                    <circle cx="16" cy="64" r="3.375" transform="rotate(315 64 64)" />
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 64 64;315 64 64;270 64 64;225 64 64;180 64 64;135 64 64;90 64 64;45 64 64;"
                        calcMode="discrete"
                        dur="960ms"
                        repeatCount="indefinite"
                    />
                </g>
            </svg>
        </template>
    </UiButton>

    <UiModalSidebar
        v-model:opened="opened"
        @update:opened="onSidebarOpened"
    >
        <template #title>
            Фискальные чеки ({{ count }})
        </template>

        <UiLoader :class="{ [$style.hide]: !loading }" :overlay="false" />

        <div :class="{ [$style.hide]: loading }">
            <UiError
                v-if="errors.length"
                v-for="(error, index) in errors"
                :key="index"
                :message="error"
            />

            <div
                v-else
                v-for="receipt in receipts"
                :key="receipt.id"
                :class="$style.receipt"
            >
                <UiLink size="body" @click="toggleReceipt(receipt.id)">
                    Чек #{{ receipt.id }}

                    <template #icon>
                        <IconCaretUp v-if="!collapsed.includes(receipt.id)" />
                        <IconCaretDown v-else />
                    </template>
                </UiLink>

                <div
                    :class="{
                        [$style.hide]: !!collapsed.includes(receipt.id),
                        [$style.details]: true
                    }"
                >
                    <template v-for="(label, key) in details" :key="key">
                        <div
                            :class="$style.muted"
                            class="omnica-text omnica-text_tiny omnica-text_accent"
                        >
                            {{ label }}
                        </div>

                        <div class="omnica-text omnica-text_tiny">
                            {{ key === 'onlinePayment' ? (receipt.details[key] ? 'Да' : 'Нет') : receipt.details[key] }}
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <template #footer>
            <UiButton appearance="secondary" @click="opened = false">
                Закрыть
            </UiButton>
        </template>
    </UiModalSidebar>
</template>

<script lang="ts" setup>
import { useHost } from '@retailcrm/embed-ui'

import {
    UiButton,
    UiLink,
    UiLoader,
    UiError,
    UiModalSidebar,
} from '@/components'

import IconCaretDown from './assets/caret-down.svg'
import IconCaretUp from './assets/caret-up.svg'

import { onMounted, ref } from 'vue'

const host = useHost()

const opened = ref(false)
const loading = ref(false)
const count = ref('')
const receipts = ref([])
const errors = ref<string[]>([])
const collapsed = ref<number[]>([])

const details = {
    receiptTime: 'Приход',
    shiftNumber: 'Смена',
    machineNumber: 'Номер автомата',
    taxSystem: 'Применяемая система налогообложения',
    onlinePayment: 'Признак расчетов в сети Интернет',
    fnNumber: 'N ФН',
    kktRegistrationNumber: 'Регистрационный номер ККТ',
    fdNumber: 'N ФД',
    fpd: 'ФПД',
    ffdVersion: 'Версия ФФД',
}

const toggleReceipt = (id: number) => {
    const isCollapsed = collapsed.value.includes(id)

    if (isCollapsed) {
        const index = collapsed.value.findIndex(i => i === id)

        collapsed.value.splice(index, 1);
    } else {
        collapsed.value.push(id)
    }
}

const onSidebarOpened = async (opened: boolean) => {
    if (!opened) {
        return
    }

    loading.value = true

    const { body, status } = await host.httpCall('/receipts', { order_id: 1 })
    if (status === 200) {
        receipts.value = JSON.parse(body).receipts
    } else {
        errors.value = ["Error of loading: " + body]
    }

    loading.value = false
}

onMounted(async () => {
    loading.value = true

    const { body, status } = await host.httpCall('/receipts-count')
    if (status === 200) {
        count.value = JSON.parse(body).count.toString()
    } else {
        count.value = 'ERR#' + status
    }

    loading.value = false
})
</script>

<style lang="less" module>
.hide {
    display: none !important;
}

.receipt {
    &:not(:last-child) {
        margin-bottom: 16px;
    }
}

.details {
    margin-top: 8px;
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-row-gap: 8px;
    grid-column-gap: 4px;
}

.muted {
    color: #8A96A6;
}
</style>
