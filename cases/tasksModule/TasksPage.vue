<template>
    <section :class="$style['page']">
        <header :class="$style['page__hero']">
            <div :class="$style['page__hero-copy']">
                <h1 :class="$style['page__title']">
                    {{ t('page.title') }}
                </h1>

                <p :class="$style['page__subtitle']">
                    {{ t('page.subtitle') }}
                </p>

                <p :class="$style['page__note']">
                    {{ t('page.note') }}
                </p>
            </div>

            <div :class="$style['page__hero-actions']">
                <UiButton
                    appearance="secondary"
                    href="/modules/tasksModule/summary"
                >
                    <IconSummary aria-hidden="true" /> {{ t('actions.summary') }}
                </UiButton>

                <UiButton appearance="secondary" @click="resetBoard">
                    {{ t('actions.reset') }}
                </UiButton>
            </div>
        </header>

        <section :class="$style['page__metrics']">
            <div :class="$style['page__metric']">
                <span :class="$style['page__metric-label']">
                    {{ t('metrics.total') }}
                </span>

                <strong :class="$style['page__metric-value']">
                    {{ tasks.length }}
                </strong>
            </div>

            <div :class="$style['page__metric']">
                <span :class="$style['page__metric-label']">
                    {{ t('metrics.urgent') }}
                </span>

                <strong :class="$style['page__metric-value']">
                    {{ tasks.filter(item => isUrgent(item.task, item.laneId)).length }}
                </strong>
            </div>

            <div :class="$style['page__metric']">
                <span :class="$style['page__metric-label']">
                    {{ t('metrics.busiest') }}
                </span>

                <strong
                    :class="[
                        $style['page__metric-value'],
                        $style['page__metric-value_text']
                    ]"
                >
                    {{ busiestMember.name }}
                </strong>

                <span :class="$style['page__metric-note']">
                    {{ t('metrics.busiestNote', { count: busiestMember.total }) }}
                </span>
            </div>
        </section>

        <div :class="$style['page__board-shell']">
            <section :class="$style['page__board']">
                <article
                    v-for="lane in laneEntries"
                    :key="lane.id"
                    :class="$style['page__lane']"
                >
                    <header :class="$style['page__lane-header']">
                        <div :class="$style['page__lane-heading']">
                            <h2 :class="$style['page__lane-title']">
                                {{ lane.title }}
                            </h2>
                        </div>

                        <div :class="$style['page__lane-badges']">
                            <UiPopperConnector v-if="lane.urgentCount > 0">
                                <UiPopperTarget
                                    tag="span"
                                    role="button"
                                    tabindex="0"
                                    :aria-label="t('lane.urgentHintAria', { count: lane.urgentCount })"
                                    :class="$style['page__lane-alert']"
                                >
                                    <IconWarning :class="$style['page__lane-alert-icon']" aria-hidden="true" />
                                    {{ lane.urgentCount }}
                                </UiPopperTarget>

                                <UiTooltip
                                    :target-triggers="{
                                        show: ['hover', 'focus'],
                                        hide: ['hover', 'focus', 'click'],
                                    }"
                                    :offset-main-axis="6"
                                    placement="top-start"
                                >
                                    {{ t('lane.urgentHint', { count: lane.urgentCount }) }}
                                </UiTooltip>
                            </UiPopperConnector>

                            <span :class="$style['page__lane-count']">
                                {{ lane.tasks.length }}
                            </span>
                        </div>
                    </header>

                    <RemoteSortableContainer
                        as="div"
                        :accepts="['crm-task']"
                        :class="{
                            [$style['page__lane-cards']]: true,
                            [$style['page__lane-cards_empty']]: lane.isVisuallyEmpty,
                        }"
                        :container-id="lane.id"
                        orientation="vertical"
                        @drop="moveTask"
                    >
                        <RemoteSortableItem
                            v-for="(task, index) in lane.tasks"
                            :key="task.id"
                            as="article"
                            :class="{
                                [$style['task-card']]: true,
                                [$style['task-card_priority_high']]: task.priority === 'high',
                                [$style['task-card_priority_medium']]: task.priority === 'medium',
                                [$style['task-card_priority_low']]: task.priority === 'low',
                            }"
                            :container-id="lane.id"
                            :index="index"
                            :item-id="task.id"
                            type="crm-task"
                            @dragcancel="setDragCancel(task)"
                            @dragend="clearDragState"
                            @dragstart="setDragStart(task, lane.id)"
                        >
                            <div :class="$style['task-card__head']">
                                <RemoteDragHandle
                                    as="button"
                                    :class="$style['task-card__handle']"
                                >
                                    {{ t('actions.drag') }}
                                </RemoteDragHandle>

                                <span :class="$style['task-card__order']">
                                    #{{ task.orderNumber }}
                                </span>
                            </div>

                            <div :class="$style['task-card__copy']">
                                <h3 :class="$style['task-card__title']">
                                    {{ task.title }}
                                </h3>

                                <p :class="$style['task-card__customer']">
                                    {{ task.customerName }}
                                </p>
                            </div>

                            <dl :class="$style['task-card__meta']">
                                <div :class="$style['task-card__meta-row']">
                                    <dt :class="$style['task-card__label']">
                                        {{ t('task.due') }}
                                    </dt>

                                    <dd :class="$style['task-card__value']">
                                        {{ formatDate(task.dueDate) }}
                                    </dd>
                                </div>

                                <div :class="$style['task-card__meta-row']">
                                    <dt :class="$style['task-card__label']">
                                        {{ t('task.estimate') }}
                                    </dt>

                                    <dd :class="$style['task-card__value']">
                                        {{ task.estimate }}
                                    </dd>
                                </div>
                            </dl>

                            <footer :class="$style['task-card__footer']">
                                <div :class="$style['task-card__assignee']">
                                    <span :class="$style['task-card__assignee-avatar']">
                                        {{ getInitials(task.assigneeName) }}
                                    </span>

                                    <div>
                                        <span :class="$style['task-card__assignee-name']">
                                            {{ task.assigneeName }}
                                        </span>

                                        <span :class="$style['task-card__assignee-role']">
                                            {{ getRole(task.assigneeId) }}
                                        </span>
                                    </div>
                                </div>

                                <span
                                    :class="{
                                        [$style['task-card__priority']]: true,
                                        [$style['task-card__priority_high']]: task.priority === 'high',
                                        [$style['task-card__priority_medium']]: task.priority === 'medium',
                                        [$style['task-card__priority_low']]: task.priority === 'low',
                                    }"
                                >
                                    {{ task.priorityLabel }}
                                </span>
                            </footer>
                        </RemoteSortableItem>

                        <div
                            v-if="lane.isVisuallyEmpty"
                            :class="$style['page__lane-empty']"
                        >
                            {{ t('board.empty') }}
                        </div>
                    </RemoteSortableContainer>
                </article>
            </section>
        </div>
    </section>
</template>

<script lang="ts" remote setup>
import type {
    ActivityState,
    Board,
    LaneId,
    Priority,
} from './types'
import type { RemoteSortableEvent } from '@omnicajs/vue-remote/remote'
import type { Task } from './types'

import {
    RemoteDragHandle,
    RemoteSortableContainer,
    RemoteSortableItem,
} from '@omnicajs/vue-remote/remote'
import {
    UiButton,
    UiPopperConnector,
    UiPopperTarget,
    UiTooltip,
} from '@retailcrm/embed-ui-v1-components/remote'

import { computed, ref } from 'vue'
import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import {
    useContext as useSettings,
} from '@retailcrm/embed-ui-v1-contexts/remote/settings'
import { watch } from 'vue'

import IconSummary from '@retailcrm/embed-ui-v1-components/assets/sprites/technology-and-data/chart-pie-1.svg'
import IconWarning from '@retailcrm/embed-ui-v1-components/assets/sprites/alerts/warning.svg'

import { assignees, createInitialBoard, laneOrder as lanes } from './fixtures'

const i18n = useI18n()
const t = i18n.t

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

watch(locale, value => i18n.locale.value = value || 'ru-RU', { immediate: true })
const board = ref<Board>(createInitialBoard())
const activity = ref<ActivityState>({ kind: 'idle' })
const draggedTaskSourceLane = ref<LaneId | null>(null)

const toDate = (value: string) => new Date(`${value}T00:00:00`)
const toYMD = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const isLaneId = (value: string): value is LaneId => lanes.includes(value as LaneId)

const isUrgent = (task: Task, laneId: LaneId) => {
    return laneId !== 'done' && task.dueDate <= toYMD(new Date())
}

const getRole = (userId: string) => assignees.find(user => user.id === userId)?.role || ''
const clearDragState = () => {
    draggedTaskSourceLane.value = null
}

const laneUrgentCount = (laneId: LaneId) => {
    return board.value[laneId].filter(task => isUrgent(task, laneId)).length
}

const isLaneVisuallyEmpty = (laneId: LaneId) => {
    return board.value[laneId].length === 0
        || (draggedTaskSourceLane.value === laneId && board.value[laneId].length === 1)
}

const formatDate = (value: string) => {
    return new Intl.DateTimeFormat(locale.value || 'ru-RU', {
        day: '2-digit',
        month: 'short',
    }).format(toDate(value))
}

const getInitials = (value: string) => {
    return value
        .split(' ')
        .map(part => part[0] || '')
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

const tasks = computed(() => {
    return lanes.flatMap(laneId => board.value[laneId].map(task => ({ laneId, task })))
})

const teamWorkload = computed(() => {
    return assignees.map(user => {
        let total = 0
        let urgent = 0

        for (const laneId of lanes) {
            const memberTasks = board.value[laneId].filter(task => task.assigneeId === user.id)

            if (laneId !== 'done') {
                total += memberTasks.length
            }

            urgent += memberTasks.filter(task => isUrgent(task, laneId)).length
        }

        return {
            ...user,
            initials: getInitials(user.name),
            total,
            urgent,
        }
    })
})

const priorityLabels = computed<Record<Priority, string>>(() => ({
    high: t('priority.high'),
    medium: t('priority.medium'),
    low: t('priority.low'),
}))

const laneEntries = computed(() => {
    return [{
        id: 'queue' as const,
        title: t('lane.queue.title'),
        tasks: board.value.queue.map(task => ({ ...task, priorityLabel: priorityLabels.value[task.priority] })),
        isVisuallyEmpty: isLaneVisuallyEmpty('queue'),
        urgentCount: laneUrgentCount('queue'),
    }, {
        id: 'inProgress' as const,
        title: t('lane.inProgress.title'),
        tasks: board.value.inProgress.map(task => ({ ...task, priorityLabel: priorityLabels.value[task.priority] })),
        isVisuallyEmpty: isLaneVisuallyEmpty('inProgress'),
        urgentCount: laneUrgentCount('inProgress'),
    }, {
        id: 'review' as const,
        title: t('lane.review.title'),
        tasks: board.value.review.map(task => ({ ...task, priorityLabel: priorityLabels.value[task.priority] })),
        isVisuallyEmpty: isLaneVisuallyEmpty('review'),
        urgentCount: laneUrgentCount('review'),
    }, {
        id: 'done' as const,
        title: t('lane.done.title'),
        tasks: board.value.done.map(task => ({ ...task, priorityLabel: priorityLabels.value[task.priority] })),
        isVisuallyEmpty: isLaneVisuallyEmpty('done'),
        urgentCount: laneUrgentCount('done'),
    }]
})

const busiestMember = computed(() => {
    return teamWorkload.value.reduce((current, member) => {
        return member.total > current.total ? member : current
    }, teamWorkload.value[0])
})

const setDragStart = (task: Task, laneId: LaneId) => {
    draggedTaskSourceLane.value = laneId
    activity.value = { kind: 'dragstart', title: task.title }
}

const setDragCancel = (task: Task) => {
    clearDragState()
    activity.value = { kind: 'cancel', title: task.title }
}

const moveTask = (event: RemoteSortableEvent) => {
    if (
        !event.accepted
        || event.targetContainerId === null
        || event.targetIndex === null
        || !isLaneId(event.sourceContainerId)
        || !isLaneId(event.targetContainerId)
    ) {
        clearDragState()
        activity.value = { kind: 'ignored', itemId: event.itemId }
        return
    }

    const sourceLane = event.sourceContainerId
    const targetLane = event.targetContainerId
    const sourceTasks = board.value[sourceLane]
    const targetTasks = board.value[targetLane]
    const sourceIndex = sourceTasks.findIndex(task => task.id === event.itemId)

    if (sourceIndex < 0) {
        clearDragState()
        activity.value = { kind: 'notFound', itemId: event.itemId }
        return
    }

    const [task] = sourceTasks.splice(sourceIndex, 1)
    const targetIndex = Math.min(Math.max(event.targetIndex, 0), targetTasks.length)

    targetTasks.splice(targetIndex, 0, { ...task })
    clearDragState()
    activity.value = { kind: 'moved', title: task.title, laneId: targetLane }
}

const resetBoard = () => {
    board.value = createInitialBoard()
    clearDragState()
    activity.value = { kind: 'idle' }
}
</script>

<style module lang="less">
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/palette.less";

.page {
    .reset-box-sizing();

    display: flex;
    flex-direction: column;
    gap: @spacing-s;
    color: @black-500;
    container-type: inline-size;

    &__hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: @spacing-s;
        padding: @spacing-m;
        background: white;
        border: 1px solid @grey-500;
        border-radius: @border-radius-lg;
    }

    &__hero-copy {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
        max-width: 720px;
    }

    &__hero-actions {
        display: flex;
        align-items: center;
        gap: @spacing-xs;
        flex-shrink: 0;
    }

    &__title {
        .h2-accent();

        margin: 0;
    }

    &__subtitle {
        .text-regular();

        margin: 0;
        color: @black-500;
    }

    &__note {
        .text-small();

        margin: 0;
        color: @grey-900;
    }

    &__metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: @spacing-s;
    }

    &__metric {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
        min-width: 0;
        padding: @spacing-s;
        background: white;
        border: 1px solid @grey-500;
        border-radius: @border-radius-lg;
    }

    &__metric-label {
        .text-small-accent();

        color: @grey-900;
    }

    &__metric-value {
        .h2-accent();

        margin: 0;
        color: @black-500;
    }

    &__metric-value_text {
        .h4-accent();
    }

    &__metric-note {
        .text-small();

        color: @grey-900;
    }

    &__layout { display: block; }

    &__board-shell {
        overflow-x: auto;
        overflow-y: hidden;
        padding-bottom: @spacing-xs;
    }

    &__board {
        display: flex;
        gap: @spacing-s;
        align-items: start;
        min-width: max-content;
    }

    &__lane {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
        flex: 0 0 360px;
        width: 360px;
        min-width: 360px;
        align-self: stretch;
        padding: @spacing-s;
        background: white;
        border: 1px solid @grey-500;
        border-radius: @border-radius-lg;
        transition: border-color @transition, box-shadow @transition;

        &:has([data-dnd-drag-over='true']) {
            border-color: @blue-400;
            box-shadow: inset 0 0 0 1px @blue-400;
        }
    }

    &__lane-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: @spacing-xs;
    }

    &__lane-heading {
        min-width: 0;
    }

    &__lane-title {
        .text-regular-accent();

        margin: 0;
    }

    &__lane-badges {
        display: flex;
        align-items: center;
        gap: @spacing-xxs;
        flex-shrink: 0;
    }

    &__lane-alert {
        .text-tiny-accent();

        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: @spacing-xxs;
        min-width: 24px;
        min-height: 24px;
        padding: 0 @spacing-xxs;
        color: @red-700;
        background: @red-transparent;
        border-radius: @border-radius-md;
        cursor: help;

        &:focus-visible {
            outline: 2px solid @blue-400;
            outline-offset: 2px;
        }
    }

    &__lane-alert-icon {
        .square(12px);

        flex-shrink: 0;
        fill: currentColor;
    }

    &__lane-count {
        .text-small-accent();

        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        min-height: 28px;
        padding: 0 @spacing-xs;
        background: white;
        border-radius: @border-radius-md;
        color: @black-500;
    }

    &__lane-cards {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        gap: @spacing-xs;
        min-height: 260px;
        position: relative;
    }

    &__lane-cards_empty {
        justify-content: center;
    }

    &__lane-cards [data-dnd-placeholder='true'] {
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

    &__lane-cards [data-dnd-placeholder='true'] > * {
        visibility: hidden;
    }

    &__lane-cards_empty [data-dnd-placeholder='true'] {
        position: absolute;
        inset: 0;
        visibility: hidden;
        pointer-events: none;
    }

    &__lane-empty {
        .text-small();

        display: flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        min-height: 100%;
        padding: @spacing-s;
        color: @grey-900;
        text-align: center;
        background: white;
        border: 1px dashed @grey-600;
        border-radius: @border-radius-lg;
        pointer-events: none;
    }

    @container (max-width: 1200px) {
        &__layout { display: block; }
    }

    @container (max-width: 960px) {
        &__metrics {
            grid-template-columns: 1fr;
        }

    }

    @container (max-width: 680px) {
        &__hero {
            flex-direction: column;
        }

        &__lane {
            flex-basis: 320px;
            width: 320px;
            min-width: 320px;
        }
    }
}

.task-card {
    display: flex;
    flex-direction: column;
    gap: @spacing-s;
    padding: @spacing-s;
    background: white;
    border: 1px solid @grey-500;
    border-radius: @border-radius-lg;
    box-shadow: @drop-shadow-s;
    transition: transform @transition, border-color @transition, box-shadow @transition;

    &:hover {
        transform: translateY(-1px);
        box-shadow: @drop-shadow-m;
    }

    &[data-dnd-dragging='true'] {
        visibility: hidden;
        opacity: 0;
        box-shadow: none;
        pointer-events: none;
    }

    &[data-dnd-source='true'] .task-card__handle {
        cursor: grabbing;
    }

    &_priority_high {
        border-color: @red-200;
    }

    &_priority_medium {
        border-color: @yellow-300;
    }

    &_priority_low {
        border-color: @blue-200;
    }

    &__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: @spacing-xs;
    }

    &__handle {
        .text-tiny-accent();

        padding: @spacing-xxs @spacing-xs;
        color: @grey-900;
        background: @grey-100;
        border: 1px dashed @grey-600;
        border-radius: @border-radius-md;
        cursor: grab;
    }

    &__order {
        .text-tiny-accent();

        color: @grey-900;
    }

    &__copy {
        display: flex;
        flex-direction: column;
        gap: @spacing-xxs;
    }

    &__title {
        .text-small-accent();

        margin: 0;
        color: @black-500;
    }

    &__customer {
        .text-small();

        margin: 0;
        color: @grey-900;
    }

    &__meta {
        display: flex;
        flex-direction: column;
        gap: @spacing-xxs;
        margin: 0;
    }

    &__meta-row {
        display: flex;
        justify-content: space-between;
        gap: @spacing-s;
    }

    &__label {
        .text-tiny();

        color: @grey-900;
    }

    &__value {
        .text-small();

        margin: 0;
        color: @black-500;
        text-align: right;
    }

    &__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: @spacing-s;
    }

    &__assignee {
        display: flex;
        align-items: center;
        gap: @spacing-xs;
        min-width: 0;
    }

    &__assignee-avatar {
        .circle(32px);
        .text-small-accent();

        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: @blue-600;
        background: @blue-transparent;
    }

    &__assignee-name {
        .text-small-accent();

        display: block;
        color: @black-500;
    }

    &__assignee-role {
        .text-tiny();

        display: block;
        color: @grey-900;
    }

    &__priority {
        .text-tiny-accent();

        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        padding: @spacing-xxs @spacing-xs;
        border-radius: @border-radius-md;
    }

    &__priority_high {
        color: @red-700;
        background: @red-transparent;
    }

    &__priority_medium {
        color: @yellow-700;
        background: @yellow-transparent;
    }

    &__priority_low {
        color: @blue-600;
        background: @blue-transparent;
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

[data-dnd-overlay='true'] .task-card {
    display: flex;
    flex-direction: column;
    gap: @spacing-s;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: @spacing-s;
    box-sizing: border-box;
    background: white;
    border: 1px solid @blue-300;
    border-radius: @border-radius-lg;
    box-shadow: @drop-shadow-l;
    opacity: 0.96;
    transform: rotate(-2deg);
}

[data-dnd-overlay='true'] .task-card__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: @spacing-xs;
}

[data-dnd-overlay='true'] .task-card__copy,
[data-dnd-overlay='true'] .task-card__meta {
    display: flex;
    flex-direction: column;
    gap: @spacing-xxs;
}

[data-dnd-overlay='true'] .task-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: @spacing-s;
}
</style>

<i18n locale="en-GB">
{
    "page": {
        "title": "CRM task board",
        "subtitle": "A kanban page-case with CRM users as assignees and remote sortable cards.",
        "note": "The board is seeded with mock data and lives entirely inside the extension runtime."
    },
    "metrics": {
        "total": "Tasks on board",
        "urgent": "Urgent now",
        "busiest": "Most loaded teammate",
        "busiestNote": "{count} active tasks"
    },
    "actions": {
        "reset": "Reset board",
        "summary": "Open summary",
        "drag": "Drag"
    },
    "lane": {
        "queue": { "title": "New" },
        "inProgress": { "title": "In progress" },
        "review": { "title": "Approval" },
        "done": { "title": "Done" },
        "urgentHint": "{count} overdue or due today",
        "urgentHintAria": "Urgent tasks in lane: {count}"
    },
    "board": {
        "empty": "Drop a task here"
    },
    "task": {
        "due": "Due date",
        "estimate": "Estimate"
    },
    "priority": {
        "high": "High",
        "medium": "Medium",
        "low": "Low"
    },
    "activity": {
        "idle": "Move cards between columns or reorder them inside one lane.",
        "dragstart": "Dragging \"{title}\".",
        "cancel": "Drag canceled for \"{title}\".",
        "ignored": "Drop ignored for {itemId}.",
        "notFound": "Task {itemId} was not found.",
        "moved": "\"{title}\" moved to \"{lane}\"."
    },
    "sidebar": {
        "teamTitle": "CRM users",
        "teamCaption": "{count} active assignees",
        "activeTasks": "{count} active",
        "urgentTasks": "{count} urgent",
        "lastActionTitle": "Last action",
        "hintTitle": "How to try it",
        "hintText": "Grab a card by the handle and move it to another column or reorder it inside the current one."
    }
}
</i18n>

<i18n locale="es-ES">
{
    "page": {
        "title": "Tablero de tareas CRM",
        "subtitle": "Un page-case kanban con usuarios CRM como responsables y tarjetas remotas ordenables.",
        "note": "El tablero usa datos mock y funciona completamente dentro del runtime de la extension."
    },
    "metrics": {
        "total": "Tareas en el tablero",
        "urgent": "Urgentes ahora",
        "busiest": "Compañero con mayor carga",
        "busiestNote": "{count} tareas activas"
    },
    "actions": {
        "reset": "Restablecer tablero",
        "summary": "Abrir resumen",
        "drag": "Mover"
    },
    "lane": {
        "queue": { "title": "Nuevas" },
        "inProgress": { "title": "En progreso" },
        "review": { "title": "Aprobacion" },
        "done": { "title": "Hechas" },
        "urgentHint": "{count} vencidas o para hoy",
        "urgentHintAria": "Tareas urgentes en la columna: {count}"
    },
    "board": {
        "empty": "Suelta una tarea aqui"
    },
    "task": {
        "due": "Fecha limite",
        "estimate": "Estimacion"
    },
    "priority": {
        "high": "Alta",
        "medium": "Media",
        "low": "Baja"
    },
    "activity": {
        "idle": "Mueve tarjetas entre columnas o reordenalas dentro de la misma columna.",
        "dragstart": "Moviendo \"{title}\".",
        "cancel": "Movimiento cancelado para \"{title}\".",
        "ignored": "Movimiento ignorado para {itemId}.",
        "notFound": "No se encontro la tarea {itemId}.",
        "moved": "\"{title}\" movida a \"{lane}\"."
    },
    "sidebar": {
        "teamTitle": "Usuarios CRM",
        "teamCaption": "{count} responsables activos",
        "activeTasks": "{count} activas",
        "urgentTasks": "{count} urgentes",
        "lastActionTitle": "Ultima accion",
        "hintTitle": "Como probarlo",
        "hintText": "Toma una tarjeta por el handle y muevela a otra columna o reordenala dentro de la actual."
    }
}
</i18n>

<i18n locale="ru-RU">
{
    "page": {
        "title": "Доска задач CRM",
        "subtitle": "Page-case с kanban-доской, где задачи распределяются по пользователям CRM и статусам.",
        "note": "Пример использует локальные mock-данные и целиком работает внутри runtime расширения."
    },
    "metrics": {
        "total": "Задач на доске",
        "urgent": "Горят сейчас",
        "busiest": "Самый загруженный",
        "busiestNote": "Активных задач: {count}"
    },
    "actions": {
        "reset": "Сбросить доску",
        "summary": "Открыть сводку",
        "drag": "Тянуть"
    },
    "lane": {
        "queue": { "title": "Новые" },
        "inProgress": { "title": "В работе" },
        "review": { "title": "На согласовании" },
        "done": { "title": "Готово" },
        "urgentHint": "Просроченные или на сегодня: {count}",
        "urgentHintAria": "Срочных задач в колонке: {count}"
    },
    "board": {
        "empty": "Перетащите задачу сюда"
    },
    "task": {
        "due": "Срок",
        "estimate": "Оценка"
    },
    "priority": {
        "high": "Высокий",
        "medium": "Средний",
        "low": "Низкий"
    },
    "activity": {
        "idle": "Перетаскивайте карточки между колонками или меняйте их порядок внутри статуса.",
        "dragstart": "Перетаскиваем «{title}».",
        "cancel": "Перетаскивание отменено для «{title}».",
        "ignored": "Событие перетаскивания проигнорировано для {itemId}.",
        "notFound": "Не удалось найти задачу {itemId}.",
        "moved": "«{title}» перемещена в колонку «{lane}»."
    },
    "sidebar": {
        "teamTitle": "Команда CRM",
        "teamCaption": "Активных исполнителей: {count}",
        "activeTasks": "В работе: {count}",
        "urgentTasks": "Горят: {count}",
        "lastActionTitle": "Последнее действие",
        "hintTitle": "Как проверить пример",
        "hintText": "Возьмите карточку за handle и перенесите в другую колонку или поменяйте порядок внутри текущей."
    }
}
</i18n>
