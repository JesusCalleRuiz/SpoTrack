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
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
  //solicitar permisos de ubicación
  await Geolocation.requestPermissions();

  //solicitar permisos de notificación en Android 13 y superior
  const deviceInfo = await Device.getInfo();
  if (deviceInfo.platform === 'android' && deviceInfo.osVersion >= '13') {
    await PushNotifications.requestPermissions();
  }
  const isAuthenticated = localStorage.getItem('authToken');
  if (!isAuthenticated) {
    router.push('/login');
  }
});
</script>

