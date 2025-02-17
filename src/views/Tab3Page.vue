<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mis Rutas</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="reloadPage">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-searchbar v-model="filterText" showCancelButton="never"  placeholder="Buscar por nombre" ></ion-searchbar>

      <div v-if="!hasRoutes" class="no-routes">
        <p>No hay rutas disponibles.</p>
      </div>

      <div v-if="hasRoutes">
      <ion-card @click="goToMyRoutePage(route)" v-for="(route) in filteredRoutes" :key="route.id">
        <img :src="getImage(route)" alt="Ruta de mapa" class="map-container" />

        <ion-card-header>
          <ion-card-title>{{ route.name }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <p>Fecha: {{ new Date(route.created_at).toLocaleString() }}</p>
          <p>Distancia: {{ route.distance }} Tiempo: {{ route.duration }}</p>

        </ion-card-content>
      </ion-card>
      </div>
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
  IonRefresher,
  IonRefresherContent,
  IonSearchbar
} from '@ionic/vue';
import {ref, onMounted, nextTick, computed} from 'vue';
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'vue-router';
import simplifyGeoJSON from 'simplify-geojson';
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

interface Route {
  id: number;
  name: string;
  created_at: string;
  distance: string;
  duration: string;
  path: { lat: number; lng: number }[];
  sport: string;
  pace: string;
}

const routes = ref<Route[]>([]);
const filterText = ref('');
const hasRoutes = ref(true);

const filteredRoutes = computed(() =>
    routes.value.filter((route) =>
        route.name.toLowerCase().includes(filterText.value.toLowerCase())
    )
);

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
      //console.log(data);
      routes.value = data.data.map((route : any) => ({
        ...route,
        path: JSON.parse(route.path)
      }));
      hasRoutes.value = routes.value.length > 0;
      if (hasRoutes.value) {
        await nextTick();
        routes.value.forEach(route => getImage(route));
      }
    } else {
      console.error('Error al obtener las rutas');
      hasRoutes.value = false;
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
    hasRoutes.value = false;
  }
};

onMounted(() => {
  try {
    fetchRoutes();
  } catch (error) {
    console.error('Error en onMounted:', error);
  }
});
const simplifyPath = (geoJson: any, tolerance: number = 0.001) => {
  return simplifyGeoJSON(geoJson, tolerance);
};

const getImage = (route: Route) => {

  const coordinates = route.path.map(coord => [coord.lng, coord.lat]);

  //si no hay dos puntos distintos se muestra un mapa con un marker
  if (coordinates.length < 2 || coordinates.every((coord, i, arr) => coord[0] === arr[0][0] && coord[1] === arr[0][1])) {
    const singlePoint = route.path[0];
    const singleLat = singlePoint.lat;
    const singleLng = singlePoint.lng;

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+000(${singleLng},${singleLat})/${singleLng},${singleLat},15/300x200@2x?access_token=${mapboxgl.accessToken}`;
  }

  const lats = coordinates.map(c => c[1]);
  const lngs = coordinates.map(c => c[0]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const start = route.path[0]; // Primeras coordenadas
  const end = route.path[route.path.length - 1];
  const startLat = start.lat;
  const startLng = start.lng;
  const endLat = end.lat;
  const endLng = end.lng;

  let geoJson = {
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
  //necesario debido a que en rutas largas no renderiza la imagen max 8192 caracteres
  geoJson = simplifyPath(geoJson, 0.0001);

  const geoJsonParam = encodeURIComponent(JSON.stringify(geoJson));

  //console.log("GeoJson: "+geoJsonParam, "minLng: "+minLng,"minLat: "+minLat,"maxLng: "+maxLng,"maxLat: "+maxLat);

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson(${geoJsonParam})/[${minLng},${minLat},${maxLng},${maxLat}]/300x200@2x?padding=50&access_token=${mapboxgl.accessToken}`;
};
</script>

<style>
.map-container {
  width: 100%;
  height: 250px;
  position: relative;
}
.no-routes{
  text-align: center;
  font-size: 1.2rem;
  color: gray;
  margin: 20px 0;
}
</style>




