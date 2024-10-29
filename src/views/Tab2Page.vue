
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
        <p>Distancia: {{ distancia }}</p>
        <p>Tiempo: {{ tiempo }} </p>
      </div>

      <ion-button @click="startTracking" v-if="!isTracking">INICIAR</ion-button>
      <ion-button @click="stopTracking" v-else>TERMINAR</ion-button>


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
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

/*
//simular coordenadas
const simulatedPositions = [
  { latitude: 40.46397905564648, longitude: -3.8095931159707295 },
  { latitude: 40.46403387475049, longitude: -3.80956889079096 },
  { latitude: 40.46402010028891, longitude: -3.80942673372262 },
  { latitude: 40.463986939536525, longitude: -3.809200087057876 },
  { latitude: 40.46388745717904, longitude: -3.809190699314779 },
  { latitude: 40.463771139161025, longitude: -3.8092309324473286 },
  { latitude: 40.46361502782028, longitude: -3.8092590956401127 },
  { latitude: 40.463550746569176, longitude: -3.808927842833013 },
  { latitude: 40.463675227656424, longitude: -3.808580496756403 },
  { latitude: 40.46358402490888, longitude: -3.807771341816511 },
  { latitude: 40.46339958902418, longitude: -3.8067027916776324 },
  { latitude: 40.46287540007004, longitude: -3.8068431385739494 },
  { latitude: 40.46265455998267, longitude: -3.806980295752744 },
  { latitude: 40.46272493767175, longitude: -3.8075927185045684 },
  { latitude: 40.46280744935124, longitude: -3.8080424664629398 },
  { latitude: 40.462914229021436, longitude: -3.8087537700196967 },
  { latitude: 40.46352335526619, longitude: -3.8089579109626257 },
  { latitude: 40.46366168197331, longitude: -3.809490591177545 },
  { latitude: 40.46366896231817, longitude: -3.8096532659709985 }
];


let simulatedIndex = 0;
let simulationInterval = null
*/
const routeCoordinates = ref([]);
const distancia = ref('');
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
    style: 'mapbox://styles/mapbox/streets-v12',
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

/*

const startTracking = () => {
  isTracking.value = true;
  startTime = Date.now();
  simulationInterval = setInterval(() => {
    if (simulatedIndex < simulatedPositions.length) {
      const { latitude, longitude } = simulatedPositions[simulatedIndex];
      routeCoordinates.value.push({ lat: latitude, lng: longitude });

      marker.setLngLat([longitude, latitude]);
      map.setCenter([longitude, latitude]);
      console.log('Posición simulada:', latitude, longitude);

      simulatedIndex++;
    } else {
      clearInterval(simulationInterval);
    }
  }, 2000); // Cambia cada 2 segundos
};

onUnmounted(() => {
  // Detenemos la simulación al desmontar el componente
  if (simulationInterval) clearInterval(simulationInterval);
});
*/
const stopTracking = async () => {
  endTime = Date.now();
  tiempo.value = formatDuration(calculateDuration());

  if (watchId !== null) {
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
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
  let total = 0;
  for (let i = 0; i < routeCoordinates.value.length - 1; i++) {
    const start = routeCoordinates.value[i];
    const end = routeCoordinates.value[i + 1];

    const latDiff = end.lat - start.lat;
    const lngDiff = end.lng - start.lng;

    const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111320;
    total += distance;
  }
  return total ;
}
const formatDistance = (distanceInM) => {
  const m = distanceInM.toFixed(0);
  const km = (distanceInM/1000).toFixed(2);
  return km < 0 ? `${km}km`: `${m}m`;
}
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
  distancia.value = '';
  tiempo.value = '';
  averageSpeed.value = 0;
  maxSpeed.value = 0;
};

//Monta y desmonta el mapa al cargar el componente
onMounted(initializeMap);
onUnmounted(() => {
  if (map) map.remove();
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
}
.tracking-status {
  text-align: center;
  margin-top: 20px;
}

</style>
