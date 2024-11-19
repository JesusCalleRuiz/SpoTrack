<template>
  <ion-app>
    <ion-menu side="end" content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu Content</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        This is the menu content.
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="main-content"/>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonMenu, IonTitle,IonToolbar,IonHeader,IonContent } from '@ionic/vue';
import { onMounted } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

async function refreshToken() {
  const refreshToken = localStorage.getItem('authToken');
  if (!refreshToken) return;

  try {
    const response = await axios.post('https://spotrack.dev-alicenter.es/api/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });
    localStorage.setItem('authToken', response.data.token);
  } catch (error) {
    console.error('Error al renovar el token', error);
    router.push('/login');
  }
}

onMounted(async () => {
  try {
    const deviceInfo = await Device.getInfo();

    //solicitar permisos de ubicación solo si no es web para solucionar error por consola
    if (deviceInfo.platform !== 'web') {
      await Geolocation.requestPermissions();
    }

    if (deviceInfo.platform === 'android' && deviceInfo.osVersion >= '13') {
      await PushNotifications.requestPermissions();
    }
    const isAuthenticated = localStorage.getItem('authToken');
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      await refreshToken();
    }
  } catch (error) {
    console.error('Error en onMounted:', error);
  }
});
</script>

