<template>
    <UiToolbarButton @click="opened = true">
        <template v-if="count">
            {{ t('orderNotes') }} ({{ count }})
        </template>

        <template v-else>
            {{ t('orderNotes') }} <IconLoader aria-hidden="true" />
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
                    <UiAvatar
                        :src="userPhoto || ''"
                        :name="userFullName"
                        :href="router.generate('crm_users_edit', { id: userId })"
                    />

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
                        <UiAvatar
                            :src="note.author.avatar"
                            :name="note.author.name"
                        />

                        <div>
                            <!-- ID автора, используемый здесь, не настоящий. -->
                            <!-- В реальном расширении нужно использовать ID реально пользователя системы. -->
                            <UiLink
                                :href="user.isAdmin
                                    ? router.generate('crm_users_edit', { id: note.author.id })
                                    : router.generate('crm_manager_show', { id: note.author.id })
                                "
                                :class="$style.author__name"
                                size="small"
                            >
                                {{ note.author.name }}
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
    UiAvatar,
    UiButton,
    UiError,
    UiLink,
    UiLoader,
    UiModalSidebar,
    UiToolbarButton,
} from '@retailcrm/embed-ui-v1-components/remote'

import {
    computed,
    onMounted,
    ref,
    watch,
} from 'vue'

import { formatDate } from '@retailcrm/embed-ui-v1-components/remote'

import { useI18n } from 'vue-i18n'

import { useOrderCardContext as useOrder } from '@retailcrm/embed-ui'
import { useSettingsContext as useSettings } from '@retailcrm/embed-ui'
import { useCurrentUserContext as useUser } from '@retailcrm/embed-ui'

import { useField, useHost, useRouter } from '@retailcrm/embed-ui'

import IconLoader from './loader.svg'

import { onSerializedEvent } from './serialized'

type Note = {
    id: number;
    author: {
      id: number;
      name: string;
      avatar: string;
    };
    date: Date;
    text: string;
}

// set locale
const settings = useSettings()
const locale = useField(settings, 'system.locale')

const i18n = useI18n()
const t = i18n.t

watch(locale, locale => i18n.locale.value = locale, { immediate: true })

const host = useHost()

const router = useRouter()

// order fields
const order = useOrder()
const orderId = useField(order, 'id')

// user fields
const user = useUser()
const userId = useField(user, 'id')
const userFirstName = useField(user, 'firstName')
const userLastName = useField(user, 'lastName')
const userFullName = computed(() => `${userFirstName.value?.trim() || ''} ${userLastName.value?.trim() || ''}`.trim())
const userPhoto = useField(user, 'photo')

// data
const opened = ref(false)
const loading = ref(false)
const count = ref('')
const notes = ref<Note[]>([])
const errors = ref<string[]>([])
const text = ref('')

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
    if (!userId.value) {
        return
    }

    const data: Note = {
        id: 3,
        author: {
            id: userId.value,
            name: userFullName.value,
            avatar: userPhoto.value ?? '',
        },
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
