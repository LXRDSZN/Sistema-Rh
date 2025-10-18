<script>
  export default {

    data(){
      return{
        areaItems:[
          'Asistencias',
          'Documentación',
          'Vacaciones',
          'Incidencias',
          'Áreas'
        ],
        nombreItems:[
          'Pedro Pérez',
          'Lalito Ramírez'
        ],
        statusItems: [
          'Pendiente',
          'Revisado'
        ],
        selectedArea: null,
        selectedNombre: null,
        selectedStatus: null
      }
    },
    
    methods: {
      generarReporte() {
        alert('Reporte generado');
      }
    }
    
  }
</script>


<template>
  <div class="incidencias-content">
    
    <!-- Este es el header que contiene el titulo, el boton para generar reportes y el buscador de incidencias  -->
    <header class="header">
      <div class="header-left">
        <h1>Incidencias</h1>
      </div>

      <div class="header-right">

        <button 
        class="btn-Greporte" 
        name="btn-Greporte"
        @click="generarReporte"
        >
          <span class="material-symbols-rounded">description</span>
          Generar reporte
        </button>

        <div class="cont-buscar">
          <span class="material-symbols-rounded search-icon">search</span>
          <input
            type="search"
            name="sh-BuscarIncidencia"
            placeholder="Buscar..."
            aria-label="Buscar incidencias"
          />
        </div>

      </div>
    </header>

    <!-- Estatus de incidencias pendientes y revisados -->
    <div class="status-incidencias">

      <div class="tarjetas">
        <div class="pendientes">
          <span class="material-symbols-rounded">hourglass_top</span>
          <h2>0</h2>
          <p>Pendientes</p>
        </div>

        <div class="revisados">
          <span class="material-symbols-rounded">visibility</span>
          <h2>0</h2>
          <p>Revisados</p>
        </div>
      </div>

    </div>

    <!-- Filtros -->
    <div class="filtros-content">

      <div class="titulo-arriba">
        <span class="material-symbols-rounded">filter_list</span>
        <h2>Filtros</h2>
      </div>

      <div class="filtros-panel">

        <!-- Filtro area -->
        <div class="fl-item">
          <v-select
            v-model="selectedArea"
            :items="areaItems"
            clearable
            hide-details
            density="compact"
            variant="solo-filled"
            placeholder="Área"
          >
            <template #prepend-inner>
              <span class="material-symbols-rounded">place</span>
            </template>
          </v-select>
        </div>

        <!-- Filtro nombre -->
        <div class="fl-item">
          <v-select
            v-model="selectedNombre"
            :items="nombreItems"
            clearable
            hide-details
            density="compact"
            variant="solo-filled"
            placeholder="Nombre"
          >
            <template #prepend-inner>
              <span class="material-symbols-rounded">person</span>
            </template>
          </v-select>
        </div>

        <!-- Filtro Estatus -->
        <div class="fl-item">
          <v-select
            v-model="selectedStatus"
            :items="statusItems"
            clearable
            hide-details
            density="compact"
            variant="solo-filled"
            placeholder="Status"
          >
            <template #prepend-inner>
              <span class="material-symbols-rounded">warning</span>
            </template>
          </v-select>
        </div>

      </div>
    </div>

    <!-- Lista de incidencias filtradas -->
    <div class="lista-incidencias">
      
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.incidencias-content {
  flex: 1;
  padding: 2rem;
  margin-left: 60px; /* Espacio para sidebar cerrado */
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  padding-top: 2rem;

  flex-direction: column; /*Hace que se apilen en columnas los componentes divs y header*/
}

/* ------ Estilos del header ----*/
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap:1rem;
  
}
.header-left h1 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 2px;
  font-weight: 600;
  color: #2c3e50;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-Greporte {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 16px;
  padding: 0.45rem 0.9rem;
  height: 38px;
  color: #464646;
  background-color: #fafafa;
  border: 1px solid rgba(0,0,0,0.06);
  cursor: pointer;
  font-weight: 500;
}
.btn-Greporte:hover {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  box-shadow: 0 4px 10px rgba(79, 57, 246, 0.4);
  color:#ffffff;
  transition: background-color 0.2s ease;
}
.btn-Greporte:active {
  transform: translateY(-1px);
}


.cont-buscar {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: #fff;
  border-radius: 18px;
  padding: 6px 10px;
  border: 1px solid rgba(0,0,0,0.06);
  gap:0.5rem;
  transition: box-shadow 200ms ease, transform 160ms ease, border-color 160ms ease;
  will-change: box-shadow, transform;
}
.cont-buscar:focus-within {
  box-shadow: 0 10px 20px rgba(16,24,40,0.06);
  transform: translateY(-2px);
  border-color: rgba(59,130,246,0.14);
}
.cont-buscar input {
  border: none;
  outline: none;
  width: 180px;
  font-size: 0.95rem;
  background: transparent;
  transition: width 240ms cubic-bezier(.2,.9,.3,1), color 160ms ease;
}
.cont-buscar:focus-within input {
  width: 260px;
}
.search-icon {
  color: #8a8f95;
  transition: transform 220ms ease, color 220ms ease;
  will-change: transform, color;
  cursor: pointer;
}

/* ------ Estilos de las tarjetas de estado ----*/
.status-incidencias {
  width: 100%;
  margin-top: 0.1rem;
}
.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  width: 100%;
  align-items: start;
}
.tarjetas > div {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem 1.25rem;
  box-shadow: 0 6px 18px rgba(16,24,40,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  text-align: center;
}
.tarjetas > div .material-symbols-rounded {
  font-size: 34px;
  color: #374151;
  margin-bottom: 0.35rem;
}
.tarjetas > div h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}
.tarjetas > div p {
  margin-top: 0.3rem;
  display: inline-block;
  background: #E4E4E7;
  color: #000000;
  padding: 5px 30px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* -- Estilo para los Filtros -- */
.filtros-content {
  width: 100%;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #fff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 6px 18px rgba(16,24,40,0.04);
}
.titulo-arriba {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  background: #E4E4E7;
  padding: 8px 12px;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(16,24,40,0.04);
  width: fit-content; 
}
.titulo-arriba h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1;
  padding-right: 6px;
}
.filtros-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.9rem;
  width: 100%;
  align-items: center;
  margin-bottom: 0;
}
.fl-item {
  width: 100%;
}
.fl-item ::v-deep .v-field {
  border-radius: 18px !important;
  background: #E4E4E7 !important;
  box-shadow: none !important;
  
}


@media (min-width: 1024px) {
  .incidencias-content {
    padding: 3rem;
  }
}
</style>