<template>
    <UiToolbarButton
        v-if="visible"
        @click="setData"
    >
        {{ t('addFromTheCompany', { company: data?.name }) }}
    </UiToolbarButton>
</template>

<script lang="ts" setup>
import { UiToolbarButton } from '@retailcrm/embed-ui-v1-components/remote'

import { useOrderCardContext as useOrder } from '@retailcrm/embed-ui'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'

import {
    useHost,
    useField,
} from '@retailcrm/embed-ui'

import { useI18n } from 'vue-i18n'

import { ref, watch } from 'vue'

import debounce from 'lodash/debounce'

type CompanyData = {
    name: string;
    bank: string;
    bankAccount: string;
    bankAddress: string;
    legalName: string;
    legalAddress: string;
    corrAccount: string;
    INN: string;
    OKPO: string;
    BIK: string;
}

// set locale
const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

const host = useHost()

const visible = ref(false)
const data = ref<CompanyData | null>(null)

const order = useOrder()

const companyName = useField(order, 'company.name')
const companyBank = useField(order, 'company.bank')
const companyBankAccount = useField(order, 'company.bankAccount')
const companyBankAddress = useField(order, 'company.bankAddress')
const companyLegalName = useField(order, 'company.legalName')
const companyLegalAddress = useField(order, 'company.legalAddress')
const companyCorrAccount = useField(order, 'company.corrAccount')
const companyINN = useField(order, 'company.INN')
const companyOKPO = useField(order, 'company.OKPO')
const companyBIK = useField(order, 'company.BIK')

order.initialize()

const setData = () => {
    if (!data.value) {
        return
    }

    companyName.value = data.value?.name
    companyBank.value = data.value?.bank
    companyBankAccount.value = data.value?.bankAccount
    companyBankAddress.value = data.value?.bankAddress
    companyLegalName.value = data.value?.legalName
    companyLegalAddress.value = data.value?.legalAddress
    companyCorrAccount.value = data.value?.corrAccount
    companyINN.value = data.value?.INN
    companyOKPO.value = data.value?.OKPO
    companyBIK.value = data.value?.BIK

    visible.value = false
}

const search = debounce(async (inn: string | null) => {
    const { body, status } = await host.httpCall<CompanyData>('/customer/by-inn', {
        inn,
    })

    if (status === 200) {
        data.value = JSON.parse(body).data as CompanyData
        visible.value = true
    }
}, 300)

watch(companyINN, (val) => search(val), { immediate: true })
</script>

<i18n locale="en-GB">
{
    "addFromTheCompany": "Add from the company {company}"
}
</i18n>

<i18n locale="es-ES">
{
    "addFromTheCompany": "Agregar de la empresa {company}"
}
</i18n>

<i18n locale="ru-RU">
{
    "addFromTheCompany": "Дополнить из компании {company}"
}
</i18n>