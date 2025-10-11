<template>
  <div class="container">
    <div class="login-box">
      <h2>¡Bienvenido!</h2>

      <form @submit.prevent="login">
        <label>Username:</label>
        <input type="text" id="username" v-model="username"/>

        <label>Password:</label>
        <input type="password" id="password" v-model="password"/>

        <button>Login</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>      
      </form>

        <p class="register-text">
          Don't have an account? <a href="#">Register</a>
        </p>
    </div>

   
  </div>
</template>

<script setup>
//importaciones para la navegabilidad, uso de rutas y notificaciones,

import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Para redirigir entre rutas
import axios from 'axios';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

 // Variables reactivas
const username = ref('');
const password = ref('');

// Inicializa el toast
const toast = useToast();
const router = useRouter(); // Router para redirigir

const login = async () => {
if (!username.value || !password.value) {
  toast.error('Por favor, ingresa ambos campos', {
    position: 'top-right',
    duration: 5000,
    dismissible: true,
  });
  return;
}

try {
  const response = await axios.post('http://localhost:5000/api/auth/login', {
    usuario: username.value,
    contrasena: password.value,
    }, {
      withCredentials: true, // Permite enviar y recibir cookies
    });

    if (response.data.message === 'Login exitoso') {
      // Muestra un mensaje de éxito
      toast.success('Inicio de sesión exitoso. Bienvenido!', {
        position: 'top-right',
        duration: 2000, //duracion de la animacion
        dismissible: true,
      });

      // Redirige a la página de Dashboard
      setTimeout(() => {
        router.push('/Dashboard'); // Redirigir al panel
      }, 750);
    }
  } catch (error) {
    const message =
      error.response?.data?.message || 'Hubo un problema con la conexión';
    toast.error(message, {
      position: 'top-right',
      duration: 5000,
      dismissible: true,
    });
  }
};

</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', sans-serif;
  min-width: 500px;
  justify-content: center;
  align-items: stretch;
}

.login-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: white;
  min-width: 300px;
  max-width: 600px;
}

h2 {
  margin-bottom: 2rem;
  font-weight: bold;
}

form {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
}

label {
  margin-top: 1rem;
  margin-bottom: 0.3rem;
  font-size: 14px;
}

input {
  padding: 0.5rem;
  border-radius: 999px;
  border: 1px solid #4f39f6;
  outline: none;
}

button {
  margin-top: 1.5rem;
  padding: 0.6rem;
  border: none;
  border-radius: 999px;
  background-color: #4f39f6;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #3d2fbe;
}

.register-text {
  margin-top: 1.5rem;
  font-size: 14px;
}

.register-text a {
  color: #000;
  font-weight: bold;
  text-decoration: none;
}


@media (max-width: 768px) {
  .container {
    display: flex;
    height: 100vh;
    width: 100vw;
    font-family: 'Segoe UI', sans-serif;
  }

  .login-box {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    min-width: 300px;
  }

}
</style>
