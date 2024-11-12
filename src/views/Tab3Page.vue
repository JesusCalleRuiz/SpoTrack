<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon aria-hidden="true" :icon="arrowBack" />
          </ion-button>
        </ion-buttons>

        <ion-title>Mis Rutas</ion-title>

      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="reloadPage">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-card @click="goToMyRoutePage(route)" v-for="(route) in routes" :key="route.id">
        <img :src="getImage(route)" alt="Ruta de mapa" class="map-container" />

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
  IonCardTitle,
  IonIcon,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonButton
} from '@ionic/vue';
import {ref, onMounted, nextTick} from 'vue';
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'vue-router';
import {arrowBack} from "ionicons/icons";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const router = useRouter();



const goToMyRoutePage = (route: Route) => {
  router.push({
    path: `/route/${JSON.stringify(route)}`
  });
};

const reloadPage = () => {
  window.location.reload();
};

const goBack = () => {
  router.back();
};

interface Route {
  id: number;
  name: string;
  created_at: string;
  distance: string;
  duration: string;
  path: { lat: number; lng: number }[];
}

const routes = ref<Route[]>([]);

const fetchRoutes = async () => {
  try {
    const response = await fetch(`https://spotrack.dev-alicenter.es/api/route`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      routes.value = data.data.map((route) => ({
        ...route,
        path: JSON.parse(route.path),
      }));
      await nextTick();
      routes.value.forEach(route => getImage(route));
    } else {
      console.error('Error al obtener las rutas:', response.statusText);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
};

onMounted(() => {
  fetchRoutes();
});

const getImage = (route: Route) => {

  const coordinates = route.path.map(coord => [coord.lng, coord.lat]);

  const lats = coordinates.map(c => c[1]);
  const lngs = coordinates.map(c => c[0]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  //console.log("minlat:"+minLat);
  //console.log("maxlat:"+maxLat);
  //console.log("minlng:"+minLng);
  //console.log("maxLng:"+maxLng);

  const start = route.path[0]; // Primeras coordenadas
  const end = route.path[route.path.length - 1];

  const startLat = start.lat;
  const startLng = start.lng;

  const endLat = end.lat;
  const endLng = end.lng;

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const geoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
        properties: {
          "stroke": "#ff0000",
          "stroke-width": 4,
          "stroke-opacity": 0.8
        },
      },
      {
        type: "Feature",
        properties: {
          "marker-size": "small",
          "marker-symbol": "star",
          "marker-color": "#04ff00"
        },
        geometry: {
          coordinates: [
            startLng,
            startLat
          ],
          type: "Point"
        }
      },
      {
        type: "Feature",
        properties: {
          "marker-size": "small",
          "marker-symbol": "star",
          "marker-color": "#000000"
        },
        geometry: {
          coordinates: [
            endLng,
            endLat
          ],
          type: "Point"
        }
      },
    ],
  };
  const geoJsonParam = encodeURIComponent(JSON.stringify(geoJson));

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson(${geoJsonParam})/[${minLng},${minLat},${maxLng},${maxLat}]/300x200@2x?padding=50&access_token=${mapboxgl.accessToken}`;
};
</script>

<style>
.map-container {
  width: 100%;
  height: 250px;
  position: relative;
}
</style>




