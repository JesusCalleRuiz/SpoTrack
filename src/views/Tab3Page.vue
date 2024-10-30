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



const fetchRoutes = async (userId : string) => {
  try {
    const response = await fetch(`https://spotrack.dev-alicenter.es/api/route/${userId}`);
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      routes.value = data.data.map((route : any) => ({
        ...route,
        path: JSON.parse(route.path)
      }));
      await nextTick();
      routes.value.forEach(route => initMap(route));
    } else {
      console.error('Error al obtener las rutas');
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
};

const userId = '1';
onMounted(() => {
  fetchRoutes(userId);
});

const initMap = (route : Route) => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const coordinates : number[][] = route.path.map((coord: { lat: number; lng: number }) => [coord.lng, coord.lat]);

  const bounds = new mapboxgl.LngLatBounds();
  coordinates.forEach((coord) => {
    bounds.extend(coord);
  });

  const map = new mapboxgl.Map({
    container: `map-${route.id}`,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [route.path[0].lng, route.path[0].lat],
    zoom: 15,
    interactive: false
  });

  map.on('load', () => {
    map.addLayer({
      'id': `route-${route.id}`,
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': coordinates
          }
        } as GeoJSON.Feature<GeoJSON.Geometry>,
      },
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#ff0000',
        'line-width': 4
      }
    });

    map.fitBounds(bounds, { padding: 100 });
  });
};
</script>

<style>
.map-container {
  width: 100%;
  height: 250px;
}
</style>




