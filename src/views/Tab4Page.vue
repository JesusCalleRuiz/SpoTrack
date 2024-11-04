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
import { ref, onMounted, onUnmounted } from 'vue';

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
    const paletteToggle = ref(false);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const toggleDarkPalette = (shouldAdd: boolean) => {
      if (document.documentElement) {
        document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
      }
    };

    const initializeDarkPalette = (isDark: boolean) => {
      paletteToggle.value = isDark;
      toggleDarkPalette(isDark);
    };

    const toggleChange = (ev) => {
      toggleDarkPalette(ev.detail.checked);
    };

    onMounted(() => {
      initializeDarkPalette(prefersDark.matches);
      prefersDark.addEventListener('change', (mediaQuery) => initializeDarkPalette(mediaQuery.matches));
    });

    onUnmounted(() => {
      // Elimina el listener cuando el componente se desmonta
      prefersDark.removeEventListener('change', initializeDarkPalette);
    });

    return {
      paletteToggle,
      toggleChange,
    };
  },
};
</script>
