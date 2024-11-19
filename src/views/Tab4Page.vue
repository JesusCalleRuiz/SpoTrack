<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mi cuenta</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list-header>Opciones de Tema</ion-list-header>
      <ion-list :inset="true">
        <ion-item>
          <ion-toggle :checked="paletteToggle" @ionChange="toggleChange">Modo Oscuro</ion-toggle>
        </ion-item>
        <ion-item>
          <ion-item button @click="logout">Cerrar sesión</ion-item>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonListHeader,
  IonList,
  IonItem,
  IonToggle, IonMenuButton,
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const paletteToggle = ref(true);
const router = useRouter();
const toggleDarkPalette = (shouldAdd: boolean) => {
  document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
};
 const toggleChange = (ev: CustomEvent) => {
   toggleDarkPalette(ev.detail.checked);
 };

const logout = async () => {
  try {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
    await axios.post('https://spotrack.dev-alicenter.es/api/logout');
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

onMounted(() => {
  try {
    toggleDarkPalette(paletteToggle.value);
  } catch (error) {
    console.error('Error en onMounted:', error);
  }
});
</script>

