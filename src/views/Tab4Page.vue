<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mi cuenta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="profile-header">
        <ion-avatar class="profile-avatar">
          <img :src="userAvatar" alt="Avatar del usuario" />
        </ion-avatar>
        <h2>{{ userName }}</h2>
        <p>{{ userEmail }}</p>
      </div>
      <ion-list-header>Opciones de Tema</ion-list-header>
      <ion-list :inset="true">
        <ion-item>
          <ion-toggle :checked="paletteToggle" @ionChange="toggleChange">Modo Oscuro</ion-toggle>
        </ion-item>
      </ion-list>

      <ion-list-header>Configuración</ion-list-header>
      <ion-list :inset="true">
        <ion-item button @click="goToChangePassword">Cambiar contraseña</ion-item>
        <ion-item button @click="viewTerms">Términos y condiciones</ion-item>
        <ion-item button @click="viewPrivacyPolicy">Política de privacidad</ion-item>
      </ion-list>

      <ion-list-header>Cuenta</ion-list-header>
      <ion-list :inset="true">
        <ion-item button @click="logout">Cerrar sesión</ion-item>
        <ion-item button @click="deleteAccount">Eliminar cuenta</ion-item>
      </ion-list>
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
  IonListHeader,
  IonList,
  IonItem,
  IonToggle,
  IonAvatar
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const paletteToggle = ref(true);
const userName = ref('');
const userEmail = ref('');
const userAvatar = ref('https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824144_1280.png');

const router = useRouter();

const toggleDarkPalette = (shouldAdd: boolean) => {
  document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
};

const toggleChange = (ev: CustomEvent) => {
  toggleDarkPalette(ev.detail.checked);
};

const logout = async () => {
  try {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
    await axios.post('https://spotrack.dev-alicenter.es/api/logout');
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión. Inténtalo de nuevo.');
  }
};

const deleteAccount = async () => {
  const confirmed = confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
  if (!confirmed) return;

  const password = prompt('Por favor, ingresa tu contraseña para confirmar:');
  if (!password) {
    alert('Eliminación de cuenta cancelada.');
    return;
  }

  try {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
    await axios.post('https://spotrack.dev-alicenter.es/api/delete-account', { password });
    alert('Cuenta eliminada con éxito.');
    router.push('/login');
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    alert('Error al eliminar la cuenta. Por favor, verifica tu contraseña.');
  }
};

const goToChangePassword = () => {
  router.push('/change-password');
};

const viewTerms = () => {
  router.push('/terms');
};

const viewPrivacyPolicy = () => {
  router.push('/privacy-policy');
};

onMounted(async () => {
  try {
    const response = await axios.get('https://spotrack.dev-alicenter.es/api/get-user', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    const user = response.data.data;
    //console.log(user);
    userName.value = user.name;
    userEmail.value = user.email;
    toggleDarkPalette(paletteToggle.value);
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
  }
});
</script>

<style scoped>
.profile-header {
  text-align: center;
  margin: 16px 0;
}

.profile-avatar {
  margin: 0 auto 12px;
  width: 80px;
  height: 80px;
}

.profile-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.profile-header p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #666;
}
</style>
