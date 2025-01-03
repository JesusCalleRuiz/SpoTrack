<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button id="present-alert" default-href="" @click.prevent></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button :strong="true" @click="saveTrack()">Confirmar</ion-button>
        </ion-buttons>
        <ion-alert
            trigger="present-alert"
            header="Tu ruta no se guardará si retrocedes"
            message="¿Estás seguro que quieres eliminar tu ruta?"
            :buttons="alertButtons"
        ></ion-alert>
        <ion-title>Guardar Ruta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-content>
          <ion-input v-model="routeName" label="Nombre de la ruta" label-placement="floating" fill="outline" placeholder="Enter text"></ion-input>
          <br />
          <ion-input v-model="routeDescription" label="Descripcion" label-placement="floating" fill="outline" placeholder="Enter text" class="input"></ion-input>
          <br />
          <ion-select v-model="routeSport" interface="popover" label="Deporte" label-placement="floating" fill="outline">
            <ion-select-option value="Caminar">Caminar</ion-select-option>
            <ion-select-option value="Running">Running</ion-select-option>
            <ion-select-option value="Trail running">Trail running</ion-select-option>
            <ion-select-option value="Senderismo">Senderismo</ion-select-option>
            <ion-select-option value="Ciclismo de ruta">Ciclismo de ruta</ion-select-option>
            <ion-select-option value="Ciclismo de montaña">Ciclismo de montaña</ion-select-option>
          </ion-select>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonAlert, IonButton,IonInput, IonCard, IonCardContent, IonSelect, IonSelectOption} from '@ionic/vue';
import { useRouter } from 'vue-router';
import axios from "axios";
import {Haptics, ImpactStyle} from "@capacitor/haptics";
import { useRouteStore } from '@/stores/routeStore';
import {ref} from "vue";

const routeStore = useRouteStore();

const router = useRouter();
let routeName = ref('');
let routeDescription = ref('');
let routeSport= ref('');

const alertButtons = [
  {
    text: 'Cancelar',
    role: 'cancelar',
    handler: () => {
      //no hace nada, permaneces en la vista
    },
  },
  {
    text: 'Eliminar',
    role: 'eliminar',
    handler: () => {
      router.push('/tabs/tab2');
    },
  },
];

const saveTrack = async () => {
  if (!routeName.value || !routeDescription.value || !routeSport.value){
    alert('Por favor, completa todos los campos.');
    return;
  }
  try {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
    const response = await axios.post('https://spotrack.dev-alicenter.es/api/route', {
      name: routeName.value,
      distance: routeStore.distancia,
      duration: routeStore.tiempo,
      path: JSON.stringify(routeStore.routeCoordinates),
      description: routeDescription.value,
      sport: routeSport.value,
      pace: routeStore.ritmo,
    });
    //vibracion fuerte
    await Haptics.impact({ style: ImpactStyle.Heavy });
    console.log('Carrera guardada:', response.data);
    alert('Carrera guardada correctamente!');
    routeStore.resetTrackingData();
    routeName = ref('');
    routeDescription = ref('');
    routeSport= ref('');
    router.push('/tabs/tab3');

  } catch (error) {
    console.error('Error al guardar la carrera:', error);
    alert('Error al guardar la carrera');
  }
};

</script>

<style>
.input {

  height: 120px;
}
</style>