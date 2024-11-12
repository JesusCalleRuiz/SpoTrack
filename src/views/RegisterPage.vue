<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Registro</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-item>
            <ion-input
                label="Nombre"
                label-placement="stacked"
                :clear-input="true"
                v-model="name"
            >
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" type="email"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Contraseña</ion-label>
            <ion-input v-model="password" type="password"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Repite la contraseña</ion-label>
            <ion-input v-model="confirmPassword" type="password"></ion-input>
          </ion-item>

          <ion-button expand="block" @click="register">Registrarse</ion-button>
          </ion-card-content>
      </ion-card>
      <ion-text>
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">

import { IonPage, IonContent, IonItem, IonInput, IonLabel, IonButton, IonText, IonCard, IonCardTitle, IonCardHeader, IonCardContent,} from '@ionic/vue';

import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const register = async () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  if (password.value !== confirmPassword.value) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  try {
    const response = await axios.post('https://spotrack.dev-alicenter.es/api/register', {
      name: name.value,
      email: email.value,
      password: password.value,
    });
    const token = response.data.token;
    localStorage.setItem('authToken', token);
    router.push('/');

  } catch (error) {
    console.error('Error en el registro:', error);
    alert('Error en el registro');
  }
};
</script>
