<template>
    <section :class="$style['promo-settings']">
        <header :class="$style['promo-settings__header']">
            <div>
                <h2 :class="$style['promo-settings__title']">
                    {{ t('title') }}
                </h2>

                <p :class="$style['promo-settings__subtitle']">
                    {{ t('subtitle') }}
                </p>
            </div>

            <div :class="$style['promo-settings__header-actions']">
                <UiTag :class="$style['promo-settings__status-tag']" background="#E0F2FE">
                    {{ t('status.draft') }}
                </UiTag>
                <UiButton appearance="primary">
                    {{ t('actions.save') }}
                </UiButton>
                <UiButton appearance="outlined">
                    {{ t('actions.preview') }}
                </UiButton>
            </div>
        </header>

        <UiAlert :class="$style['promo-settings__alert']" variant="warning" :text="t('alerts.draft')" />

        <div :class="$style['promo-settings__layout']">
            <div :class="$style['promo-settings__main']">
                <section :class="$style['promo-settings__card']">
                    <div :class="$style['promo-settings__card-header']">
                        <h2 :class="$style['promo-settings__card-title']">
                            {{ t('sections.general') }}
                        </h2>

                        <UiLink appearance="title" :class="$style['promo-settings__card-link']">
                            {{ t('links.docs') }}
                        </UiLink>
                    </div>

                    <div :class="$style['promo-settings__form-grid']">
                        <UiField id="promo-name" :label="t('fields.name')" required>
                            <UiTextbox
                                id="promo-name"
                                v-model:value="promoName"
                                :placeholder="t('placeholders.name')"
                                :class="$style['promo-settings__control']"
                            />
                        </UiField>

                        <UiField id="promo-code" :label="t('fields.code')" :hint="t('hints.code')">
                            <UiTextbox
                                id="promo-code"
                                v-model:value="promoCode"
                                :class="$style['promo-settings__control']"
                            />
                        </UiField>

                        <UiField id="promo-status" :label="t('fields.status')">
                            <UiSelect
                                id="promo-status"
                                v-model:value="status"
                                :class="$style['promo-settings__control']"
                            >
                                <UiSelectOption value="draft" :label="t('status.draft')" />
                                <UiSelectOption value="active" :label="t('status.active')" />
                                <UiSelectOption value="paused" :label="t('status.paused')" />
                            </UiSelect>
                        </UiField>

                        <UiField id="promo-owner" :label="t('fields.owner')">
                            <UiSelect
                                id="promo-owner"
                                v-model:value="owner"
                                :class="$style['promo-settings__control']"
                            >
                                <UiSelectOption value="marketing" :label="t('owners.marketing')" />
                                <UiSelectOption value="sales" :label="t('owners.sales')" />
                                <UiSelectOption value="team" :label="t('owners.team')" />
                            </UiSelect>
                        </UiField>

                        <UiField id="promo-channel" :label="t('fields.channel')">
                            <UiSelect
                                id="promo-channel"
                                v-model:value="channel"
                                :class="$style['promo-settings__control']"
                            >
                                <UiSelectOption value="omni" :label="t('channels.omni')" />
                                <UiSelectOption value="web" :label="t('channels.web')" />
                                <UiSelectOption value="retail" :label="t('channels.retail')" />
                            </UiSelect>
                        </UiField>

                        <UiField id="promo-active" :label="t('fields.active')" :interactive="false">
                            <div :class="$style['promo-settings__switch-row']">
                                <UiSwitch
                                    id="promo-active-switch"
                                    v-model:value="isActive"
                                />
                                <label :class="$style['promo-settings__switch-label']" for="promo-active-switch">
                                    {{ isActive ? t('states.active') : t('states.inactive') }}
                                </label>
                            </div>
                        </UiField>

                        <UiField id="promo-description" :label="t('fields.description')" :class="$style['promo-settings__field--wide']">
                            <UiTextbox
                                id="promo-description"
                                v-model:value="description"
                                multiline
                                rows="3"
                                :placeholder="t('placeholders.description')"
                                :class="[
                                    $style['promo-settings__control'],
                                    $style['promo-settings__control--multiline']
                                ]"
                            />
                        </UiField>
                    </div>
                </section>

                <section :class="$style['promo-settings__card']">
                    <div :class="$style['promo-settings__card-header']">
                        <h2 :class="$style['promo-settings__card-title']">
                            {{ t('sections.rules') }}
                        </h2>
                        <UiTag background="#DBEAFE">
                            {{ t('tags.policy') }}
                        </UiTag>
                    </div>

                    <div :class="$style['promo-settings__form-grid']">
                        <UiField id="promo-budget" :label="t('fields.budget')">
                            <UiTextbox
                                id="promo-budget"
                                v-model:value="budget"
                                inputmode="decimal"
                                :class="$style['promo-settings__control']"
                                :suffix="t('labels.currency')"
                            />
                        </UiField>

                        <UiField id="promo-max-discount" :label="t('fields.maxDiscount')">
                            <UiNumberStepper
                                id="promo-max-discount"
                                v-model:value="maxDiscount"
                                :min="0"
                                :max="90"
                            />
                        </UiField>

                        <UiField id="promo-min-order" :label="t('fields.minOrder')">
                            <UiTextbox
                                id="promo-min-order"
                                v-model:value="minOrder"
                                inputmode="decimal"
                                :class="$style['promo-settings__control']"
                                :suffix="t('labels.currency')"
                            />
                        </UiField>

                        <UiField id="promo-segment" :label="t('fields.segment')">
                            <UiSelect
                                id="promo-segment"
                                v-model:value="segment"
                                :class="$style['promo-settings__control']"
                            >
                                <UiSelectOption value="all" :label="t('segments.all')" />
                                <UiSelectOption value="loyal" :label="t('segments.loyal')" />
                                <UiSelectOption value="new" :label="t('segments.new')" />
                            </UiSelect>
                        </UiField>
                    </div>

                    <div :class="$style['promo-settings__options']">
                        <div :class="$style['promo-settings__option']">
                            <UiSwitch id="promo-stackable-switch" v-model:value="stackable" />
                            <label :class="$style['promo-settings__switch-label']" for="promo-stackable-switch">
                                {{ t('options.stackable') }}
                            </label>
                        </div>
                        <div :class="$style['promo-settings__option']">
                            <UiSwitch id="promo-requires-coupon-switch" v-model:value="requiresCoupon" />
                            <label :class="$style['promo-settings__switch-label']" for="promo-requires-coupon-switch">
                                {{ t('options.requiresCoupon') }}
                            </label>
                        </div>
                        <div :class="$style['promo-settings__option']">
                            <UiSwitch id="promo-limit-per-client-switch" v-model:value="limitPerClient" />
                            <label :class="$style['promo-settings__switch-label']" for="promo-limit-per-client-switch">
                                {{ t('options.limitPerClient') }}
                            </label>
                        </div>
                    </div>
                </section>

                <section :class="$style['promo-settings__card']">
                    <div :class="$style['promo-settings__card-header']">
                        <h2 :class="$style['promo-settings__card-title']">
                            {{ t('sections.schedule') }}
                        </h2>
                        <UiTag background="#FEF3C7">
                            {{ t('tags.schedule') }}
                        </UiTag>
                    </div>

                    <div :class="$style['promo-settings__form-grid']">
                        <UiField id="promo-start-date" :label="t('fields.startDate')">
                            <UiDatePicker
                                id="promo-start-date"
                                v-model:value="startDate"
                                :class="$style['promo-settings__control']"
                            />
                        </UiField>

                        <UiField id="promo-end-date" :label="t('fields.endDate')">
                            <UiDatePicker
                                id="promo-end-date"
                                v-model:value="endDate"
                                :class="$style['promo-settings__control']"
                            />
                        </UiField>

                        <UiField id="promo-start-time" :label="t('fields.startTime')">
                            <UiTimePicker
                                id="promo-start-time"
                                v-model:value="startTime"
                                :class="$style['promo-settings__control']"
                            />
                        </UiField>

                        <UiField id="promo-end-time" :label="t('fields.endTime')">
                            <UiTimePicker
                                id="promo-end-time"
                                v-model:value="endTime"
                                :class="$style['promo-settings__control']"
                            />
                        </UiField>
                    </div>

                    <div :class="$style['promo-settings__options']">
                        <div :class="$style['promo-settings__option']">
                            <UiSwitch id="promo-use-store-timezone-switch" v-model:value="useStoreTimezone" />
                            <label :class="$style['promo-settings__switch-label']" for="promo-use-store-timezone-switch">
                                {{ t('options.useStoreTimezone') }}
                            </label>
                        </div>
                        <div :class="$style['promo-settings__option']">
                            <UiSwitch id="promo-auto-extend-switch" v-model:value="autoExtend" />
                            <label :class="$style['promo-settings__switch-label']" for="promo-auto-extend-switch">
                                {{ t('options.autoExtend') }}
                            </label>
                        </div>
                    </div>
                </section>

                <section :class="$style['promo-settings__card']">
                    <div :class="$style['promo-settings__card-header']">
                        <h2 :class="$style['promo-settings__card-title']">
                            {{ t('sections.notifications') }}
                        </h2>
                    </div>

                    <div :class="$style['promo-settings__form-grid']">
                        <UiField id="promo-email" :label="t('fields.email')">
                            <UiTextbox
                                id="promo-email"
                                v-model:value="reportEmail"
                                :placeholder="t('placeholders.email')"
                                :class="$style['promo-settings__control']"
                            />
                        </UiField>

                        <UiField id="promo-webhook" :label="t('fields.webhook')">
                            <UiTextbox
                                id="promo-webhook"
                                v-model:value="webhook"
                                :placeholder="t('placeholders.webhook')"
                                :class="$style['promo-settings__control']"
                            />
                        </UiField>
                    </div>

                    <div :class="$style['promo-settings__inline-actions']">
                        <UiAddButton small>
                            {{ t('actions.addRecipient') }}
                        </UiAddButton>

                        <div :class="$style['promo-settings__copy-block']">
                            <span :class="$style['promo-settings__copy-label']">{{ t('labels.copyCode') }}</span>
                            <UiCopyButton :text="promoCode" size="sm">
                                <template #hint>
                                    {{ t('copyHints.default') }}
                                </template>
                                <template #hint-copied>
                                    {{ t('copyHints.copied') }}
                                </template>
                            </UiCopyButton>
                        </div>
                    </div>
                </section>
            </div>

            <aside :class="$style['promo-settings__aside']">
                <section :class="$style['promo-settings__card']">
                    <div :class="$style['promo-settings__card-header']">
                        <h3 :class="$style['promo-settings__card-title']">
                            {{ t('sections.summary') }}
                        </h3>

                        <UiTag background="#E0F2FE">{{ t('status.draft') }}</UiTag>
                    </div>

                    <div :class="$style['promo-settings__summary']">
                        <div :class="$style['promo-settings__summary-item']">
                            <span>{{ t('summary.status') }}</span>
                            <strong>{{ t(`status.${status}`) }}</strong>
                        </div>

                        <div :class="$style['promo-settings__summary-item']">
                            <span>{{ t('summary.segment') }}</span>
                            <strong>{{ t(`segments.${segment}`) }}</strong>
                        </div>

                        <div :class="$style['promo-settings__summary-item']">
                            <span>{{ t('summary.budget') }}</span>
                            <strong>{{ budget }} ₽</strong>
                        </div>

                        <div :class="$style['promo-settings__summary-item']">
                            <span>{{ t('summary.period') }}</span>
                            <strong>{{ t('summary.periodValue') }}</strong>
                        </div>
                    </div>

                    <div :class="$style['promo-settings__tag-list']">
                        <UiTag background="#DCFCE7">{{ t('tags.checkout') }}</UiTag>
                        <UiTag background="#F3F4F6">{{ t('tags.crm') }}</UiTag>
                        <UiTag background="#FFE4E6">{{ t('tags.api') }}</UiTag>
                    </div>
                </section>

                <section :class="$style['promo-settings__card']">
                    <div :class="$style['promo-settings__card-header']">
                        <h3 :class="$style['promo-settings__card-title']">
                            {{ t('sections.checks') }}
                        </h3>
                    </div>

                    <div :class="$style['promo-settings__checks']">
                        <UiAlert variant="success" :text="t('checks.pass')" small />
                        <UiAlert variant="warning" :text="t('checks.warning')" small />
                    </div>
                </section>

                <section :class="$style['promo-settings__card']">
                    <div :class="$style['promo-settings__card-header']">
                        <h3 :class="$style['promo-settings__card-title']">
                            {{ t('sections.tools') }}
                        </h3>
                    </div>

                    <div :class="$style['promo-settings__tools']">
                        <UiButton appearance="secondary">
                            {{ t('actions.test') }}
                        </UiButton>

                        <UiButton appearance="outlined">
                            {{ t('actions.export') }}
                        </UiButton>

                        <UiButton appearance="tertiary">
                            {{ t('actions.archive') }}
                        </UiButton>
                    </div>
                </section>
            </aside>
        </div>
    </section>
</template>

<script lang="ts" setup>
import {
    UiAddButton,
    UiAlert,
    UiButton,
    UiCopyButton,
    UiDatePicker,
    UiField,
    UiLink,
    UiNumberStepper,
    UiSelect,
    UiSelectOption,
    UiSwitch,
    UiTag,
    UiTextbox,
    UiTimePicker,
} from '@retailcrm/embed-ui-v1-components/remote'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useField } from '@retailcrm/embed-ui'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { watch } from 'vue'

defineProps<{ code: string }>()

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, value => i18n.locale.value = value, { immediate: true })

const promoName = ref('Весенняя распродажа')
const promoCode = ref('PROMO-2026')
const status = ref('draft')
const owner = ref('marketing')
const channel = ref('omni')
const description = ref('Скидки на сезонные коллекции и товары с остатком.')

const budget = ref('150000')
const maxDiscount = ref(25)
const minOrder = ref('2500')
const segment = ref('all')

const startDate = ref(new Date())
const endDate = ref(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30))
const startTime = ref('09:00')
const endTime = ref('23:00')

const isActive = ref(true)
const stackable = ref(false)
const requiresCoupon = ref(true)
const limitPerClient = ref(true)
const useStoreTimezone = ref(true)
const autoExtend = ref(false)

const reportEmail = ref('marketing@company.test')
const webhook = ref('https://example.com/hooks/promotions')
</script>

<style module lang="less">
.promo-settings {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        flex-wrap: wrap;
    }

    &__title {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
    }

    &__subtitle {
        margin: 6px 0 0;
        color: #6b7280;
        font-size: 13px;
    }

    &__header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
    }

    &__status-tag {
        margin-right: 4px;
    }

    &__alert {
        margin: 0;
    }

    &__layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 16px;
        align-items: start;
    }

    &__main {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    &__card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 16px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    &__card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
    }

    &__card-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
    }

    &__card-link {
        font-size: 12px;
    }

    &__form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px 16px;
    }

    &__control {
        max-width: 100%;
    }

    &__control--multiline {
        width: 100%;
    }

    &__field--wide {
        grid-column: 1 / -1;
    }

    &__switch-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 0;
    }

    &__switch-label {
        color: #374151;
        font-size: 13px;
        cursor: pointer;
    }

    &__options {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    &__option {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #374151;
        font-size: 13px;
    }

    &__inline-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-top: 12px;
        flex-wrap: wrap;
    }

    &__copy-block {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__copy-label {
        font-size: 12px;
        color: #6b7280;
    }

    &__aside {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    &__summary {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
    }

    &__summary-item {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        color: #374151;
        font-size: 13px;
    }

    &__tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    &__checks {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    &__tools {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
}

@media (max-width: 1100px) {
    .promo-settings {
        &__layout {
            grid-template-columns: 1fr;
        }

        &__tools {
            flex-direction: row;
            flex-wrap: wrap;
        }
    }
}

@media (max-width: 720px) {
    .promo-settings {
        &__form-grid {
            grid-template-columns: 1fr;
        }

        &__header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
}
</style>

<i18n locale="en-GB">
{
    "title": "Promotion settings",
    "subtitle": "Manage rules, schedule, and delivery channels for the promo.",
    "alerts": {
        "draft": "Changes are saved as a draft and applied after publishing."
    },
    "actions": {
        "save": "Save",
        "preview": "Preview",
        "addRecipient": "Add recipient",
        "test": "Test run",
        "export": "Export",
        "archive": "Archive"
    },
    "links": {
        "docs": "Documentation"
    },
    "sections": {
        "general": "Basics",
        "rules": "Rules & limits",
        "schedule": "Schedule",
        "notifications": "Notifications & integrations",
        "summary": "Summary",
        "checks": "Checks",
        "tools": "Tools"
    },
    "fields": {
        "name": "Promotion name",
        "code": "Code",
        "status": "Status",
        "owner": "Owner",
        "channel": "Launch channel",
        "active": "Promotion active",
        "description": "Description",
        "budget": "Budget",
        "maxDiscount": "Max discount, %",
        "minOrder": "Min order",
        "segment": "Customer segment",
        "startDate": "Start date",
        "endDate": "End date",
        "startTime": "Start time",
        "endTime": "End time",
        "email": "Report email",
        "webhook": "Webhook for events"
    },
    "placeholders": {
        "name": "Spring sale, for example",
        "description": "Shortly describe mechanics and constraints",
        "email": "marketing (at) company.test",
        "webhook": "https://example.com/hooks/promotions"
    },
    "hints": {
        "code": "Used in links and logs"
    },
    "status": {
        "draft": "Draft",
        "active": "Active",
        "paused": "Paused"
    },
    "owners": {
        "marketing": "Marketing",
        "sales": "Sales",
        "team": "Promo team"
    },
    "channels": {
        "omni": "Omnichannel",
        "web": "Web storefront",
        "retail": "Retail"
    },
    "segments": {
        "all": "All customers",
        "loyal": "Loyal",
        "new": "New"
    },
    "states": {
        "active": "Enabled",
        "inactive": "Disabled"
    },
    "options": {
        "stackable": "Stackable with other discounts",
        "requiresCoupon": "Requires coupon",
        "limitPerClient": "Limit to one order per customer",
        "useStoreTimezone": "Use store timezone",
        "autoExtend": "Auto-extend campaign"
    },
    "tags": {
        "policy": "Policy",
        "schedule": "Calendar",
        "checkout": "Checkout",
        "crm": "CRM",
        "api": "API"
    },
    "labels": {
        "copyCode": "Copy code",
        "currency": "₽"
    },
    "copyHints": {
        "default": "Copy promo code",
        "copied": "Copied"
    },
    "summary": {
        "status": "Status",
        "segment": "Segment",
        "budget": "Budget",
        "period": "Period",
        "periodValue": "30 days"
    },
    "checks": {
        "pass": "All required fields are filled",
        "warning": "Webhook is not confirmed yet"
    }
}
</i18n>

<i18n locale="ru-RU">
{
    "title": "Настройки акций",
    "subtitle": "Управляйте правилами, расписанием и каналами показа.",
    "alerts": {
        "draft": "Изменения сохраняются в черновик и применяются после публикации."
    },
    "actions": {
        "save": "Сохранить",
        "preview": "Предпросмотр",
        "addRecipient": "Добавить получателя",
        "test": "Тестовый запуск",
        "export": "Экспортировать",
        "archive": "Архивировать"
    },
    "links": {
        "docs": "Документация"
    },
    "sections": {
        "general": "Основные параметры",
        "rules": "Правила и ограничения",
        "schedule": "Расписание",
        "notifications": "Уведомления и интеграции",
        "summary": "Сводка",
        "checks": "Проверки",
        "tools": "Инструменты"
    },
    "fields": {
        "name": "Название акции",
        "code": "Код",
        "status": "Статус",
        "owner": "Ответственный",
        "channel": "Канал запуска",
        "active": "Акция активна",
        "description": "Описание",
        "budget": "Бюджет",
        "maxDiscount": "Макс. скидка, %",
        "minOrder": "Минимальный заказ",
        "segment": "Сегмент покупателей",
        "startDate": "Дата старта",
        "endDate": "Дата окончания",
        "startTime": "Время начала",
        "endTime": "Время окончания",
        "email": "Email для отчётов",
        "webhook": "Webhook для событий"
    },
    "placeholders": {
        "name": "Например, Весенняя распродажа",
        "description": "Кратко опишите механику и ограничения",
        "email": "marketing (at) company.test",
        "webhook": "https://example.com/hooks/promotions"
    },
    "hints": {
        "code": "Используется в ссылках и логах"
    },
    "status": {
        "draft": "Черновик",
        "active": "Активна",
        "paused": "На паузе"
    },
    "owners": {
        "marketing": "Маркетинг",
        "sales": "Продажи",
        "team": "Команда промо"
    },
    "channels": {
        "omni": "Омниканал",
        "web": "Онлайн витрина",
        "retail": "Розница"
    },
    "segments": {
        "all": "Все клиенты",
        "loyal": "Лояльные",
        "new": "Новые"
    },
    "states": {
        "active": "Включена",
        "inactive": "Выключена"
    },
    "options": {
        "stackable": "Суммируется с другими скидками",
        "requiresCoupon": "Требует промокод",
        "limitPerClient": "Ограничить 1 заказом на клиента",
        "useStoreTimezone": "Использовать часовой пояс магазина",
        "autoExtend": "Автоматически продлевать"
    },
    "tags": {
        "policy": "Политики",
        "schedule": "Календарь",
        "checkout": "Checkout",
        "crm": "CRM",
        "api": "API"
    },
    "labels": {
        "copyCode": "Скопировать код",
        "currency": "₽"
    },
    "copyHints": {
        "default": "Скопировать промокод",
        "copied": "Скопировано"
    },
    "summary": {
        "status": "Статус",
        "segment": "Сегмент",
        "budget": "Бюджет",
        "period": "Период",
        "periodValue": "30 дней"
    },
    "checks": {
        "pass": "Все обязательные поля заполнены",
        "warning": "Webhook пока не подтверждён"
    }
}
</i18n>
