import type { ComputedRef } from 'vue'
import type { useActions } from '@retailcrm/embed-ui-v1-contexts/remote/ticket/view'

import type { Ticket, Translate } from '../types'

import { computed, reactive, ref } from 'vue'
import { useContext } from '@retailcrm/embed-ui-v1-contexts/remote/ticket/view'
import {
    useContext as useSettings,
} from '@retailcrm/embed-ui-v1-contexts/remote/ticket/view-settings'
import {
    useActions as useTicketActions,
} from '@retailcrm/embed-ui-v1-contexts/remote/ticket/view'
import { watch } from 'vue'

import { escalationWritable, ticketUnavailable } from '../domain'
import { useApplication } from './application'
import { useForm } from './form'
import { useRecipients } from './recipients'

const useHistory = (ticket: Ticket, actions: ReturnType<typeof useActions>) => {
    const state = reactive({ pending: false, failed: false })
    const open = async () => {
        if (state.pending || ticketUnavailable(ticket)) return
        state.pending = true
        state.failed = false
        try {
            await actions.openTicketHistory()
        } catch {
            state.failed = true
        } finally {
            state.pending = false
        }
    }

    return { state, open }
}

const useSession = ({ ticket, form, catalog, application, unavailable, writable }: {
    ticket: Ticket;
    form: ReturnType<typeof useForm>;
    catalog: ReturnType<typeof useRecipients>;
    application: ReturnType<typeof useApplication>;
    unavailable: ComputedRef<boolean>;
    writable: ComputedRef<boolean>;
}) => {
    const opened = ref(false)
    watch(() => ticket.id, () => {
        opened.value = false
        application.reset()
        form.reset()
        catalog.reset()
    })

    const open = () => {
        if (unavailable.value) return
        if (application.state.success) {
            application.reset()
            form.clearSummary()
        }
        application.state.error = null
        opened.value = true
        if (!catalog.state.items.length && writable.value) void catalog.populate()
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

const useNavigation = (
    history: ReturnType<typeof useHistory>,
    application: ReturnType<typeof useApplication>,
    session: ReturnType<typeof useSession>
) => {
    const open = () => {
        history.state.failed = false
        session.open()
    }
    const openHistory = () => {
        if (!application.state.busy) return history.open()
    }

    return { open, openHistory }
}

const useState = () => {
    const ticket = useContext()
    const settings = useSettings()
    const actions = useTicketActions()
    const catalog = useRecipients(ticket)
    const form = useForm(ticket, settings, catalog.state)
    const application = useApplication({ ticket, settings, actions })
    const history = useHistory(ticket, actions)
    const unavailable = computed(() => ticketUnavailable(ticket))
    const writable = computed(() => escalationWritable(settings))
    const locked = computed(() => application.state.busy || history.state.pending || catalog.state.loading || unavailable.value || !writable.value)
    const busy = computed(() => application.state.busy || history.state.pending)
    const session = useSession({ ticket, form, catalog, application, unavailable, writable })

    return {
        ticket,
        settings,
        catalog,
        form,
        application,
        history,
        unavailable,
        writable,
        locked,
        busy,
        session,
        ...useNavigation(history, application, session),
    }
}

export const useEscalation = (t: Translate) => {
    const state = useState()

    return reactive({
        ticket: state.ticket,
        permissions: state.settings,
        form: state.form.state,
        catalog: state.catalog.state,
        application: state.application.state,
        history: state.history.state,
        busy: state.busy,
        opened: state.session.opened,
        unavailable: state.unavailable,
        writable: state.writable,
        locked: state.locked,
        valid: state.form.valid,
        open: state.open,
        loadRecipients: state.catalog.populate,
        preview: usePreview(state.form, state.application, state.locked, t),
        apply: state.application.apply,
        back: state.application.dismiss,
        openHistory: state.openHistory,
    })
}
