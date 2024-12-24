<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Chatbot</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="chat-container">
        <div class="messages">
          <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message', msg.sender]"
          >
            <div class="message-text">{{ msg.text }}</div>
          </div>
        </div>
        <div class="input-container">
          <ion-input
              v-model="userMessage"
              @keydown.enter="sendMessage"
              placeholder="Escribe un mensaje..."
              clear-input
              class="message-input"
          ></ion-input>
          <ion-button expand="block" @click="sendMessage" class="send-btn">Enviar</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton
} from '@ionic/vue';

const userMessage = ref('');
const messages = ref<{ sender: string; text: string }[]>([]);

const sendMessage = async () => {
  if (!userMessage.value.trim()) return;

  messages.value.push({ sender: 'user', text: userMessage.value });

  try {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
    const response = await axios.post('https://spotrack.dev-alicenter.es/api/chatbot', {
      message: userMessage.value,
    });

    messages.value.push({ sender: 'bot', text: response.data.reply });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    messages.value.push({ sender: 'bot', text: 'Hubo un problema. Intenta de nuevo.' });
  }

  userMessage.value = '';
};

onMounted(() => {
  messages.value.push({
    sender: 'bot',
    text: '¡Hola! Soy el asistente virtual de Spotrack. ¿En qué puedo ayudarte hoy?',
  });
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: 16px;
}

.messages {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding: 8px;
}

.message {
  display: flex;
  margin-bottom: 12px;
}

.user {
  justify-content: flex-end;
}

.bot {
  justify-content: flex-start;
}

.message-text {
  max-width: 75%;
  padding: 12px;
  border-radius: 16px;
  background-color: #e0e0e0;
  font-size: 14px;
  line-height: 1.5;
}

.user .message-text {
  background-color: #4CAF50;
  color: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 0;
  border-bottom-left-radius: 16px;
}

.bot .message-text {
  background-color: #2196F3;
  color: white;
  border-top-left-radius: 0;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.send-btn {
  margin-top: 8px;
  border-radius: 16px;
  color: white;
  font-weight: bold;
}
</style>