import type { useActions } from '@retailcrm/embed-ui-v1-contexts/remote/ticket/view'

import type {
    ApplicationError,
    EscalationPlan,
    Step,
    Ticket,
    TicketSettings,
} from '../types'

import { onScopeDispose, reactive } from 'vue'

import { escalationPlanIsStale, escalationWritable, ticketUnavailable } from '../domain'

class CompletedStepChanged extends Error {}

type Source = {
    ticket: Ticket;
    settings: TicketSettings;
    actions: ReturnType<typeof useActions>;
}

const createState = () => reactive({
    plan: null as EscalationPlan | null,
    completed: [] as string[],
    busy: false,
    success: false,
    error: null as ApplicationError | null,
})

type State = ReturnType<typeof createState>

const reset = (state: State) => {
    Object.assign(state, { plan: null, completed: [], busy: false, success: false, error: null })
}

const verifyCompleted = ({ ticket }: Source, state: State, plan: EscalationPlan) => {
    for (const issue of plan.issues) {
        const actual = ticket.issues.find(item => item.id === issue.id)
        if (!actual) throw new CompletedStepChanged()
        if (state.completed.includes(`responsible:${issue.id}`)
            && (actual.responsible?.kind !== 'user' || actual.responsible.id !== plan.recipient.id)) throw new CompletedStepChanged()
        if (state.completed.includes(`status:${issue.id}`) && actual.status?.id !== plan.statusId) throw new CompletedStepChanged()
    }
}

const ensureCurrent = (source: Source, state: State, plan: EscalationPlan) => {
    if (state.plan !== plan || source.ticket.id !== plan.ticketId || ticketUnavailable(source.ticket) || !escalationWritable(source.settings)) {
        throw new Error('Ticket changed')
    }
    verifyCompleted(source, state, plan)
}

const createStep = (source: Source, state: State, plan: EscalationPlan): Step => async (key, operation) => {
    ensureCurrent(source, state, plan)
    if (state.completed.includes(key)) return
    await operation()
    if (state.plan !== plan) throw new Error('Ticket changed')
    state.completed.push(key)
}

const assignQuestions = async ({ ticket, actions }: Source, plan: EscalationPlan, step: Step) => {
    for (const issue of plan.issues) {
        const actual = ticket.issues.find(item => item.id === issue.id)
        if (!actual) throw new Error('Question removed')
        await step(`responsible:${issue.id}`, () => actual.responsible?.kind === 'user' && actual.responsible.id === plan.recipient.id
            ? Promise.resolve() : actions.changeIssueResponsible(issue.id, { kind: 'user', id: plan.recipient.id }))
        await step(`status:${issue.id}`, () => actual.status?.id === plan.statusId
            ? Promise.resolve() : actions.changeIssueStatus(issue.id, plan.statusId))
    }
}

const apply = async (source: Source, state: State) => {
    const plan = state.plan
    if (!plan || state.busy || state.success || ticketUnavailable(source.ticket) || !escalationWritable(source.settings)) return
    if (!state.completed.length && escalationPlanIsStale(plan, source.ticket)) {
        state.plan = null
        state.error = 'failed'
        return
    }
    state.busy = true
    state.error = null
    const step = createStep(source, state, plan)

    try {
        await assignQuestions(source, plan, step)
        await step('comment', () => source.actions.createComment(plan.comment))
        ensureCurrent(source, state, plan)
        state.success = true
    } catch (error) {
        if (state.plan === plan) state.error = error instanceof CompletedStepChanged ? 'conflict' : state.completed.length ? 'partialFailed' : 'failed'
    } finally {
        if (state.plan === plan) state.busy = false
    }
}

export const useApplication = (source: Source) => {
    const state = createState()
    onScopeDispose(() => reset(state))

    return {
        state,
        reset: () => reset(state),
        dismiss: () => {
            if (!state.busy && !state.completed.length) reset(state)
        },
        prepare: (plan: EscalationPlan) => {
            reset(state)
            state.plan = plan
        },
        apply: () => apply(source, state),
    }
}
