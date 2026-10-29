import type { ContextAccessor } from '@retailcrm/embed-ui-v1-types/context'
import type { Endpoint } from '@remote-ui/rpc'
import type { Schema } from '@retailcrm/embed-ui-v1-contexts/types/ticket/edit'
import type {
    useActions,
    useContext,
} from '@retailcrm/embed-ui-v1-contexts/remote/ticket/edit'

import type {
    ApplicationError,
    ClaimPlan,
    Step,
    TicketSettings,
} from '../types'

import { computed, onScopeDispose, reactive } from 'vue'

import { claimPlanIsStale, claimUnavailable, ticketIdentity } from '../domain'

class CompletedStepChanged extends Error {}

type Source = {
    ticket: ReturnType<typeof useContext>;
    settings: TicketSettings;
    actions: ReturnType<typeof useActions>;
}

const createState = () => reactive({
    plan: null as ClaimPlan | null,
    targetKey: null as string | null,
    completed: [] as string[],
    busy: false,
    success: false,
    error: null as ApplicationError | null,
})

type State = ReturnType<typeof createState>

const reset = (state: State) => {
    Object.assign(state, { plan: null, targetKey: null, completed: [], busy: false, success: false, error: null })
}

const verifyCompleted = ({ ticket }: Source, state: State, plan: ClaimPlan) => {
    const issue = ticket.issues.find(issue => issue.key === state.targetKey)
    if (state.completed.includes('issue') && !issue) throw new CompletedStepChanged()
    if (state.completed.includes('classification') && (issue?.type?.id !== plan.typeId || issue.subtopic?.id !== plan.subtopicId)) {
        throw new CompletedStepChanged()
    }
    if (plan.orderItems.some(item => state.completed.includes(`item:${item.id}`) && !ticket.orderItems.some(linked => linked.id === item.id))) {
        throw new CompletedStepChanged()
    }
}

const ensureCurrent = (source: Source, state: State, plan: ClaimPlan) => {
    const { ticket, settings } = source
    if (state.plan !== plan || ticketIdentity(ticket) !== plan.identity || claimUnavailable(ticket, settings)
        || !ticket.orders.some(order => order.id === plan.orderId)
        || (ticket.description !== plan.originalDescription && ticket.description !== plan.description)) {
        throw new Error('Draft changed since preview')
    }
    verifyCompleted(source, state, plan)
}

const createStep = (source: Source, state: State, plan: ClaimPlan): Step => async (key, operation) => {
    ensureCurrent(source, state, plan)
    if (state.completed.includes(key)) return
    await operation()
    if (state.plan !== plan) throw new Error('Draft changed')
    state.completed.push(key)
}

const prepareQuestion = async ({ actions }: Source, state: State, plan: ClaimPlan, step: Step) => {
    await step('issue', async () => {
        state.targetKey = plan.issue?.key ?? await actions.addIssue()
    })
    await step('classification', () => actions.updateIssue(state.targetKey!, { typeId: plan.typeId, subtopicId: plan.subtopicId }))
}

const linkOrderItems = async ({ ticket, actions }: Source, plan: ClaimPlan, step: Step) => {
    for (const item of plan.orderItems) {
        await step(`item:${item.id}`, () => ticket.orderItems.some(linked => linked.id === item.id)
            ? Promise.resolve() : actions.addOrderItem(item.id))
    }
}

const writeDescription = async (source: Source, state: State, plan: ClaimPlan, step: Step) => {
    const { ticket } = source
    const endpoint = ticket.endpoint as Endpoint<ContextAccessor<{ 'ticket/edit': Schema }>>

    await step('description', async () => {
        if (ticket.description === plan.description) return
        let rejected = false
        // Await the public RPC: context.set() does not acknowledge optimistic writes.
        await endpoint.call.set('ticket/edit', 'description', plan.description, () => { rejected = true })
        const actual = await endpoint.call.get('ticket/edit', 'description')
        ensureCurrent(source, state, plan)
        if (typeof actual === 'string') ticket.description = actual
        if (rejected || actual !== plan.description) throw new Error('Description rejected')
    })
}

const apply = async (source: Source, state: State) => {
    const plan = state.plan
    if (!plan || state.busy || state.success || claimUnavailable(source.ticket, source.settings)) return
    if (!state.completed.length && claimPlanIsStale(plan, source.ticket)) return
    state.busy = true
    state.error = null
    const step = createStep(source, state, plan)

    try {
        ensureCurrent(source, state, plan)
        await prepareQuestion(source, state, plan, step)
        await linkOrderItems(source, plan, step)
        await writeDescription(source, state, plan, step)
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
    const stale = computed(() => !!state.plan && !state.completed.length && claimPlanIsStale(state.plan, source.ticket))
    onScopeDispose(() => reset(state))

    return {
        state,
        stale,
        reset: () => reset(state),
        dismiss: () => {
            if (!state.busy && !state.completed.length) reset(state)
        },
        prepare: (plan: ClaimPlan) => {
            reset(state)
            state.plan = plan
        },
        apply: () => apply(source, state),
    }
}
