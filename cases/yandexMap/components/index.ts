import { defineRemoteComponent } from '@omnicajs/vue-remote/remote'

const CrmYandexMap = defineRemoteComponent('CrmYandexMap', [
    'change',
] as unknown as {
    'change': (address: string) => void,
})

export {
    CrmYandexMap,
}
