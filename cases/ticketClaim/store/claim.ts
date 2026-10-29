import type { ComputedRef } from 'vue'
import type { useContext } from '@retailcrm/embed-ui-v1-contexts/remote/ticket/edit'

import type { Translate } from '../types'

import { computed, reactive, ref } from 'vue'
import { useActions } from '@retailcrm/embed-ui-v1-contexts/remote/ticket/edit'
import {
    useContext as useSettings,
} from '@retailcrm/embed-ui-v1-contexts/remote/ticket/edit-settings'
import {
    useContext as useTicket,
} from '@retailcrm/embed-ui-v1-contexts/remote/ticket/edit'
import { watch } from 'vue'

import { claimUnavailable, ticketIdentity } from '../domain'
import { useApplication } from './application'
import { useForm } from './form'
import { useOrderItems } from './orderItems'

const useSession = (
    ticket: ReturnType<typeof useContext>,
    form: ReturnType<typeof useForm>,
    catalog: ReturnType<typeof useOrderItems>,
    application: ReturnType<typeof useApplication>,
    unavailable: ComputedRef<boolean>
) => {
    const opened = ref(false)
    watch(() => ticketIdentity(ticket), () => {
        opened.value = false
        form.reset()
        catalog.reset()
        application.reset()
    })

    const open = () => {
        if (unavailable.value) return
        if (!application.state.plan || application.state.success) {
            application.reset()
            form.populate()
            void catalog.populate()
        }
        application.state.error = null
        opened.value = true
    }

    return { opened, open }
}

const usePreview = (
    form: ReturnType<typeof useForm>,
    application: ReturnType<typeof useApplication>,
    locked: ComputedRef<boolean>,
    t: Translate
) => () => {
    if (!locked.value && form.valid.value) application.prepare(form.createPlan(t))
}

const useState = () => {
    const ticket = useTicket()
    const settings = useSettings()
    const catalog = useOrderItems(ticket)
    const form = useForm(ticket, settings, catalog.state)
    const application = useApplication({ ticket, settings, actions: useActions() })
    const unavailable = computed(() => claimUnavailable(ticket, settings))
    const locked = computed(() => application.state.busy || catalog.state.loading || unavailable.value)
    const session = useSession(ticket, form, catalog, application, unavailable)

    return {
        ticket,
        settings,
        catalog,
        form,
        application,
        unavailable,
        locked,
        session,
    }
}

export const useClaim = (t: Translate) => {
    const state = useState()

    return reactive({
        ticket: state.ticket,
        permissions: state.settings,
        form: state.form.state,
        catalog: state.catalog.state,
        application: state.application.state,
        opened: state.session.opened,
        unavailable: state.unavailable,
        locked: state.locked,
        valid: state.form.valid,
        stale: state.application.stale,
        availableItems: state.form.availableItems,
        subtopics: state.form.subtopics,
        open: state.session.open,
        loadItems: state.catalog.populate,
        preview: usePreview(state.form, state.application, state.locked, t),
        apply: state.application.apply,
        back: state.application.dismiss,
    })
}
