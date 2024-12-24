<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Términos y Condiciones</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="terms">
        <h2>Términos y Condiciones</h2>
        <p>
          <strong>Última actualización:</strong> 23/12/2024

          <br><br>
          <strong>Política de Privacidad</strong>

          Esta política describe cómo manejamos y protegemos los datos personales de los usuarios que interactúan con nuestra aplicación. Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política.

          <br><br>
          <strong>1. Recopilación de Información</strong>
          <br>
          Recopilamos información personal cuando:
          <ul>
            <li>Te registras en la aplicación.</li>
            <li>Accedes a las funcionalidades principales de la aplicación.</li>
            <li>Contactas con nuestro equipo de soporte.</li>
          </ul>
          La información recopilada puede incluir:
          <ul>
            <li>Tu nombre, correo electrónico y contraseña.</li>
            <li>Datos de uso y estadísticas de navegación en la aplicación.</li>
          </ul>

          <br>
          <strong>2. Uso de la Información</strong>
          <br>
          Utilizamos la información que recopilamos para:
          <ul>
            <li>Proporcionarte acceso a nuestros servicios.</li>
            <li>Mejorar la funcionalidad y el rendimiento de la aplicación.</li>
            <li>Personalizar tu experiencia como usuario.</li>
          </ul>

          <br>
          <strong>3. Compartición de la Información</strong>
          <br>
          Nos comprometemos a no vender ni alquilar tu información personal a terceros. Sin embargo, podemos compartir datos con proveedores de servicios que nos ayudan a operar la aplicación, siempre bajo acuerdos de confidencialidad.

          <br><br>
          <strong>4. Seguridad</strong>
          <br>
          Adoptamos medidas técnicas y organizativas para proteger tus datos contra accesos no autorizados, pérdida, alteración o divulgación. Sin embargo, ninguna medida de seguridad es infalible, y no podemos garantizar una protección absoluta.

          <br><br>
          <strong>5. Derechos del Usuario</strong>
          <br>
          Como usuario, tienes derecho a:
          <ul>
            <li>Acceder a tus datos personales.</li>
            <li>Solicitar la rectificación o eliminación de tus datos.</li>
            <li>Revocar tu consentimiento para el uso de tus datos.</li>
          </ul>
          Para ejercer estos derechos, ponte en contacto con nosotros a través del correo: soporte@tuapp.com.

          <br><br>
          <strong>6. Cambios en esta Política</strong>
          <br>
          Podemos actualizar esta Política de Privacidad en cualquier momento. Te notificaremos de los cambios significativos a través de la aplicación o por correo electrónico.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
</script>

<style scoped>
.terms {
  padding: 16px;
  line-height: 1.5;
}
</style>
