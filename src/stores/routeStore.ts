import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRouteStore = defineStore('routeStore', () => {
    const routeCoordinates = ref<{ lat: number; lng: number }[]>([]);
    const distancia = ref('');
    const tiempo = ref('');
    const ritmo = ref('');

    const resetTrackingData = () => {
        routeCoordinates.value = [];
        distancia.value = '';
        tiempo.value = '';
        ritmo.value = '';
    };

    return {
        routeCoordinates,
        distancia,
        tiempo,
        ritmo,
        resetTrackingData,
    };
});
