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

      <div class="center-button" v-if="!isTracking">
        <ion-button @click="startTracking" shape="round" size="large">INICIAR</ion-button>
      </div>
      <div class="center-button" v-if="isTracking">
        <div class="twobuttons">
          <ion-button @click="stopTracking" shape="round" size="large">PAUSAR</ion-button>
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
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import { IonButton } from '@ionic/vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// State variables
const routeCoordinates = ref<{ lat: number; lng: number }[]>([]);
const distancia = ref('');
const tiempo = ref('');
const averageSpeed = ref(0);
const maxSpeed = ref(0);
const isTracking = ref(false);
let map: mapboxgl.Map;
let marker: mapboxgl.Marker;
let watchId: string | null = null;
let backgroundWatcherId: string | null = null;
let startTime: number = 0;
let endTime: number = 0;
import { registerPlugin } from '@capacitor/core';
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

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
  startTime = Date.now();
  //primer plano
  watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
      },
      (position) => {
        if (position) {
          const { latitude, longitude, speed } = position.coords;
          routeCoordinates.value.push({ lat: latitude, lng: longitude });

          marker.setLngLat([longitude, latitude]);
          console.log('Coordenadas:', latitude, longitude, 'Speed:', speed);
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
        distanceFilter: 3,
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
          routeCoordinates.value.push({lat: latitude, lng: longitude});
        }
      }
  );
};

const stopTracking = async () => {
  endTime = Date.now();
  tiempo.value = formatDuration(calculateDuration());

  if (watchId !== null) {
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
  }
  if (backgroundWatcherId) {
    await BackgroundGeolocation.removeWatcher({ id: backgroundWatcherId });
    backgroundWatcherId = null;
  }

  distancia.value = formatDistance(calculateDistance());
  averageSpeed.value = calculateAverageSpeed();
  isTracking.value = false;

  await enviarCarrera();
};

const enviarCarrera = async () => {
  try {
    const response = await axios.post('https://spotrack.dev-alicenter.es/api/route', {
      user_id: 1,
      name: "Mi ruta",
      distance: distancia.value,
      duration: tiempo.value,
      path: JSON.stringify(routeCoordinates.value),
      average_speed: averageSpeed.value.toString(),
      max_speed: maxSpeed.value.toString(),
    });

    console.log('Carrera guardada:', response.data);
    alert('Carrera guardada correctamente!');

    //vibracion fuerte
    await Haptics.impact({ style: ImpactStyle.Heavy });

    resetTrackingData();
  } catch (error) {
    console.error('Error al guardar la carrera:', error);
    alert('Error al guardar la carrera');
  }
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

const calculateAverageSpeed = () => {
  if (!routeCoordinates.value.length) return 0;
  return calculateDistance() / (calculateDuration() / 3600);
};

const resetTrackingData = () => {
  routeCoordinates.value = [];
  distancia.value = '';
  tiempo.value = '';
  averageSpeed.value = 0;
  maxSpeed.value = 0;
};

onMounted(initializeMap);

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
.tracking-info {
  text-align: center;
  position: absolute;
  bottom: 10px;
  width: 100%;
  z-index: 10;
  background-color: transparent;
  color: white;
}
</style>
