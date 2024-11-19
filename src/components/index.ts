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

const UiModalWindow = defineRemoteComponent('UiModalWindow', [
    'update:opened',
] as unknown as {
    'update:opened': (opened: boolean) => void,
}, [
    'title',
    'footer',
])

const CrmYandexMap = defineRemoteComponent('CrmYandexMap', [
    'change',
] as unknown as {
    'change': (address: string) => void,
})

export {
    CrmYandexMap,
    UiButton,
    UiLink,
    UiLoader,
    UiError,
    UiModalSidebar,
    UiModalWindow,
}
