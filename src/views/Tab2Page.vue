
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

      <!-- Contenedor para el mapa -->
      <div id="map" class="map-container"></div>

      <div class="tracking-status">
        <p>Tracking your run...</p>
        <p>Distance: {{ distancia }} km</p>
        <p>Time: {{ tiempo }} </p>
      </div>

      <ion-button @click="startTracking" v-if="!isTracking">Start Run</ion-button>
      <ion-button @click="stopTracking" v-else>Stop and Save Run</ion-button>


    </ion-content>
  </ion-page>
</template>

<script setup>
import 'mapbox-gl/dist/mapbox-gl.css';
import { ref, onMounted, onUnmounted } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import { IonButton } from '@ionic/vue';
mapboxgl.accessToken = 'pk.eyJ1IjoiamVzdXNjYWxsZSIsImEiOiJjbTJvaWFjOWIwaDE2MmpzYmRrZHE0djd3In0.r4AeGJf2WNTn6k5DdFQ7yw';

const routeCoordinates = ref([]);
const distancia = ref(0);
const tiempo = ref('');
const averageSpeed = ref(0);
const maxSpeed = ref(0);
const isTracking = ref(false);
let map;
let marker;
let watchId = null;
let startTime = 0;
let endTime = 0;

const initializeMap = async () => {
  const position = await Geolocation.getCurrentPosition();
  const { latitude, longitude } = position.coords;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [longitude, latitude],
    zoom: 15,
  });

  marker = new mapboxgl.Marker()
      .setLngLat([longitude, latitude])
      .addTo(map);
};

const startTracking = async () => {
  isTracking.value = true;
  startTime = Date.now();

  watchId = await Geolocation.watchPosition({
    enableHighAccuracy : true,

  }, (position) => {
    if (position) {
      const { latitude, longitude, speed} = position.coords;
      routeCoordinates.value.push({latitude,longitude });

      //actualiza el marcador en el mapa y centra la vista en la nueva posición
      marker.setLngLat([longitude, latitude]);
      map.setCenter([longitude, latitude]);
      console.log('Coordenadas:', latitude, longitude, 'Speed:', speed);
    }
  });
};

const stopTracking = async () => {
  endTime = Date.now();
  tiempo.value = formatDuration(calculateDuration());

  if (watchId !== null) {
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
  }

  distancia.value = calculateDistance();
  averageSpeed.value = calculateAverageSpeed();
  isTracking.value = false;

  await enviarCarrera();
};

// Función para guardar la carrera en el backend
const enviarCarrera = async () => {
  try {
    const response = await axios.post('http://localhost:8000/api/route', {
      user_id: 1,
      name: "Mi ruta",
      distance: "distancia.value",
      duration: tiempo.value,
      path: JSON.stringify(routeCoordinates.value),
      average_speed: "averageSpeed.value",
      max_speed: "maxSpeed.value",
    });

    console.log('Carrera guardada:', response.data);
    alert('Carrera guardada correctamente!');
    resetTrackingData();
  } catch (error) {
    console.error('Error al guardar la carrera:', error);
    alert('Error al guardar la carrera');
  }
};

const calculateDistance = () => {
};
const calculateDuration = () => Math.floor((endTime - startTime) / 1000);
const formatDuration = (durationInSeconds) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;
  return hours > 0 ? `${hours}h ${minutes}min ${seconds}s` : minutes > 0 ? `${minutes}min ${seconds}s` : `${seconds}s`;
};
const calculateAverageSpeed = () => {

};

const resetTrackingData = () => {
  routeCoordinates.value = [];
  distancia.value = 0;
  tiempo.value = '';
  averageSpeed.value = 0;
  maxSpeed.value = 0;
};

//Monta y desmonta el mapa al cargar el componente
onMounted(initializeMap);
onUnmounted(() => {
  if (map) map.remove();
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 300px;
}
.tracking-status {
  text-align: center;
  margin-top: 20px;
}
</style>
