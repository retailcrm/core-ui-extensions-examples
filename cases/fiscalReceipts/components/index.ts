import { defineRemoteComponent } from '@omnicajs/vue-remote/remote'

const UiButton = defineRemoteComponent('UiButton')
const UiLink = defineRemoteComponent('UiLink', undefined, [
    'icon',
])
const UiLoader = defineRemoteComponent('UiLoader')
const UiError = defineRemoteComponent('UiError')

const UiModalSidebar = defineRemoteComponent('UiModalSidebar', [
    'update:opened',
    'open',
] as unknown as {
    'update:opened': (opened: boolean) => void,
    'open': () => void,
}, [
    'title',
    'footer',
])

export {
    UiButton,
    UiLink,
    UiLoader,
    UiError,
    UiModalSidebar,
}
