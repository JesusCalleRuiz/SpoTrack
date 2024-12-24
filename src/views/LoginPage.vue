<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title>Iniciar Sesión</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <ion-item>
              <ion-input
                  label="Email"
                  label-placement="stacked"
                  :clear-input="true"
                  v-model="email"
                  class="login-input"
              >
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-input
                  label="Contraseña"
                  label-placement="stacked"
                  :clear-input="true"
                  v-model="password"
                  type="password"
                  class="login-input"
              >
              </ion-input>
            </ion-item>

            <ion-button expand="block" @click="login" class="login-button">Iniciar Sesión</ion-button>
          </ion-card-content>
        </ion-card>
          <ion-text>
            ¿No tienes cuenta? <router-link to="/register">Regístrate</router-link>
          </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">

import { IonPage, IonContent, IonItem, IonInput, IonButton, IonText, IonCardTitle, IonCardContent, IonCard, IonCardHeader, } from '@ionic/vue';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');

const reloadPage = () => {
  window.location.reload();
};

const login = async () => {
  if (!email.value || !password.value) {
    alert('Por favor, ingresa el email y la contraseña.');
    return;
  }
  try {
    const response = await axios.post('https://spotrack.dev-alicenter.es/api/login', {
      email: email.value,
      password: password.value,
    });
    if (response.data.token) {
      //guarda el token en localStorage o en un plugin de almacenamiento seguro de Ionic
      localStorage.setItem('authToken', response.data.token);
      router.push('/').then(reloadPage);
    } else {
      alert(response.data.message || 'Error al iniciar sesión');
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    alert('Error en el inicio de sesión');
  }
};
</script>

<style>
.login-input {
  font-size: 20px;
}
</style>