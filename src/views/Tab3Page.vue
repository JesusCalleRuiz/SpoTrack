<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mis Rutas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Mis Rutas</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-card v-for="(route) in routes" :key="route.id">
        <div :id="`map-${route.id}`" class="map-container"></div>
        <ion-card-header>
          <ion-card-title>{{ route.name }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <p>Fecha: {{ new Date(route.created_at).toLocaleString() }}</p>
          <p>Distancia: {{ route.distance }} Tiempo: {{ route.duration }}</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/vue';
import { ref, onMounted, nextTick } from 'vue';
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';

interface Route {
  id: number;
  name: string;
  created_at: string;
  distance: string;
  duration: string;
  path: { lat: number; lng: number }[];
}

const routes = ref<Route[]>([]);

const fetchRoutes = async (userId: string) => {
  try {
    const response = await axios.get(`https://spotrack.dev-alicenter.es/api/routes/${userId}`);
    routes.value = response.data;
  } catch (error) {
    console.error('Error fetching routes:', error);
  }
};

const createMapForRoute = (routeId: number, path: { lat: number; lng: number }[]) => {
  const start = path[0];
  const map = new mapboxgl.Map({
    container: `map-${routeId}`,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [start.lng, start.lat],
    zoom: 15,
  });

  const routeCoords = path.map(coord => [coord.lng, coord.lat]);
  map.on('load', () => {
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: routeCoords
        }
      }
    });
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#ff0000', 'line-width': 3 }
    });
  });
};

onMounted(() => {
  fetchRoutes('1').then(() => {
    nextTick(() => {
      routes.value.forEach(route => {
        createMapForRoute(route.id, route.path);
      });
    });
  });
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 200px;
}
</style>




