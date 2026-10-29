<template>
    <UiToolbarButton :disabled="flow.unavailable" @click="flow.open">{{ t('assistant') }}</UiToolbarButton>

    <UiModalSidebar v-model:opened="flow.opened" :closable="!flow.application.busy">
        <template #title>{{ t('assistant') }}</template>
        <div :class="$style.content">
            <UiError v-if="flow.application.error" :message="t(flow.application.error)" />
            <UiError v-if="flow.catalog.loadFailed" :message="t('loadFailed')" />
            <UiError v-if="flow.stale" :message="t('failed')" />
            <p v-if="flow.catalog.loading" role="status">{{ t('loading') }}</p>
            <p v-if="flow.application.success" role="status">{{ t('success') }}</p>
            <p>{{ t('draftHint') }}</p>
            <p v-if="!flow.ticket.orders.length">{{ t('noOrders') }}</p>
            <template v-else-if="!flow.application.plan">
                <UiToolbarButton
                    v-if="!flow.catalog.items.length && !flow.catalog.loading"
                    :disabled="flow.unavailable"
                    @click="flow.loadItems"
                >
                    {{ t('reload') }}
                </UiToolbarButton>
                <UiField id="claim-order" v-slot="field" :label="t('order')">
                    <UiSelect
                        :id="field.id"
                        v-model:value="flow.form.orderId"
                        :disabled="flow.locked"
                    >
                        <UiSelectOption
                            v-for="order in flow.ticket.orders"
                            :key="order.id"
                            :value="order.id"
                            :label="`№${order.number}`"
                        />
                    </UiSelect>
                </UiField>
                <fieldset :class="$style.items" :disabled="flow.locked">
                    <legend>{{ t('items') }}</legend>
                    <p
                        v-if="flow.form.orderId && !flow.catalog.loading && !flow.availableItems.length"
                    >
                        {{ t('noItems') }}
                    </p>
                    <div v-for="item in flow.availableItems" :key="item.id" :class="$style.check">
                        <UiCheckbox
                            :id="`claim-item-${item.id}`"
                            v-model:model="flow.form.orderItemIds"
                            :value="item.id"
                            :disabled="flow.locked"
                        />
                        <label :for="`claim-item-${item.id}`">{{ item.name }}{{ item.article ? ` · ${item.article}` : '' }}</label>
                    </div>
                </fieldset>
                <UiField id="claim-reason" v-slot="field" :label="t('reason')">
                    <UiSelect
                        :id="field.id"
                        v-model:value="flow.form.reason"
                        :disabled="flow.locked"
                    >
                        <UiSelectOption
                            v-for="code in ['damaged', 'incomplete', 'wrong']"
                            :key="code"
                            :value="code"
                            :label="t(`reasons.${code}`)"
                        />
                    </UiSelect>
                </UiField>
                <UiField
                    id="claim-details"
                    v-slot="field"
                    :label="t(`detailPrompts.${flow.form.reason}`)"
                >
                    <UiTextbox
                        :id="field.id"
                        v-model:value="flow.form.details"
                        :disabled="flow.locked"
                        multiline
                    />
                </UiField>
                <UiField id="claim-resolution" v-slot="field" :label="t('resolution')">
                    <UiSelect
                        :id="field.id"
                        v-model:value="flow.form.resolution"
                        :disabled="flow.locked"
                    >
                        <UiSelectOption
                            v-for="code in ['replacement', 'consultation']"
                            :key="code"
                            :value="code"
                            :label="t(`resolutions.${code}`)"
                        />
                    </UiSelect>
                </UiField>
                <div :class="$style.check">
                    <UiCheckbox
                        id="claim-new-issue"
                        v-model:model="flow.form.newIssue"
                        :disabled="flow.locked || !flow.ticket.issues.length"
                    />
                    <label for="claim-new-issue">{{ t('newIssue') }}</label>
                </div>
                <UiField
                    v-if="!flow.form.newIssue"
                    id="claim-issue"
                    v-slot="field"
                    :label="t('issue')"
                >
                    <UiSelect
                        :id="field.id"
                        v-model:value="flow.form.issueKey"
                        :disabled="flow.locked"
                    >
                        <UiSelectOption
                            v-for="(issue, index) in flow.ticket.issues"
                            :key="issue.key"
                            :value="issue.key"
                            :label="t('issueOption', { number: index + 1, name: issue.subtopic?.name ?? issue.type?.name ?? '—' })"
                        />
                    </UiSelect>
                </UiField>
                <UiField id="claim-type" v-slot="field" :label="t('type')">
                    <UiSelect
                        :id="field.id"
                        v-model:value="flow.form.typeId"
                        :disabled="flow.locked"
                    >
                        <UiSelectOption
                            v-for="item in flow.permissions.types"
                            :key="item.id"
                            :value="item.id"
                            :label="item.name"
                        />
                    </UiSelect>
                </UiField>
                <UiField id="claim-subtopic" v-slot="field" :label="t('subtopic')">
                    <UiSelect
                        :id="field.id"
                        v-model:value="flow.form.subtopicId"
                        :disabled="flow.locked"
                        filterable
                    >
                        <UiSelectOption
                            v-for="item in flow.subtopics"
                            :key="item.id"
                            :value="item.id"
                            :label="item.label"
                        />
                    </UiSelect>
                </UiField>
            </template>
            <template v-else>
                <h3>{{ t('preview') }}</h3>
                <p>{{ flow.application.plan.issue ? t('updateQuestion') : t('createQuestion') }}: {{ flow.application.plan.classification }}</p>
                <p>{{ t('linkItems', { count: flow.application.plan.orderItems.length }) }}</p>
                <p>{{ t('descriptionPreview') }}</p>
                <p :class="$style.summary">{{ flow.application.plan.description }}</p>
                <p
                    v-if="flow.application.completed.length && !flow.application.success"
                    role="status"
                >
                    {{ t('progress', { count: flow.application.completed.length }) }}
                </p>
            </template>
        </div>
        <template #footer>
            <div :class="$style.actions">
                <UiButton
                    v-if="!flow.application.plan"
                    :disabled="flow.locked || !flow.valid"
                    @click="flow.preview"
                >
                    {{ t('preview') }}
                </UiButton>
                <UiButton
                    v-else-if="!flow.application.success"
                    variant="success"
                    :disabled="flow.locked || flow.stale"
                    @click="flow.apply"
                >
                    {{ t(flow.application.completed.length ? 'continue' : 'apply') }}
                </UiButton>
                <UiButton
                    v-if="flow.application.plan && !flow.application.completed.length && !flow.application.busy"
                    appearance="secondary"
                    @click="flow.back()"
                >
                    {{ t('back') }}
                </UiButton>
                <UiButton
                    appearance="secondary"
                    :disabled="flow.application.busy"
                    @click="flow.opened = false"
                >
                    {{ t('close') }}
                </UiButton>
            </div>
        </template>
    </UiModalSidebar>
</template>

<script lang="ts" remote setup>
import { useI18n } from 'vue-i18n'
import {
    useContext as useSettings,
} from '@retailcrm/embed-ui-v1-contexts/remote/settings'
import { watch } from 'vue'

import {
    UiButton,
    UiCheckbox,
    UiError,
    UiField,
    UiModalSidebar,
    UiSelect,
    UiSelectOption,
    UiTextbox,
    UiToolbarButton,
} from '@retailcrm/embed-ui-v1-components/remote'

import { useClaim } from './store/claim'

const { t, locale } = useI18n()
const settings = useSettings()
const flow = useClaim(t)

watch(() => settings['system.locale'], value => locale.value = value)
</script>

<style lang="less" module>
.content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    p, h3 { margin: 0; }
}

.items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0;
    border: 0;
    margin: 0;

    legend { margin-bottom: 12px; }
}

.check, .actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.actions { flex-wrap: wrap; }
.summary { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
