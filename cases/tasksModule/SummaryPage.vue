<template>
    <section :class="$style['summary-page']">
        <header :class="$style['summary-page__hero']">
            <div>
                <h1 :class="$style['summary-page__title']">
                    {{ t('page.title') }}
                </h1>

                <p :class="$style['summary-page__subtitle']">
                    {{ t('page.subtitle') }}
                </p>
            </div>

            <a
                href="/modules/tasksModule/board"
                :class="$style['summary-page__hero-link']"
            >
                <IconBoard :class="$style['summary-page__hero-link-icon']" aria-hidden="true" />
                {{ t('actions.openBoard') }}
            </a>
        </header>

        <section :class="$style['summary-page__metrics']">
            <article :class="$style['summary-page__metric']">
                <span :class="$style['summary-page__metric-label']">
                    {{ t('metrics.total') }}
                </span>

                <strong :class="$style['summary-page__metric-value']">
                    {{ totalTasks }}
                </strong>
            </article>

            <article :class="$style['summary-page__metric']">
                <span :class="$style['summary-page__metric-label']">
                    {{ t('metrics.urgent') }}
                </span>

                <strong :class="$style['summary-page__metric-value']">
                    {{ urgentTasks }}
                </strong>
            </article>

            <article :class="$style['summary-page__metric']">
                <span :class="$style['summary-page__metric-label']">
                    {{ t('metrics.busiest') }}
                </span>

                <strong :class="$style['summary-page__metric-value']">
                    {{ busiestMember.name }}
                </strong>
            </article>
        </section>

        <div :class="$style['summary-page__layout']">
            <section :class="$style['summary-page__panel']">
                <div :class="$style['summary-page__panel-header']">
                    <h2 :class="$style['summary-page__panel-title']">
                        {{ t('sidebar.teamTitle') }}
                    </h2>

                    <span :class="$style['summary-page__panel-caption']">
                        {{ t('sidebar.teamCaption', { count: activeAssigneeCount }) }}
                    </span>
                </div>

                <ul :class="$style['summary-page__team-list']">
                    <li
                        v-for="member in teamWorkload"
                        :key="member.id"
                        :class="$style['summary-page__team-item']"
                    >
                        <div :class="$style['summary-page__team-main']">
                            <span :class="$style['summary-page__team-avatar']">
                                {{ member.initials }}
                            </span>

                            <div>
                                <p :class="$style['summary-page__team-name']">
                                    {{ member.name }}
                                </p>

                                <p :class="$style['summary-page__team-role']">
                                    {{ member.role }}
                                </p>
                            </div>
                        </div>

                        <div :class="$style['summary-page__team-stats']">
                            <span :class="$style['summary-page__team-pill']">
                                {{ t('sidebar.activeTasks', { count: member.total }) }}
                            </span>

                            <span
                                v-if="member.urgent > 0"
                                :class="{
                                    [$style['summary-page__team-pill']]: true,
                                    [$style['summary-page__team-pill_alert']]: true,
                                }"
                            >
                                {{ t('sidebar.urgentTasks', { count: member.urgent }) }}
                            </span>
                        </div>
                    </li>
                </ul>
            </section>

            <section :class="$style['summary-page__panel']">
                <h2 :class="$style['summary-page__panel-title']">
                    {{ t('summary.title') }}
                </h2>

                <p :class="$style['summary-page__text']">
                    {{ t('summary.text', { name: busiestMember.name, count: busiestMember.total }) }}
                </p>
            </section>

            <section :class="$style['summary-page__panel']">
                <h2 :class="$style['summary-page__panel-title']">
                    {{ t('sidebar.hintTitle') }}
                </h2>

                <p :class="$style['summary-page__text']">
                    {{ t('sidebar.hintText') }}
                </p>
            </section>
        </div>
    </section>
</template>

<script lang="ts" remote setup>
import type { LaneId, Task } from './types'

import { computed } from 'vue'
import { useField } from '@retailcrm/embed-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { watch } from 'vue'

import IconBoard from '@retailcrm/embed-ui-v1-components/assets/sprites/ui/format-bullets.svg'

import { assignees, createInitialBoard, laneOrder } from './fixtures'

const getInitials = (value: string) => {
    return value
        .split(' ')
        .map(part => part[0] || '')
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

const settings = useSettings()
const locale = useField(settings, 'system.locale')

settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, value => i18n.locale.value = value || 'ru-RU', { immediate: true })

const lanes = createInitialBoard()

const formatDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const todayKey = () => formatDateKey(new Date())

const isUrgent = (task: Task, laneId: LaneId) => laneId !== 'done' && task.dueDate <= todayKey()

const allTasks = computed(() => {
    return laneOrder.flatMap(laneId => lanes[laneId].map(task => ({ laneId, task })))
})

const totalTasks = computed(() => allTasks.value.length)
const urgentTasks = computed(() => allTasks.value.filter(item => isUrgent(item.task, item.laneId)).length)
const activeAssigneeCount = computed(() => {
    return new Set(
        allTasks.value
            .filter(item => item.laneId !== 'done')
            .map(item => item.task.assigneeId)
    ).size
})

const teamWorkload = computed(() => {
    return assignees.map(user => {
        let total = 0
        let urgent = 0

        for (const laneId of laneOrder) {
            const memberTasks = lanes[laneId].filter(task => task.assigneeId === user.id)

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

const busiestMember = computed(() => {
    return teamWorkload.value.reduce((current, member) => {
        return member.total > current.total ? member : current
    }, teamWorkload.value[0])
})
</script>

<style module lang="less">
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/variables.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/typography.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/geometry.less";
@import (reference) "~@retailcrm/embed-ui-v1-components/assets/stylesheets/palette.less";

.summary-page {
    .reset-box-sizing();

    display: flex;
    flex-direction: column;
    gap: @spacing-s;
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

    &__title {
        .h2-accent();
        margin: 0;
    }

    &__subtitle {
        .text-regular();
        margin: @spacing-xs 0 0;
        color: @grey-900;
    }

    &__hero-link {
        .text-small-accent();
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: @spacing-xxs;
        min-height: 40px;
        padding: 0 @spacing-s;
        color: @blue-600;
        text-decoration: none;
        background: white;
        border: 1px solid @grey-500;
        border-radius: @border-radius-md;
    }

    &__hero-link-icon {
        .square(16px);

        flex-shrink: 0;
        fill: currentColor;
    }

    &__metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: @spacing-s;
    }

    &__metric,
    &__panel {
        display: flex;
        flex-direction: column;
        gap: @spacing-s;
        padding: @spacing-s;
        background: white;
        border: 1px solid @grey-500;
        border-radius: @border-radius-lg;
    }

    &__metric-label,
    &__panel-caption {
        .text-small-accent();
        color: @grey-900;
    }

    &__metric-value {
        .h3-accent();
        margin: 0;
        color: @black-500;
    }

    &__layout {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: @spacing-s;
        align-items: start;
    }

    &__panel-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: @spacing-xs;
    }

    &__panel-title {
        .text-regular-accent();
        margin: 0;
    }

    &__team-list {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__team-item {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;
        padding: @spacing-xs;
        background: @grey-100;
        border-radius: @border-radius-md;
    }

    &__team-main {
        display: flex;
        align-items: center;
        gap: @spacing-xs;
    }

    &__team-avatar {
        .circle(32px);
        .text-small-accent();
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: @green-700;
        background: @green-transparent;
    }

    &__team-name {
        .text-small-accent();
        margin: 0;
        color: @black-500;
    }

    &__team-role,
    &__text {
        .text-small();
        margin: 0;
        color: @grey-900;
    }

    &__team-stats {
        display: flex;
        flex-wrap: wrap;
        gap: @spacing-xxs;
    }

    &__team-pill {
        .text-tiny-accent();
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        padding: 0 @spacing-xs;
        color: @blue-600;
        background: @blue-transparent;
        border-radius: @border-radius-md;
    }

    &__team-pill_alert {
        color: @red-700;
        background: @red-transparent;
    }

    @container (max-width: 960px) {
        &__metrics,
        &__layout {
            grid-template-columns: 1fr;
        }
    }

    @container (max-width: 680px) {
        &__hero {
            flex-direction: column;
        }
    }
}
</style>

<i18n locale="en-GB">
{
    "page": {
        "title": "Tasks summary",
        "subtitle": "A separate page for the CRM task board overview."
    },
    "actions": {
        "openBoard": "Open board"
    },
    "metrics": {
        "total": "Tasks in total",
        "urgent": "Urgent now",
        "busiest": "Most loaded"
    },
    "sidebar": {
        "teamTitle": "CRM users",
        "teamCaption": "{count} active assignees",
        "activeTasks": "{count} active",
        "urgentTasks": "{count} urgent",
        "hintTitle": "How to use it",
        "hintText": "Use this page as a compact summary, and open the board page when you need to reorder tasks."
    },
    "summary": {
        "title": "Current focus",
        "text": "{name} now has the highest active workload: {count} tasks."
    }
}
</i18n>

<i18n locale="es-ES">
{
    "page": {
        "title": "Resumen de tareas",
        "subtitle": "Una pagina separada para la vista resumida del tablero CRM."
    },
    "actions": {
        "openBoard": "Abrir tablero"
    },
    "metrics": {
        "total": "Tareas en total",
        "urgent": "Urgentes ahora",
        "busiest": "Mayor carga"
    },
    "sidebar": {
        "teamTitle": "Usuarios CRM",
        "teamCaption": "{count} responsables activos",
        "activeTasks": "{count} activas",
        "urgentTasks": "{count} urgentes",
        "hintTitle": "Como usarlo",
        "hintText": "Usa esta pagina como resumen compacto y abre el tablero cuando necesites reordenar tareas."
    },
    "summary": {
        "title": "Foco actual",
        "text": "{name} tiene ahora la mayor carga activa: {count} tareas."
    }
}
</i18n>

<i18n locale="ru-RU">
{
    "page": {
        "title": "Сводка по задачам",
        "subtitle": "Отдельная страница для краткого обзора доски задач CRM."
    },
    "actions": {
        "openBoard": "Открыть доску"
    },
    "metrics": {
        "total": "Всего задач",
        "urgent": "Горят сейчас",
        "busiest": "Самый загруженный"
    },
    "sidebar": {
        "teamTitle": "Команда CRM",
        "teamCaption": "Активных исполнителей: {count}",
        "activeTasks": "В работе: {count}",
        "urgentTasks": "Горят: {count}",
        "hintTitle": "Как использовать",
        "hintText": "Используйте эту страницу как компактную сводку, а доску открывайте, когда нужно переставлять задачи."
    },
    "summary": {
        "title": "Фокус сейчас",
        "text": "Сейчас самая высокая активная нагрузка у {name}: {count} задач."
    }
}
</i18n>
