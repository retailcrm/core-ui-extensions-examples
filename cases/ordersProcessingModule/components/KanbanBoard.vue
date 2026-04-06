<template>
    <div :class="$style['board-shell']">
        <section v-if="initializing && columns.length === 0" :class="$style['board']">
            <article
                v-for="column in 4"
                :key="column"
                :class="$style['column']"
            >
                <header :class="$style['column__header']">
                    <div :class="$style['column__skeleton-heading']">
                        <UiSkeleton
                            appearance="text"
                            animation="shimmer"
                            size="lg"
                            width="58%"
                        />

                        <UiSkeleton
                            appearance="text"
                            animation="shimmer"
                            size="sm"
                            width="38%"
                        />
                    </div>

                    <UiSkeleton
                        appearance="rectangle"
                        animation="shimmer"
                        height="28px"
                        width="44px"
                    />
                </header>

                <div :class="$style['cards-loading']">
                    <article
                        v-for="item in 3"
                        :key="item"
                        :class="$style['card-skeleton']"
                    >
                        <div :class="$style['card-skeleton__head']">
                            <UiSkeleton
                                appearance="rectangle"
                                animation="shimmer"
                                height="26px"
                                width="68px"
                            />

                            <UiSkeleton
                                appearance="text"
                                animation="shimmer"
                                size="sm"
                                width="52px"
                            />
                        </div>

                        <div :class="$style['card-skeleton__copy']">
                            <UiSkeleton
                                appearance="text"
                                animation="shimmer"
                                size="lg"
                                width="74%"
                            />

                            <UiSkeleton
                                appearance="text"
                                animation="shimmer"
                                size="sm"
                                width="48%"
                            />
                        </div>

                        <div :class="$style['card-skeleton__tags']">
                            <UiSkeleton
                                appearance="rectangle"
                                animation="shimmer"
                                height="24px"
                                width="96px"
                            />

                            <UiSkeleton
                                appearance="rectangle"
                                animation="shimmer"
                                height="24px"
                                width="84px"
                            />
                        </div>

                        <div :class="$style['card-skeleton__meta']">
                            <UiSkeleton
                                v-for="row in 3"
                                :key="row"
                                appearance="text"
                                animation="shimmer"
                                size="sm"
                                width="100%"
                            />
                        </div>
                    </article>
                </div>
            </article>
        </section>

        <section
            v-else
            :class="$style['board']"
        >
            <article
                v-for="column in columns"
                :key="column.id"
                :class="$style['column']"
            >
                <header
                    :class="$style['column__header']"
                    :style="{ '--column-accent': column.accent }"
                >
                    <div>
                        <h2 :class="$style['column__title']">
                            {{ column.title }}
                        </h2>

                        <p :class="$style['column__caption']">
                            {{ t('board.columnLoaded', { loaded: column.loadedCount, total: column.totalCount }) }}
                        </p>
                    </div>

                    <UiTag :background="column.accent">
                        {{ column.totalCount }}
                    </UiTag>
                </header>

                <div
                    v-if="column.loading && column.items.length === 0"
                    :class="$style['cards-loading']"
                >
                    <article
                        v-for="item in 3"
                        :key="item"
                        :class="$style['card-skeleton']"
                    >
                        <div :class="$style['card-skeleton__head']">
                            <UiSkeleton
                                appearance="rectangle"
                                animation="shimmer"
                                height="26px"
                                width="68px"
                            />

                            <UiSkeleton
                                appearance="text"
                                animation="shimmer"
                                size="sm"
                                width="52px"
                            />
                        </div>

                        <div :class="$style['card-skeleton__copy']">
                            <UiSkeleton
                                appearance="text"
                                animation="shimmer"
                                size="lg"
                                width="74%"
                            />

                            <UiSkeleton
                                appearance="text"
                                animation="shimmer"
                                size="sm"
                                width="48%"
                            />
                        </div>

                        <div :class="$style['card-skeleton__tags']">
                            <UiSkeleton
                                appearance="rectangle"
                                animation="shimmer"
                                height="24px"
                                width="96px"
                            />

                            <UiSkeleton
                                appearance="rectangle"
                                animation="shimmer"
                                height="24px"
                                width="84px"
                            />
                        </div>

                        <div :class="$style['card-skeleton__meta']">
                            <UiSkeleton
                                v-for="row in 3"
                                :key="row"
                                appearance="text"
                                animation="shimmer"
                                size="sm"
                                width="100%"
                            />
                        </div>
                    </article>
                </div>

                <RemoteSortableContainer
                    v-else
                    as="div"
                    :accepts="['order-processing-card']"
                    :class="{
                        [$style['cards']]: true,
                        [$style['cards_empty']]: column.isVisuallyEmpty,
                    }"
                    :container-id="column.id"
                    :data-empty-label="t('board.emptyDropZone')"
                    orientation="vertical"
                    @drop="emit('move', $event)"
                >
                    <RemoteSortableItem
                        v-for="(item, index) in column.items"
                        :key="item.id"
                        as="article"
                        :class="$style['order-card']"
                        :container-id="column.id"
                        :index="index"
                        :item-id="String(item.id)"
                        type="order-processing-card"
                        @dragcancel="emit('drag-cancel')"
                        @dragend="emit('drag-end')"
                        @dragstart="emit('drag-start', item, column.id)"
                    >
                        <div :class="$style['order-card__head']">
                            <RemoteDragHandle
                                as="button"
                                :class="$style['order-card__handle']"
                            >
                                {{ t('card.dragHandle') }}
                            </RemoteDragHandle>

                            <UiLink
                                :href="getOrderHref(item.id)"
                                :class="$style['order-card__number']"
                            >
                                #{{ item.number }}
                            </UiLink>
                        </div>

                        <div :class="$style['order-card__copy']">
                            <h3 :class="$style['order-card__customer']">
                                {{ item.customerName }}
                            </h3>

                            <p :class="$style['order-card__phone']">
                                {{ item.phone }}
                            </p>
                        </div>

                        <div :class="$style['order-card__tags']">
                            <UiTag :background="'#EDF4FF'">
                                {{ item.crmStatusLabel }}
                            </UiTag>

                            <UiTag :background="'#F3F4F6'">
                                {{ item.orderTypeLabel }}
                            </UiTag>
                        </div>

                        <dl :class="$style['order-card__meta']">
                            <div :class="$style['order-card__meta-row']">
                                <dt :class="$style['order-card__label']">
                                    {{ t('card.fields.amount') }}
                                </dt>

                                <dd :class="$style['order-card__value']">
                                    {{ formatCurrency(item.totalSumm) }}
                                </dd>
                            </div>

                            <div :class="$style['order-card__meta-row']">
                                <dt :class="$style['order-card__label']">
                                    {{ t('card.fields.manager') }}
                                </dt>

                                <dd :class="$style['order-card__value']">
                                    {{ item.assigneeName }}
                                </dd>
                            </div>

                            <div :class="$style['order-card__meta-row']">
                                <dt :class="$style['order-card__label']">
                                    {{ t('card.fields.createdAt') }}
                                </dt>

                                <dd :class="$style['order-card__value']">
                                    {{ formatDate(item.createdAt) }}
                                </dd>
                            </div>
                        </dl>
                    </RemoteSortableItem>
                </RemoteSortableContainer>

                <footer :class="$style['column__footer']">
                    <p
                        v-if="column.error"
                        :class="$style['column__error']"
                    >
                        {{ column.error }}
                    </p>

                    <span
                        v-if="column.loadingMore"
                        :class="$style['column__status']"
                    >
                        {{ t('board.loadingMore') }}
                    </span>

                    <span
                        v-else-if="column.loading"
                        :class="$style['column__status']"
                    >
                        {{ t('board.refreshingColumn') }}
                    </span>

                    <UiButton
                        v-else-if="column.hasMore"
                        appearance="secondary"
                        size="md"
                        @click="emit('next', column.id)"
                    >
                        {{ t('actions.loadMore') }}
                    </UiButton>

                    <span
                        v-else
                        :class="$style['column__end']"
                    >
                        {{ t('board.allCardsLoaded') }}
                    </span>
                </footer>
            </article>
        </section>
    </div>
</template>

<script lang="ts" remote setup>
import type { RemoteSortableEvent } from '@omnicajs/vue-remote/remote'

import type { ColumnView, OrderCard, ProcessingColumnId } from '../types'

import {
    RemoteDragHandle,
    RemoteSortableContainer,
    RemoteSortableItem,
} from '@omnicajs/vue-remote/remote'

import {
    UiButton,
    UiLink,
    UiSkeleton,
    UiTag,
} from '@retailcrm/embed-ui-v1-components/remote'

import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import { useRouter, useSettingsContext as useSettings } from '@retailcrm/embed-ui'

defineProps<{
    columns: ColumnView[];
    initializing: boolean;
}>()

const emit = defineEmits<{
    move: [RemoteSortableEvent];
    next: [string];
    'drag-start': [OrderCard, ProcessingColumnId];
    'drag-cancel': [];
    'drag-end': [];
}>()

const { t } = useI18n({ useScope: 'local' })

const settings = useSettings()
const locale = useField(settings, 'system.locale')
const router = useRouter()

settings.initialize()

const formatDate = (value: string) => new Intl.DateTimeFormat(locale.value || 'ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
}).format(new Date(value))

const formatCurrency = (value: number) => new Intl.NumberFormat(locale.value || 'ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
}).format(value)

const getOrderHref = (orderId: number) => {
    return router.value.generate('crm_orders_edit', { id: orderId })
}
</script>

<style lang="less" module>
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/palette.less";

.board-shell {
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    padding-bottom: @spacing-xs;
}

.board {
    display: flex;
    align-items: stretch;
    gap: @spacing-s;
    min-width: max-content;
}

.column {
    display: flex;
    flex-direction: column;
    gap: @spacing-s;
    width: 320px;
    min-height: 580px;
    padding: @spacing-s;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: @border-radius-lg;

    &:has([data-dnd-drag-over='true']) {
        border-color: @blue-400;
        box-shadow: inset 0 0 0 1px @blue-400;
    }

    &__header {
        display: flex;
        justify-content: space-between;
        gap: @spacing-xs;
        align-items: flex-start;
        padding-top: @spacing-xs;
        border-top: 4px solid var(--column-accent);
    }

    &__title {
        margin: 0;
        .text-regular-accent();
    }

    &__caption {
        margin: @spacing-xxs 0 0;
        color: #5F6B7A;
    }

    &__skeleton-heading {
        display: flex;
        flex-direction: column;
        gap: @spacing-xxs;
        width: 100%;
    }

    &__footer {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
        align-items: stretch;
        margin-top: auto;
    }

    &__error {
        margin: 0;
        color: #9F2D2D;
    }

    &__status,
    &__end {
        color: #6B7280;
        text-align: center;
    }
}

.cards {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    gap: @spacing-s;
    min-height: 240px;
    position: relative;

    &_empty {
        justify-content: center;
    }

    &_empty::after {
        content: attr(data-empty-label);
        display: flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        min-height: 100%;
        padding: @spacing-s;
        color: #6B7280;
        text-align: center;
        border: 1px dashed #D1D5DB;
        border-radius: @border-radius-lg;
        pointer-events: none;
    }
}

.cards-loading {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: @spacing-s;
    min-height: 240px;
    border: 1px dashed #D1D5DB;
    border-radius: @border-radius-lg;
    padding: @spacing-s;
}

.cards [data-dnd-placeholder='true'] {
    width: 100%;
    min-width: 0;
    justify-self: stretch;
    align-self: stretch;
    margin: 0;
    box-sizing: border-box;
    border: 1px dashed @blue-400;
    border-radius: @border-radius-lg;
    background: @blue-transparent;
}

.cards [data-dnd-placeholder='true'] > * {
    visibility: hidden;
}

.cards_empty [data-dnd-placeholder='true'] {
    position: absolute;
    inset: 0;
    visibility: hidden;
    pointer-events: none;
}

.card-skeleton {
    display: flex;
    flex-direction: column;
    gap: @spacing-s;
    width: 100%;
    padding: @spacing-s;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: @border-radius-lg;

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: @spacing-xs;
    }

    &__copy {
        display: flex;
        flex-direction: column;
        gap: @spacing-xxs;
    }

    &__tags {
        display: flex;
        gap: @spacing-xs;
    }

    &__meta {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
    }
}

.order-card {
    display: flex;
    flex-direction: column;
    gap: @spacing-s;
    padding: @spacing-s;
    background: #FFFFFF;
    border: 1px solid #D8DFEA;
    border-radius: @border-radius-lg;
    box-shadow: @drop-shadow-s;
    transition: border-color @transition, box-shadow @transition, transform @transition;

    &[data-dnd-dragging='true'] {
        opacity: 0.92;
        box-shadow: @drop-shadow-l;
    }

    &[data-dnd-source='true'] .order-card__handle {
        cursor: grabbing;
    }

    &__head {
        display: flex;
        justify-content: space-between;
        gap: @spacing-xs;
        align-items: center;
    }

    &__handle {
        padding: @spacing-xxs @spacing-xs;
        border: 1px solid #D1D5DB;
        border-radius: @border-radius-md;
        background: #F8FAFC;
        cursor: grab;
        user-select: none;
    }

    &__number {
        color: #6B7280;
    }

    &__copy {
        display: flex;
        flex-direction: column;
        gap: @spacing-xxs;
    }

    &__customer {
        margin: 0;
        .text-regular-accent();
    }

    &__phone {
        margin: 0;
        color: #5F6B7A;
    }

    &__tags {
        display: flex;
        flex-wrap: wrap;
        gap: @spacing-xs;
    }

    &__meta {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
        margin: 0;
    }

    &__meta-row {
        display: flex;
        justify-content: space-between;
        gap: @spacing-s;
        margin: 0;
    }

    &__label {
        color: #6B7280;
    }

    &__value {
        margin: 0;
        text-align: right;
        color: #111827;
    }
}

[data-dnd-overlay='true'] {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    width: var(--dnd-overlay-width);
    pointer-events: none;
    transform: translate3d(-9999px, -9999px, 0);
}

[data-dnd-overlay='true'] .order-card {
    display: flex;
    flex-direction: column;
    gap: @spacing-s;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: @spacing-s;
    box-sizing: border-box;
    background: #FFFFFF;
    border: 1px solid @blue-300;
    border-radius: @border-radius-lg;
    box-shadow: @drop-shadow-l;
    opacity: 0.96;
    transform: rotate(-2deg);
}

[data-dnd-overlay='true'] .order-card__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: @spacing-xs;
}

[data-dnd-overlay='true'] .order-card__copy,
[data-dnd-overlay='true'] .order-card__meta {
    display: flex;
    flex-direction: column;
    gap: @spacing-xxs;
}
</style>

<i18n locale="en-GB">
{
    "actions": {
        "loadMore": "Show more"
    },
    "board": {
        "columnLoaded": "{loaded} of {total}",
        "emptyDropZone": "Drop the order here",
        "loadingMore": "Loading more...",
        "refreshingColumn": "Refreshing column...",
        "allCardsLoaded": "All cards are loaded"
    },
    "card": {
        "dragHandle": "Drag",
        "fields": {
            "amount": "Amount",
            "manager": "Manager",
            "createdAt": "Created"
        }
    }
}
</i18n>

<i18n locale="es-ES">
{
    "actions": {
        "loadMore": "Mostrar más"
    },
    "board": {
        "columnLoaded": "{loaded} de {total}",
        "emptyDropZone": "Suelte aquí el pedido",
        "loadingMore": "Cargando más...",
        "refreshingColumn": "Actualizando columna...",
        "allCardsLoaded": "Todas las tarjetas están cargadas"
    },
    "card": {
        "dragHandle": "Arrastrar",
        "fields": {
            "amount": "Importe",
            "manager": "Gestor",
            "createdAt": "Creado"
        }
    }
}
</i18n>

<i18n locale="ru-RU">
{
    "actions": {
        "loadMore": "Показать ещё"
    },
    "board": {
        "columnLoaded": "{loaded} из {total}",
        "emptyDropZone": "Перетащите сюда заказ",
        "loadingMore": "Загружаем ещё...",
        "refreshingColumn": "Обновляем колонку...",
        "allCardsLoaded": "Все карточки загружены"
    },
    "card": {
        "dragHandle": "Тянуть",
        "fields": {
            "amount": "Сумма",
            "manager": "Менеджер",
            "createdAt": "Создан"
        }
    }
}
</i18n>
