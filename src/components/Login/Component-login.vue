<template>
  <div class="container">
    <div class="login-box">
      <h2>¡Bienvenido!</h2>

      <form @submit.prevent="login">
        <label>Username:</label>
        <input type="text" v-model="username" />

        <label>Password:</label>
        <input type="password" v-model="password" />

        <button type="submit">Login</button>
      </form>

      <p class="register-text">
        Don't have an account? <a href="#">Register</a>
      </p>
    </div>

    <div class="side-panel"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    login() {
      alert(`Usuario: ${this.username}, Contraseña: ${this.password}`);
    },
  },
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

.side-panel {
  width: 40%;
  min-width: 200px;
  max-width: 400px;
  height: 100%;
  background-color: #4f39f6;
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

  .side-panel {
    flex: 0 0 35vw;
    min-width: 200px;
    background-color: #4f39f6;
  }
}
</style>
