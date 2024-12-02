<template>
    <UiToolbarButton @click="opened = true">
        <template v-if="count">
            {{ t('orderNotes') }} ({{ count }})
        </template>

        <template v-else>
            {{ t('orderNotes') }}

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
            {{ t('orderNotes') }}
        </template>

        <UiLoader :class="{ [$style.hide]: !loading }" :overlay="false" />

        <div :class="{ [$style.hide]: loading }">
            <UiError
                v-for="(error, index) in errors"
                :key="index"
                :message="error"
            />

            <template v-if="errors.length === 0">
                <form :class="$style.form">
                    <div :class="$style.avatar" />
                
                    <textarea
                        :class="$style.form__area"
                        :value="text"
                        @input="onInput"
                    />

                    <UiButton
                        :class="$style.form__button"
                        @click="onSubmit"
                    >
                        {{ t('send') }}
                    </UiButton>
                </form>

                <div
                    v-for="note in notes"
                    :key="note.id"
                    :class="$style.note"
                >
                    <div :class="$style.author">
                        <div :class="$style.avatar" />

                        <div>
                            <UiLink :class="$style.author__name" size="small">
                                {{ note.author }}
                            </UiLink>

                            <div :class="$style.date">
                                {{ formatDate(note.date) }}
                            </div>
                        </div>
                    </div>

                    <div :class="$style.note__text">
                        {{ note.text }}
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
    UiError,
    UiLink,
    UiLoader,
    UiModalSidebar,
    UiToolbarButton,
} from '@retailcrm/embed-ui-v1-components/remote'

import { onMounted, watch, ref } from 'vue'
import { onSerializedEvent } from './serialized'

import { useI18n } from 'vue-i18n'

import {
    useHost,
    useField,
    useSettingsContext,
    useOrderCardContext,
    useCurrentUserContext,
} from '@retailcrm/embed-ui'

type Note = {
    id: number;
    author: string;
    date: Date;
    text: string;
}

// set locale
const settings = useSettingsContext()
const locale = useField(settings, 'system.locale')
settings.initialize()

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

const host = useHost()

// order fields
const order = useOrderCardContext()
const orderId = useField(order, 'id')
order.initialize()

// user fields
const user = useCurrentUserContext()
const userFirstName = useField(user, 'firstName')
const userLastName = useField(user, 'lastName')
user.initialize()

// data
const opened = ref(false)
const loading = ref(false)
const count = ref('')
const notes = ref<Array<Note>>([])
const errors = ref<string[]>([])
const text = ref('')

const formatDate = (date: string | Date): string => {
    const d = new Date(date)

    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()

    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')

    return `${day}.${month}.${year} ${hours}:${minutes}`
}

const onSidebarOpened = async (opened: boolean) => {
    if (!opened) {
        return
    }

    loading.value = true

    const { body, status } = await host.httpCall('/notes', { order_id: orderId.value })
    if (status === 200) {
        notes.value = JSON.parse(body).notes as Array<Note>
    } else {
        errors.value = ['Error of loading: ' + body]
    }

    loading.value = false
}

const onInput = onSerializedEvent<InputEvent>((event) => {
    text.value = event.target.value
})

const onSubmit = async () => {
    const data: Note = {
        id: 3,
        author: `${userFirstName.value?.trim() || ''} ${userLastName.value?.trim() || ''}`.trim(),
        date: new Date(),
        text: text.value,
    }

    const { body, status } = await host.httpCall('/notes/new', {
        order_id: orderId.value,
        note: data,
    })

    if (status === 200) {
        notes.value = JSON.parse(body).notes as Array<Note>

        text.value = ''
    } else {
        errors.value = ['Error of loading: ' + body]
    }
}

onMounted(async () => {
    loading.value = true

    const { body, status } = await host.httpCall('/notes-count')

    count.value = status === 200
        ? JSON.parse(body).count.toString()
        : 'ERR#' + status;

    loading.value = false
})
</script>

<i18n locale="en-GB">
{
    "orderNotes": "Order notes",
    "send": "Send",
    "close": "Close"
}
</i18n>

<i18n locale="es-ES">
{
    "orderNotes": "Notas del pedido",
    "send": "Enviar",
    "close": "Cerrar"
}
</i18n>

<i18n locale="ru-RU">
{
    "orderNotes": "Заметки по заказу",
    "send": "Отправить",
    "close": "Закрыть"
}
</i18n>

<style lang="less" module>
.hide {
    display: none !important;
}

.form {
    margin-bottom: 36px;
    display: grid;
    grid-template-columns: 36px 1fr;
    grid-gap: 8px;
    row-gap: 16px;

    &__area {
        flex-grow: 1;
        min-height: 200px;
    }

    &__button {
        grid-column: 2;
        grid-row: 2;
        justify-self: start;
    }
}

.avatar {
    width: 36px;
    height: 36px;
    background-color: #dee2e6;
    border-radius: 50%;
}

.note {
    &__text {
        margin-top: 8px;
        font-size: 14px;
        line-height: 1.42857143;
    }

    & + & {
        margin-top: 24px;
    }
}

.author {
    display: flex;
    align-items: center;
    grid-gap: 8px;

    &__name {
        font-size: 14px;
        line-height: 1.42857143;
    }
}

.date {
    font-size: 12px;
    line-height: 1.16666667;
    color: #8a96a6;
}
</style>
