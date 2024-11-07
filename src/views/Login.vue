<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding" style="--background: #1E1E1E;">
      <div class="login-container">
        <!-- Logo -->
        <!--img src="/assets/spotrack-logo.png" alt="SpoTrack Logo" class="logo" /-->

        <!-- Card de Inicio de Sesión -->
        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title class="center-title">Iniciar Sesión</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <ion-item lines="full">
              <ion-label position="floating">Email</ion-label>
              <ion-input v-model="email" type="email"></ion-input>
            </ion-item>

            <ion-item lines="full">
              <ion-label position="floating">Contraseña</ion-label>
              <ion-input v-model="password" type="password"></ion-input>
            </ion-item>

            <ion-button expand="block" @click="login" class="login-button">Iniciar Sesión</ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Link de Registro -->
        <div class="register-link">
          <ion-text color="light">¿No tienes cuenta? <ion-router-link href="/register">Regístrate</ion-router-link></ion-text>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.ion-padding {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1E1E1E; /* Dark mode background */
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 120px;
  margin-bottom: 20px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 16px;
  background-color: #333;
  border-radius: 12px;
}

.center-title {
  text-align: center;
  color: #ffffff;
}

.login-button {
  margin-top: 16px;
  background-color: #4CAF50;
  --background-activated: #388E3C;
}

.register-link {
  margin-top: 12px;
  text-align: center;
}
</style>

