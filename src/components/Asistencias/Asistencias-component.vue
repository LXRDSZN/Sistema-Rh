<template>
  <div class="asistencias-content">
    <h1>Vista Para Asistencias</h1>
  </div>
</template>

<style scoped>
.asistencias-content {
  flex: 1;
  padding: 2rem;
  margin-left: 60px; /* Espacio para sidebar cerrado */
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  padding-top: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

@media (min-width: 1024px) {
  .asistencias-content {
    padding: 3rem;
  }
}
</style>