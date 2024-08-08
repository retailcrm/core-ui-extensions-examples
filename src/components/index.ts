import { defineRemoteComponent } from '@omnicajs/vue-remote/remote'

const UiButton = defineRemoteComponent('UiButton')
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

const CrmPlacement = defineRemoteComponent('CrmPlacement')

export {
    UiButton,
    UiModalWindow,
    CrmYandexMap,
    CrmPlacement,
}
