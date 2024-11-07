<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Crear cuenta</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-item>
            <ion-label position="floating">Nombre</ion-label>
            <ion-input v-model="name" type="text"></ion-input>
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
            <ion-input v-model="password" type="password"></ion-input>
          </ion-item>

          <ion-button expand="block" @click="register">Registrarse</ion-button>
        </ion-card-content>
      </ion-card>

      <ion-text>¿Ya tienes cuenta? <ion-router-link href="/login">Inicia sesión</ion-router-link></ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');

const register = async () => {
  try {
    const response = await axios.post('https://tudominio.com/api/register', {
      name: name.value,
      email: email.value,
      password: password.value,
    });

    if (response.data.success) {
      alert('¡Registro exitoso!');
      router.push('/login');
    } else {
      alert(response.data.message || 'Error en el registro');
    }
  } catch (error) {
    console.error('Error en el registro:', error);
    alert('Error en el registro');
  }
};
</script>
