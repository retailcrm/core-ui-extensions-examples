import { waitFor } from '@testing-library/dom'

type Coordinates = {
    clientX: number;
    clientY: number;
}

const pointer = (
    type: string,
    coordinates: Coordinates,
    options: Partial<PointerEventInit> = {}
) => new PointerEvent(type, {
    bubbles: true,
    button: 0,
    clientX: coordinates.clientX,
    clientY: coordinates.clientY,
    composed: true,
    isPrimary: true,
    pointerId: 7,
    pointerType: 'mouse',
    ...options,
})

const center = (element: Element): Coordinates => {
    const rect = element.getBoundingClientRect()
    const left = Math.max(rect.left, 1)
    const right = Math.min(rect.right, window.innerWidth - 1)
    const top = Math.max(rect.top, 1)
    const bottom = Math.min(rect.bottom, window.innerHeight - 1)

    return {
        clientX: left + Math.max(0, right - left) / 2,
        clientY: top + Math.max(0, bottom - top) / 2,
    }
}

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

const waitForAttribute = async (
    element: HTMLElement,
    attribute: string
) => {
    await waitFor(() => {
        if (element.getAttribute(attribute) !== 'true') {
            throw new Error(`Element did not receive ${attribute}.`)
        }
    })
}

export const dragTo = async (handle: HTMLElement, target: HTMLElement) => {
    handle.scrollIntoView({ block: 'center', inline: 'center' })
    await nextFrame()

    const start = center(handle)

    handle.dispatchEvent(pointer('pointerdown', start))
    document.dispatchEvent(pointer('pointermove', {
        clientX: start.clientX + 10,
        clientY: start.clientY + 10,
    }))

    const source = handle.closest('[data-dnd-sortable-item="true"]')

    if (!(source instanceof HTMLElement)) {
        throw new Error('Sortable source was not rendered.')
    }

    await waitForAttribute(source, 'data-dnd-dragging')

    target.scrollIntoView({ block: 'center', inline: 'center' })
    await nextFrame()

    const end = center(target)

    document.dispatchEvent(pointer('pointermove', end))
    await waitForAttribute(target, 'data-dnd-drag-over')

    document.dispatchEvent(pointer('pointerup', end))
    await nextFrame()
}

export const getSortableContainer = (heading: HTMLElement): HTMLElement => {
    const column = heading.closest('article')
    const container = column?.querySelector('[data-dnd-sortable-container="true"]')

    if (!(container instanceof HTMLElement)) {
        throw new Error('Sortable container was not rendered.')
    }

    return container
}

export const getDragHandle = (cardTitle: HTMLElement): HTMLButtonElement => {
    const card = cardTitle.closest('article')
    const handle = card?.querySelector('[data-dnd-handle="true"]')

    if (!(handle instanceof HTMLButtonElement)) {
        throw new Error('Drag handle was not rendered.')
    }

    return handle
}
