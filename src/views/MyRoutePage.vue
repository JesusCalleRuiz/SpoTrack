<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ routeData?.name }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="map2" class="map2-container"></div>
      <div class="info" v-if="routeData">
        <p>Fecha: {{ new Date(routeData.created_at).toLocaleString() }}</p>
        <p>Descrición: {{ routeData.description }}</p>
        <p>Ritmo: {{ routeData.pace }}</p>
        <p>Deporte: {{ routeData.sport }}</p>
        <p>Distancia: {{ routeData.distance }}</p>
        <p>Tiempo: {{ routeData.duration }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface RouteData {
  name: string;
  created_at: string;
  distance: string;
  duration: string;
  path: { lat: number; lng: number }[];
  pace: string;
  sport: string;
  description: string;
}

const route = useRoute();
const routeData = ref<RouteData | null>(null);

if (route.params.route) {
  try {
    routeData.value = JSON.parse(route.params.route as string) as RouteData;
  } catch (error) {
    console.error('Error en los datos de la ruta:', error);
    routeData.value = null;
  }
}

const initMap = () => {
  if (!routeData.value) return;

  const coordinates : Array<[number, number]> = routeData.value.path.map((coord: { lat: number; lng: number }) => [coord.lng, coord.lat]);
  const bounds = new mapboxgl.LngLatBounds();
  coordinates.forEach((coord) => {
    bounds.extend(coord);
  });
  //console.log(coordinates)
  const map2 = new mapboxgl.Map({
    container: 'map2',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [routeData.value.path[0].lng, routeData.value.path[0].lat],
    zoom: 15
  });
  map2.on('load', () => {
    map2.resize();
    map2.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates
          },
          properties: {}
        } as GeoJSON.Feature<GeoJSON.Geometry>,
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ff0000',
        'line-width': 8,
        'line-opacity': 0.8
      }
    });
    map2.fitBounds(bounds, { padding: 50 });

    const start = routeData.value?.path[0] ?? { lat: 0, lng: 0 };
    const end = routeData.value?.path[routeData.value?.path.length - 1] ?? { lat: 0, lng: 0 };


    new mapboxgl.Marker({ color: "#04ff00" })
        .setLngLat([start.lng ?? 0, start.lat ?? 0])
        .addTo(map2);

    new mapboxgl.Marker({ color: "#000000" })
        .setLngLat([end.lng ?? 0, end.lat ?? 0])
        .addTo(map2);
  });
};

onMounted(() => {
  try {
    initMap();
  } catch (error) {
    console.error('Error en onMounted:', error);
  }
});

</script>

<style scoped>
.map2-container {
  width: 100%;
  height: 70%;
  position: relative;
}
.info {
  text-align: center;
  position: absolute;
  margin-top: 20px;
  width: 100%;
  color: white;
  font-size: 24px;
}
</style>

