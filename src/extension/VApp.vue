<template>
    <!-- Расширение с кнопками перехода в мессенджеры -->
    <CrmPlacement
        v-for="placement in customerPhonePlacement"
        :key="placement.id"
        :placement-id="placement.id"
    >
        <CustomerPhoneExtension
            v-if="placement?.context?.phone"
            :scopes="props.scopes"
            :phone="placement.context.phone"
        />
    </CrmPlacement>

    <!-- Расширение с картой -->
    <CrmPlacement
        v-if="addressDeliveryPlacement?.length === 1"
        :placement-id="addressDeliveryPlacement[0].id"
    >
        <AddressExtension
            :api="orderApi"
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
            getScopeMethods (scope: string): {
                setDeliveryAddress (value: string): void;
                getDeliveryAddress (): Promise<string | null>;
            };
        }>,
        required: true,
    },

    scopes: {
        type: Array as PropType<string[]>,
        required: true,
    },
})

let orderApi = {}

const hostEventListener = inject('hostEventListener')
const customerPhonePlacement = ref(null as unknown as IPlacement[])
const addressDeliveryPlacement = ref(null as unknown as IPlacement[])

const onNewPlacement = async (placement: {id: string[], name: string, scope: string}): Promise<void> => {
    if (placement.name === 'customer-phone') {
        customerPhonePlacement.value = await props.api.getPlacement('customer-phone', placement.scope)
    }

    if (placement.name === 'delivery-address') {
        orderApi = await props.api.getScopeMethods(placement.scope)
        addressDeliveryPlacement.value = await props.api.getPlacement('delivery-address', placement.scope)
    }
}

onMounted(async () => {
    // @ts-expect-error hostEventListener
    hostEventListener('new-placement', onNewPlacement)
})
</script>
