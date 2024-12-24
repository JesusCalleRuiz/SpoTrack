<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Rutas</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="map" class="map-container"></div>

      <div class="center-button" v-if="!isTracking&&!isPaused">
        <ion-button @click="startTracking" shape="round" size="large">INICIAR</ion-button>
      </div>
      <div class="center-button" v-if="isTracking&&!isPaused">
          <ion-button @click="pauseTracking" shape="round" size="large">PAUSAR</ion-button>
      </div>

      <div class="center-button" v-if="!isTracking&&isPaused">
        <div class="twobuttons">
          <ion-button @click="continueTracking" shape="round" size="large">REANUDAR</ion-button>
          <ion-button @click="stopTracking" shape="round" size="large">TERMINAR</ion-button>
        </div>
      </div>
      <!--div class="tracking-info" v-else>
        <p>Distancia: {{ distancia }}</p>
        <p>Tiempo: {{ tiempo }}</p>
      </div-->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css';
import { ref, onMounted,} from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import {BackgroundGeolocationPlugin} from "@capacitor-community/background-geolocation";
import mapboxgl from 'mapbox-gl';
import {IonPage, IonHeader, IonToolbar, IonTitle, IonContent} from '@ionic/vue';
import { IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useRouteStore } from '@/stores/routeStore';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// State variables
const routeCoordinates = ref<{ lat: number; lng: number }[]>([]);
const isTracking = ref(false);
const isPaused = ref(false);
let map: mapboxgl.Map;
let marker: mapboxgl.Marker;
let watchId: string | null = null;
let backgroundWatcherId: string | null = null;
let startTime: number = 0;
let endTime: number = 0;
import { registerPlugin } from '@capacitor/core';
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");
const router = useRouter();
const routeStore = useRouteStore();
const initializeMap = async () => {
  const position = await Geolocation.getCurrentPosition();
  const { latitude, longitude } = position.coords;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [longitude, latitude],
    zoom: 15,
  });

  marker = new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);
  map.setCenter([longitude, latitude]);
};

const startTracking = async () => {
  isTracking.value = true;
  isPaused.value = false;
  routeStore.routeCoordinates = [];
  routeStore.distancia = '';
  routeStore.tiempo = '';
  routeStore.ritmo = '';
  isTracking.value = true;
  isPaused.value = false;
  startTime = Date.now();
  //primer plano
  watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
      },
      (position) => {
        if (position) {
          const { latitude, longitude} = position.coords;
          routeStore.routeCoordinates.push({ lat: latitude, lng: longitude });

          marker.setLngLat([longitude, latitude]);
          console.log('Coordenadas:', latitude, longitude);
        }
      }
  );
  //segundo plano
  backgroundWatcherId = await BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: 'La aplicación está rastreando tu ubicación.',
        backgroundTitle: 'Rastreo en segundo plano activado',
        requestPermissions: true,
        stale: false,
        distanceFilter: 3
      },
      (position, error) => {
        if (error) {
          if (error.code === 'NOT_AUTHORIZED') {
            alert(
                'La geolocalización en segundo plano no está autorizada'
            );
            if (window.confirm(
                "Esta aplicación necesita tu localización, " +
                "pero no tiene permisos.\n\n" +
                "¿Quieres cambiar tus ajustes?"
            )) {
              BackgroundGeolocation.openSettings();
            }
          }
          return console.error(error);
        }
        if (position) {
          const latitude = position.latitude;
          const longitude = position.longitude;
          routeStore.routeCoordinates.push({lat: latitude, lng: longitude});
        }
      }
  );
};

const pauseTracking = async () => {
  isPaused.value = true;
  isTracking.value = false

  if (watchId !== null) {
    Geolocation.clearWatch({ id: watchId });
    watchId = null;
  }
  if (backgroundWatcherId !== null) {
    await BackgroundGeolocation.removeWatcher({ id: backgroundWatcherId });
    backgroundWatcherId = null;
  }
  console.log('Ruta pausada');
}

const stopTracking = async () => {
  endTime = Date.now();
  routeStore.tiempo = formatDuration(calculateDuration());

  if (watchId !== null) {
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
  }
  if (backgroundWatcherId) {
    await BackgroundGeolocation.removeWatcher({ id: backgroundWatcherId });
    backgroundWatcherId = null;
  }

  routeStore.distancia = formatDistance(calculateDistance());
  routeStore.ritmo = calculatePace(calculateDistance(),calculateDuration());
  isTracking.value = false;

  await saveTrack();
};

const continueTracking = async () => {
  isTracking.value = true;
  isPaused.value = false;

  watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position) => {
        if (position) {
          const { latitude, longitude} = position.coords;
          routeStore.routeCoordinates.push({ lat: latitude, lng: longitude });

          marker.setLngLat([longitude, latitude]);
          console.log('Coordenadas reanuda:', latitude, longitude);
        }
      }
  );

  backgroundWatcherId = await BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: 'La aplicación está rastreando tu ubicación.',
        backgroundTitle: 'Rastreo en segundo plano activado',
        requestPermissions: true,
        stale: false,
        distanceFilter: 3
      },
      (position, error) => {
        if (error) {
          if (error.code === 'NOT_AUTHORIZED') {
            alert(
                'La geolocalización en segundo plano no está autorizada'
            );
            if (window.confirm(
                "Esta aplicación necesita tu localización, " +
                "pero no tiene permisos.\n\n" +
                "¿Quieres cambiar tus ajustes?"
            )) {
              BackgroundGeolocation.openSettings();
            }
          }
          return console.error(error);
        }
        if (position) {
          const latitude = position.latitude;
          const longitude = position.longitude;
          routeStore.routeCoordinates.push({lat: latitude, lng: longitude});
        }
      }
  );
};


const saveTrack = async () => {
  isPaused.value = false;
  isTracking.value = false
  router.push('/save');
};

const calculateDistance = () => {
  let total = 0;
  for (let i = 0; i < routeCoordinates.value.length - 1; i++) {
    const start = routeCoordinates.value[i];
    const end = routeCoordinates.value[i + 1];
    const latDiff = end.lat - start.lat;
    const lngDiff = end.lng - start.lng;
    const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111320;
    total += distance;
  }
  return total;
};

const formatDistance = (distanceInM: number) => {
  const m = distanceInM.toFixed(0);
  const km = (distanceInM / 1000).toFixed(2);
  return parseFloat(km) < 1 ? `${m}m` : `${km}km`;
};

const calculateDuration = () => Math.floor((endTime - startTime) / 1000);
const formatDuration = (durationInSeconds: number) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;
  return hours > 0 ? `${hours}h ${minutes}min ${seconds}s` : minutes > 0 ? `${minutes}min ${seconds}s` : `${seconds}s`;
};

const calculatePace = (distanceInM: number,durationInSeconds: number) => {
  if(distanceInM == 0){
    return ("0min 0s");
  }
  const km = parseFloat((distanceInM / 1000).toFixed(2));
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const pace = minutes / km;
  const paceMinutes = Math.floor(pace);
  const paceSeconds = Math.round((pace - paceMinutes) * 60);
  return `${paceMinutes}min ${paceSeconds}s`;
};

onMounted(async () => {
  try {
    await initializeMap();
  } catch (error) {
    console.error('Error en onMounted:', error);
  }
});

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.center-button {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
.twobuttons {
  display: flex;
  gap: 10px;
}
</style>
