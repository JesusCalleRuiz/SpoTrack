<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';

onMounted(async () => {
  //solicitar permisos de ubicación
  const permission = await Geolocation.requestPermissions();
  if (permission.location !== 'granted') {
    alert("La aplicación necesita permisos de ubicación en primer plano.");
  }

  //solicitar permisos de notificación en Android 13 y superior
  const deviceInfo = await Device.getInfo();
  if (deviceInfo.platform === 'android' && deviceInfo.osVersion >= '13') {
    const { status } = await PushNotifications.requestPermissions();
    if (status !== 'granted') {
      alert("La aplicación necesita permisos de notificación para operar en segundo plano.");
    }
  }
});

</script>

