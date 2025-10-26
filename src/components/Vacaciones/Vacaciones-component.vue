<template>
  <div class="vacaciones-content">
    <header class="header">
      <div class="header-left">
        <h1>Vacaciones</h1>
      </div>

      <div class="header-right">
        <button class="btn-incident" @click="$emit('open-incidencia')">Registrar Incidencia</button>
      </div>
    </header>

    
    <section class="Container">
      <div class="card">
        <!-- Aquí irá el contenido del módulo (calendario, leyenda, etc.) -->
        <p class="placeholder">Contenido del módulo de Vacaciones</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Vacaciones'
};
</script>

<style scoped>
/* Tipografías y variables */
:root {
  --btn-purple: #5932EA;
  --bg-gray: #efeff1;
}

/* Contenedor principal */
.vacaciones-content {
  flex: 1;
  padding: 2rem;
  margin-left: 60px;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  padding-top: 2rem;
  flex-direction: column;
  background: var(--bg-gray);
  box-sizing: border-box;
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem; 
}

.header-left h1,
h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 1px;
}

.btn-incident {
  background-color: #5932EA;
  color: #ffffff;
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(89,50,234,0.18);
}
.btn-incident:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(89,50,234,0.22);
}

.Container {
  width: 100%;
  display: flex;
  justify-content: flex-start; 
  margin-top: 0.25rem;
  box-sizing: border-box;
  
}

.card {
  width: 100%;
  max-width: 980px; 
  background: #ffffff;
  border-radius: 14px; 
  padding: 24px;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.08); 
  box-sizing: border-box;
}

/* Placeholder interno (temporal) */
.placeholder {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

/* Responsivo */
@media (min-width: 1024px) {
  .vacaciones-content {
    padding: 3rem;
  }
}
@media (max-width: 900px) {
  .card {
    padding: 18px;
    border-radius: 12px;
  }
  .header-left h1 {
    font-size: 1.6rem;
  }
  .btn-incident {
    padding: 6px 10px;
    border-radius: 8px;
  }
}
</style>