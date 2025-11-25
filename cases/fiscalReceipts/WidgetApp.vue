<template>
    <UiToolbarButton v-if="orderNumber" @click="opened = true">
        <template v-if="count">
            {{ t('fiscalReceipts') }} ({{ count }})
        </template>

        <template v-else>
            {{ t('fiscalReceipts') }}

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
    </UiToolbarButton>

    <UiModalSidebar
        v-model:opened="opened"
        @update:opened="onSidebarOpened"
    >
        <template #title>
            {{ t('fiscalReceipts') }} ({{ count }})
        </template>

        <UiLoader :class="{ [$style['hide']]: !loading }" :overlay="false" />

        <div :class="{ [$style['hide']]: loading }">
            <UiError
                v-for="(error, index) in errors"
                :key="index"
                :message="error"
            />

            <template v-if="errors.length === 0">
                <div
                    v-for="receipt in receipts"
                    :key="receipt.id"
                    :class="$style['receipt']"
                >
                    <UiLink size="body" @click="toggleReceipt(receipt.id)">
                        {{ t('receipt') }} #{{ receipt.id }}

                        <template #icon>
                            <IconCaretUp v-if="!collapsed.includes(receipt.id)" />
                            <IconCaretDown v-else />
                        </template>
                    </UiLink>

                    <div
                        :class="{
                            [$style['hide']]: collapsed.includes(receipt.id),
                            [$style['details']]: true
                        }"
                    >
                        <template v-for="(label, key) in labels" :key="key">
                            <div :class="$style['receipt__label']">
                                {{ label() }}
                            </div>

                            <div v-if="key === 'onlinePayment'" :class="$style['receipt__value']">
                                {{ receipt.details.onlinePayment ? t('yes') : t('no') }}
                            </div>

                            <div v-else-if="key === 'receiptTime'" :class="$style['receipt__value']">
                                <UiDate :date="receipt.details.receiptTime" with-time />
                            </div>

                            <div v-else :class="$style['receipt__value']">
                                {{ receipt.details[key as keyof ReceiptDetails] }}

                                <UiCopyButton :class="$style['receipt__copy']" :text="String(receipt.details[key as keyof ReceiptDetails])">
                                    <template #hint>
                                        {{ t('copy') }}
                                    </template>

                                    <template #hint-copied>
                                        {{ t('copied') }}
                                    </template>
                                </UiCopyButton>
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </div>

        <template #footer>
            <UiButton appearance="secondary" @click="opened = false">
                {{ t('close') }}
            </UiButton>
        </template>
    </UiModalSidebar>
</template>

<script lang="ts" setup>
import {
    UiButton,
    UiCopyButton,
    UiDate,
    UiLink,
    UiLoader,
    UiError,
    UiModalSidebar,
    UiToolbarButton,
} from '@retailcrm/embed-ui-v1-components/remote'

import IconCaretDown from '@retailcrm/embed-ui-v1-components/assets/sprites/arrows/caret-down.svg'
import IconCaretUp from '@retailcrm/embed-ui-v1-components/assets/sprites/arrows/caret-up.svg'

import {
    onMounted,
    ref,
    watch,
} from 'vue'

import { useI18n } from 'vue-i18n'

import { useOrderCardContext as useOrder } from '@retailcrm/embed-ui'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'

import {
    useHost,
    useField,
} from '@retailcrm/embed-ui'

type ReceiptDetails = {
  receiptTime: string;
  shiftNumber: number;
  machineNumber: string;
  taxSystem: string;
  onlinePayment: boolean;
  fnNumber: string;
  kktRegistrationNumber: string;
  fdNumber: number;
  fpd: number;
  ffdVersion: string;
}

// set locale
const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

// order fields
const context = useOrder()
const orderNumber = useField(context, 'number')

context.initialize()

// host for http calls
const host = useHost()

// data
const opened = ref(false)
const loading = ref(false)
const count = ref('')
const receipts = ref<Array<{ id: string; details: ReceiptDetails }>>([])
const errors = ref<string[]>([])
const collapsed = ref<string[]>([])

const labels = {
    receiptTime: () => t('receiptTime'),
    shiftNumber: () => t('shiftNumber'),
    machineNumber: () => t('machineNumber'),
    taxSystem: () => t('taxSystem'),
    onlinePayment: () => t('onlinePayment'),
    fnNumber: () => t('fnNumber'),
    kktRegistrationNumber: () => t('kktRegistrationNumber'),
    fdNumber: () => t('fdNumber'),
    fpd: () => t('fpd'),
    ffdVersion: () => t('ffdVersion'),
} as {
    [K in keyof ReceiptDetails]: () => string;
}

const toggleReceipt = (id: string) => {
    if (collapsed.value.includes(id)) {
        collapsed.value.splice(collapsed.value.findIndex(i => i === id), 1)
    } else {
        collapsed.value.push(id)
    }
}

const onSidebarOpened = async (opened: boolean) => {
    if (!opened) {
        return
    }

    loading.value = true

    const { body, status } = await host.httpCall('/receipts', { order_number: orderNumber.value })
    if (status === 200) {
        receipts.value = JSON.parse(body).receipts as Array<{ id: string; details: ReceiptDetails }>
    } else {
        errors.value = ['Error of loading: ' + body]
    }

    loading.value = false
}

onMounted(async () => {
    loading.value = true

    const { body, status } = await host.httpCall('/receipts-count')

    count.value = status === 200
        ? JSON.parse(body).count.toString()
        : 'ERR#' + status;

    loading.value = false
})
</script>

<i18n locale="en-GB">
{
    "copied": "Copied",
    "copy": "Copy",
    "fiscalReceipts": "Fiscal receipts",
    "receipt": "Receipt",
    "yes": "Yes",
    "no": "No",
    "close": "Close",
    "receiptTime": "Receipt Time",
    "shiftNumber": "Shift Number",
    "machineNumber": "Machine Number",
    "taxSystem": "Applied Tax System",
    "onlinePayment": "Internet Payment Indicator",
    "fnNumber": "FN Number",
    "kktRegistrationNumber": "KKT Registration Number",
    "fdNumber": "FD Number",
    "fpd": "FPD",
    "ffdVersion": "FFD Version"
}
</i18n>

<i18n locale="es-ES">
{
    "copied": "Pegado",
    "copy": "Copiar",
    "fiscalReceipts": "Recibos fiscales",
    "receipt": "Recibo",
    "yes": "Sí",
    "no": "No",
    "close": "Cerrar",
    "receiptTime": "Hora del Recibo",
    "shiftNumber": "Número de Turno",
    "machineNumber": "Número de Máquina",
    "taxSystem": "Sistema Fiscal Aplicado",
    "onlinePayment": "Indicador de Pago en Línea",
    "fnNumber": "Número FN",
    "kktRegistrationNumber": "Número de Registro de KKT",
    "fdNumber": "Número FD",
    "fpd": "FPD",
    "ffdVersion": "Versión FFD"
}
</i18n>

<i18n locale="ru-RU">
{
    "copied": "Скопировано",
    "copy": "Скопировать",
    "fiscalReceipts": "Фискальные чеки",
    "receipt": "Чек",
    "yes": "Да",
    "no": "Нет",
    "close": "Закрыть",
    "receiptTime": "Приход",
    "shiftNumber": "Смена",
    "machineNumber": "Номер автомата",
    "taxSystem": "Применяемая система налогообложения",
    "onlinePayment": "Признак расчетов в сети Интернет",
    "fnNumber": "N ФН",
    "kktRegistrationNumber": "Регистрационный номер ККТ",
    "fdNumber": "N ФД",
    "fpd": "ФПД",
    "ffdVersion": "Версия ФФД"
}
</i18n>

<style lang="less" module>
@import (reference) '~@retailcrm/embed-ui-v1-components/assets/stylesheets/palette';
@import (reference) '~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography';

.hide {
    display: none !important;
}

.receipt {
    color: @grey-800;
    font-family: @font-family;

    &:not(:last-child) {
        margin-bottom: 16px;
    }

    &__label {
        .text-tiny-accent();
    }

    &__value {
        .text-tiny();
    }

    &__copy {
        top: -4px;
    }
}

.details {
    margin-top: 8px;
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-row-gap: 8px;
    grid-column-gap: 4px;
}
</style>
