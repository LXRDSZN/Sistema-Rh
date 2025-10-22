<template>
  <div class="container">
    <!-- Columna del formulario -->
    <div class="login-box">
      <div class="form-wrapper">
        <h2>¡Bienvenido!</h2>

        <form @submit.prevent="login">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" autocomplete="username" />

          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" autocomplete="current-password" />

          <button type="submit">Login</button>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </form>

        <p class="register-text">
          Don't have an account? <a href="#">Register</a>
        </p>
      </div>
    </div>

    <!-- Columna morada -->
    <div class="barblue"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const username = ref('');
const password = ref('');
const errorMessage = ref('');

const toast = useToast();
const router = useRouter();
const { login: authLogin, isLoading } = useAuth();

const login = async () => {
  errorMessage.value = '';

  if (!username.value || !password.value) {
    const msg = 'Por favor, ingresa ambos campos';
    errorMessage.value = msg;
    toast.error(msg, { position: 'top-right', duration: 5000, dismissible: true });
    return;
  }

  const result = await authLogin(username.value, password.value);

  if (result.success) {
    toast.success('Inicio de sesión exitoso. ¡Bienvenido!', {
      position: 'top-right',
      duration: 2000,
      dismissible: true
    });
    setTimeout(() => router.push('/Dashboard'), 750);
  } else {
    errorMessage.value = result.message;
    toast.error(result.message, { 
      position: 'top-right', 
      duration: 5000, 
      dismissible: true 
    });
  }
};
</script>

<!-- GLOBAL: sin scoped. Anula estilos de Vite y fuerza layout a pantalla completa -->
<style>
:root {
  --accent: #4f39f6;
  --text: #111;
  --bg: #fff;
}

html, body, #app { height: 100%; }
* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

/* Anula el CSS base de Vite que centra el #app */
#app {
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
}
</style>

<!-- ESTILOS DEL COMPONENTE -->
<style scoped>
/* Grid a pantalla completa:
   - Columna izquierda: ocupa el resto (formulario)
   - Columna derecha: barra morada fija de 382px, pegada al borde derecho */
.container {
  display: grid;
  grid-template-columns: 1fr 382px;
  width: 100vw;
  height: 100dvh;
}

/* Columna izquierda */
.login-box {
  display: grid;
  place-items: center;   /* centra vertical y horizontal */
  background: #fff;
  padding: 2rem;
}

/* Ancho del formulario controlado y limpio */
.form-wrapper {
  width: clamp(320px, 32vw, 520px);
}

h2 {
  margin: 0 0 2rem;
  font-weight: 800;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

label {
  font-size: 14px;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--accent);
  outline: none;
  background: #fff;
  color: var(--text);
}

button {
  margin-top: 0.25rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 999px;
  background-color: var(--accent);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
button:hover { opacity: 0.9; }

.error {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: #d7263d;
}

.register-text {
  margin-top: 2rem;
  font-size: 14px;
}
.register-text a {
  color: #000;
  font-weight: 700;
  text-decoration: none;
}

/* Columna derecha: barra morada */
.barblue {
  background: var(--accent);
}

/* Responsive: sin barra morada en pantallas pequeñas */
@media (max-width: 1015px) {
  .container { grid-template-columns: 1fr; }
  .barblue { display: none; }
}
</style>
