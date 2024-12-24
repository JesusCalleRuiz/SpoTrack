<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Cambiar Contraseña</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list :inset="true">
        <ion-item>
          <ion-label position="floating">Contraseña actual</ion-label>
          <ion-input type="password" v-model="currentPassword"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Nueva contraseña</ion-label>
          <ion-input type="password" v-model="newPassword"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Confirmar nueva contraseña</ion-label>
          <ion-input type="password" v-model="confirmPassword"></ion-input>
        </ion-item>
      </ion-list>
      <ion-button expand="block" @click="changePassword">Actualizar Contraseña</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton
} from '@ionic/vue';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const router = useRouter();

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  if (newPassword.value.length < 8) {
    alert('La nueva contraseña debe tener al menos 8 caracteres.');
    return;
  }

  try {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;

    await axios.post('https://spotrack.dev-alicenter.es/api/change-password', {
      current_password: currentPassword.value,
      new_password: newPassword.value,
      new_password_confirmation: confirmPassword.value,
    });

    alert('Contraseña actualizada con éxito.');
    router.push('/tabs/tab4');
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    alert('Error al cambiar la contraseña. Por favor, verifica los datos.');
  }
};
</script>
