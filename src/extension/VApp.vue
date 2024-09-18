<template>
    <!-- Расширение с кнопками перехода в мессенджеры -->
    <CrmPlacement
        v-for="placement in customerPhonePlacement"
        :key="placement.id"
        :placement-id="placement.id"
    >
        <CustomerPhoneExtension
            v-if="placement?.context?.phone"
            :scope="scope"
            :phone="placement.context.phone"
        />
    </CrmPlacement>

    <!-- Расширение с картой -->
    <CrmPlacement
        v-if="addressDeliveryPlacement?.length === 1"
        :placement-id="addressDeliveryPlacement[0].id"
    >
        <AddressExtension
            :api="{
                setDeliveryAddress: api.setDeliveryAddress,
                getDeliveryAddress: api.getDeliveryAddress,
            }"
        />
    </CrmPlacement>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { onMounted, ref } from 'vue'
import { inject } from 'vue'
import CustomerPhoneExtension from './CustomerPhoneExtension.vue';
import AddressExtension from './AddressExtension.vue';

import {
    CrmPlacement,
} from '@/components'

interface IPlacementContext {
    phone?: string
    address?: string
}

interface IPlacement {
    id: string,
    context: IPlacementContext
}

const props = defineProps({
    api: {
        type: Object as PropType<{
            getPlacement (placementName: string, scope: string): IPlacement[];
            setDeliveryAddress (value: string): void;
            getDeliveryAddress (): Promise<string | null>;
        }>,
        required: true,
    },
    scope: {
        type: String,
        default: '',
    },
})

const hostEventListener = inject('hostEventListener')
const customerPhonePlacement = ref(null as unknown as IPlacement[])
const addressDeliveryPlacement = ref(null as unknown as IPlacement[])

const onNewPlacement = async (): Promise<void> => {
    customerPhonePlacement.value = await props.api.getPlacement('customer-phone', props.scope)
}

onMounted(async () => {
    customerPhonePlacement.value = await props.api.getPlacement('customer-phone', props.scope)
    addressDeliveryPlacement.value = await props.api.getPlacement('delivery-address', props.scope)

    // @ts-expect-error hostEventListener
    hostEventListener('new-placement', onNewPlacement)
})
</script>
