<template>
    <template v-if="picked.length > 0">
        {{ t('promoIsApplied', {
            promos: picked.map(p => t('quote', { term: p.name })).join(', ')
        }) }}
    </template>

    <UiToolbarButton @click="opened = true">
        {{ t('promos') }}

        <IconLoader v-if="loading" :class="$style['icon']" />

        <template v-else>
            &nbsp;({{ promos.length }})
        </template>
    </UiToolbarButton>

    <UiModalSidebar
        v-model:opened="opened"
        :class="$style['sidebar']"
    >
        <template #title>
            {{ t('promos') }}
        </template>

        <UiLoader :class="{ [$style.hide]: !loading }" :overlay="false" />

        <div :class="{ [$style.hide]: loading }">
            <UiError
                v-for="(error, index) in errors"
                :key="index"
                :message="error"
            />

            <template v-if="errors.length === 0">
                <div
                    v-for="p in promos"
                    :key="p.code"
                    :class="$style['promo']"
                >
                    <div :class="$style['promo__name']">
                        {{ p.name }}
                    </div>

                    <div :class="$style['promo__description']">
                        {{ p.description }}
                    </div>

                    <UiButton :disabled="applying" @click="pick(p)">
                        {{ t('apply') }} <IconLoader v-if="applying" :class="$style['icon']" />
                    </UiButton>
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
import IconLoader from './loader.svg'

import {
    UiButton,
    UiError,
    UiLoader,
    UiModalSidebar,
    UiToolbarButton,
} from '@retailcrm/embed-ui-v1-components/remote'

import {
    onMounted,
    ref,
    watch,
} from 'vue'

import { useActions } from '@retailcrm/embed-ui-v1-contexts/remote/order/card'
import { useContext as useOrder } from '@retailcrm/embed-ui-v1-contexts/remote/order/card'
import { useContext as useSettings } from '@retailcrm/embed-ui-v1-contexts/remote/settings'
import { useField } from '@retailcrm/embed-ui'
import { useHost } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'

const host = useHost()
const i18n = useI18n()

const settings = useSettings()
const locale = useField(settings, 'system.locale')
watch(locale, locale => i18n.locale.value = locale, { immediate: true })

const t = i18n.t

const order = useOrder()
const orderActions = useActions()
const orderItems = useField(order, 'items')

type Promo = {
    code: string;
    name: string;
    description: string;
}

const promos = ref<Promo[]>([])
const picked = ref<Promo[]>([])
const errors = ref<string[]>([])

const opened = ref(false)
const applying = ref(false)
const loading = ref(false)

const pick = async (promo: Promo) => {
    try {
        applying.value = true

        await apply(promo)

        if (!picked.value.some(p => p.code === promo.code)) {
            picked.value.push(promo)
        }
        opened.value = false
    } finally {
        applying.value = false
    }
}

const apply = async (promo: Promo) => {
    switch (promo.code) {
        case 'gift':
            return addGift()
        case 'discount':
            return addDiscount()
        case 'third':
            return addThird()
    }
}

interface ProductFromApiV5 {
    id: number;
}

interface OfferFromApiV5 {
    id: number;
    product: ProductFromApiV5;
}

const addGift = async () => {
    const { body, status } = await host.httpCall('/offers')

    if (status === 200) {
        const data = JSON.parse(body) as { offers: OfferFromApiV5[] }
        const offers = data.offers.filter(o => !orderItems.value.some(i => {
            return i.offer?.id === o.id && i.product?.id === o.product.id
        }))

        const gift = random(offers)
        if (gift) {
            await orderActions.createItem({
                productId: gift.product.id,
                offerId: gift.id,
                priceAmount: 1,
                priceTypeCode: undefined,
                quantity: 1,
            })
        }
    } else {
        errors.value = [`Error of loading offers: ${body}, status code: ${status}`]
    }
}

function random<T>(array: T[]): T | null {
    return array[Math.floor(Math.random() * array.length)] ?? null
}

const addDiscount = async () => {
    await Promise.all(orderItems.value.map(item => {
        return orderActions.changeItemDiscount(item.index, {
            amount: undefined,
            percent: 5,
        })
    }))
}

const addThird = async () => {
    const items = orderItems.value.filter(item => item.quantity >= 2)

    await Promise.all(items.map(item => {
        return orderActions.changeItemQuantity(
            item.index,
            item.quantity + Math.floor(item.quantity / 2)
        )
    }))
}

onMounted(async () => {
    loading.value = true

    const { body, status } = await host.httpCall('/promos')

    if (status === 200) {
        const parsed = JSON.parse(body) as { promos: Promo[] }

        promos.value = parsed.promos
    } else {
        errors.value = [`Error of loading promos: ${body}, status code: ${status}`]
    }

    loading.value = false
})
</script>

<i18n locale="en-GB">
{
    "apply": "Apply",
    "promoIsApplied": "Promotions {promos} applied to order",
    "promos": "Promotions",
    "quote": "'{term}'",
    "close": "Close"
}
</i18n>

<i18n locale="es-ES">
{
    "apply": "Aplicar",
    "promoIsApplied": "Promociones {promos} aplicadas al pedido",
    "promos": "Promociones",
    "quote": "'{term}'",
    "close": "Cerrar"
}
</i18n>

<i18n locale="ru-RU">
{
    "apply": "Применить",
    "promoIsApplied": "К заказу применены акции {promos}",
    "promos": "Акции",
    "quote": "«{term}»",
    "close": "Закрыть"
}
</i18n>

<style lang="less" module>
@import (reference) "@retailcrm/embed-ui-v1-components/assets/stylesheets/layout.less";
@import (reference) "@retailcrm/embed-ui-v1-components/assets/stylesheets/palette.less";
@import (reference) "@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";

.sidebar {
  .text-small();
}

.promo {
  & + & {
    padding-top: @spacing-md;
    border-top: 1px solid @grey-500;
    margin-top: @spacing-md;
  }

  &__name {
    .text-regular();
    margin-bottom: @spacing-xs;
  }

  &__description {
    color: @grey-800;
    margin-bottom: @spacing-md;
  }
}

.icon {
  fill: currentColor;
}

.hide {
  display: none !important;
}
</style>
