<template>
    <UiToolbarButton :disabled="flow.unavailable" @click="flow.open">{{ t('assistant') }}</UiToolbarButton>

    <UiModalSidebar v-model:opened="flow.opened" :closable="!flow.busy">
        <template #title>{{ t('title') }}</template>

        <div :class="$style.content">
            <p>{{ t('ticket', { number: flow.ticket.number ?? '—', customer: flow.ticket['customer.name'] ?? t('noCustomer') }) }}</p>
            <UiError v-if="flow.application.error" :message="t(flow.application.error)" />
            <UiError v-if="flow.catalog.loadFailed" :message="t('loadFailed')" />
            <UiError v-if="flow.history.failed" :message="t('failed')" />
            <p v-if="flow.application.success" role="status">{{ t('success') }}</p>
            <p v-if="!flow.writable">{{ t('readonly') }}</p>
            <p v-if="flow.catalog.loading" role="status">{{ t('loading') }}</p>
            <UiToolbarButton
                v-if="!flow.catalog.loading && !flow.catalog.items.length && flow.writable"
                :disabled="flow.unavailable"
                @click="flow.loadRecipients"
            >
                {{ t('reload') }}
            </UiToolbarButton>

            <template v-if="!flow.application.plan">
                <fieldset :class="$style.questions" :disabled="flow.locked">
                    <legend>{{ t('questions') }}</legend>
                    <div v-for="issue in flow.ticket.issues" :key="issue.id" :class="$style.check">
                        <UiCheckbox
                            :id="`escalate-${issue.id}`"
                            v-model:model="flow.form.issueIds"
                            :value="issue.id"
                            :disabled="flow.locked"
                        />
                        <label :for="`escalate-${issue.id}`">{{ issueLabel(issue) }} — {{ issue.status?.name ?? '—' }}</label>
                    </div>
                </fieldset>
                <UiField id="escalation-recipient" v-slot="field" :label="t('recipient')">
                    <UiSelect
                        :id="field.id"
                        v-model:value="flow.form.recipientId"
                        :disabled="flow.locked"
                    >
                        <UiSelectOption
                            v-for="item in flow.catalog.items"
                            :key="item.id"
                            :value="item.id"
                            :label="item.name"
                        />
                    </UiSelect>
                </UiField>
                <UiField id="escalation-status" v-slot="field" :label="t('status')">
                    <UiSelect
                        :id="field.id"
                        v-model:value="flow.form.statusId"
                        :disabled="flow.locked"
                    >
                        <UiSelectOption
                            v-for="item in flow.permissions.statuses"
                            :key="item.id"
                            :value="item.id"
                            :label="item.name"
                        />
                    </UiSelect>
                </UiField>
                <UiField id="escalation-reason" v-slot="field" :label="t('reason')">
                    <UiSelect
                        :id="field.id"
                        v-model:value="flow.form.reason"
                        :disabled="flow.locked"
                    >
                        <UiSelectOption
                            v-for="code in ['specialist', 'approval', 'repeated']"
                            :key="code"
                            :value="code"
                            :label="t(`reasons.${code}`)"
                        />
                    </UiSelect>
                </UiField>
                <UiField id="escalation-tried" v-slot="field" :label="t('tried')">
                    <UiTextbox
                        :id="field.id"
                        v-model:value="flow.form.tried"
                        :disabled="flow.locked"
                        multiline
                    />
                </UiField>
                <UiField id="escalation-expected" v-slot="field" :label="t('expected')">
                    <UiTextbox
                        :id="field.id"
                        v-model:value="flow.form.expected"
                        :disabled="flow.locked"
                        multiline
                    />
                </UiField>
            </template>
            <template v-else>
                <h3>{{ t('preview') }}</h3>
                <p>{{ t('assignment', { name: flow.application.plan.recipient.name, status: flow.application.plan.statusName }) }}</p>
                <p>{{ t('commentPreview') }}</p>
                <p :class="$style.summary">{{ flow.application.plan.comment }}</p>
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
                    :disabled="flow.locked"
                    @click="flow.apply"
                >
                    {{ t(flow.application.completed.length ? 'continue' : 'apply') }}
                </UiButton>
                <UiButton
                    v-if="flow.application.plan && !flow.application.completed.length && !flow.busy"
                    appearance="secondary"
                    @click="flow.back()"
                >
                    {{ t('back') }}
                </UiButton>
                <UiButton
                    v-if="flow.application.success"
                    appearance="secondary"
                    @click="flow.opened = false"
                >
                    {{ t('close') }}
                </UiButton>
                <UiPopperConnector>
                    <UiButton
                        appearance="secondary"
                        :aria-label="t('openHistory')"
                        :disabled="flow.busy || flow.unavailable"
                        @click="flow.openHistory()"
                    >
                        <IconHistory aria-hidden="true" width="20" height="20" />
                    </UiButton>
                    <UiTooltip>{{ t('openHistory') }}</UiTooltip>
                </UiPopperConnector>
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
    UiPopperConnector,
    UiSelect,
    UiSelectOption,
    UiTextbox,
    UiToolbarButton,
    UiTooltip,
} from '@retailcrm/embed-ui-v1-components/remote'

import IconHistory from '@retailcrm/embed-ui-v1-components/assets/sprites/actions/restore.svg'

import { issueLabel } from './domain'

import { useEscalation } from './store/escalation'

const { t, locale } = useI18n()
const settings = useSettings()
const flow = useEscalation(t)

watch(() => settings['system.locale'], value => locale.value = value)
</script>

<style lang="less" module>
.content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    p, h3 { margin: 0; }
}

.questions {
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
