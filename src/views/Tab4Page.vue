<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="#"></ion-back-button>
        </ion-buttons>
        <ion-title>Mi cuenta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list-header>Opciones de Tema</ion-list-header>
      <ion-list :inset="true">
        <ion-item>
          <ion-toggle :checked="paletteToggle" @ionChange="toggleChange">Modo Oscuro</ion-toggle>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonListHeader,
  IonList,
  IonItem,
  IonToggle,
} from '@ionic/vue';
import { ref, onMounted } from 'vue';

export default {
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonListHeader,
    IonList,
    IonItem,
    IonToggle,
  },
  setup() {
    const paletteToggle = ref(true);

    const toggleDarkPalette = (shouldAdd: boolean) => {
      document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
    };

    const toggleChange = (ev: CustomEvent) => {
      toggleDarkPalette(ev.detail.checked);
    };

    onMounted(() => {
      toggleDarkPalette(paletteToggle.value);
    });

    return {
      paletteToggle,
      toggleChange,
    };
  },
};
</script>

