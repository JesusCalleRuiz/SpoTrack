<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { Geolocation } from '@capacitor/geolocation';

onMounted(async () => {
  //permisos de ubicacion
  const perm = await Geolocation.requestPermissions();
  if (perm.location === 'granted') {
    console.log('Permiso de ubicación concedido');
  } else {
    console.error('Permiso de ubicación no concedido');
  }
});
</script>

