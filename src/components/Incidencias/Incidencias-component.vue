<script>
export default {
  data() {
    return {
      areaItems: [
        'Asistencias',
        'Documentación',
        'Vacaciones',
        'Incidencias',
        'Áreas'
      ],
      nombreItems: [
      'Pedro Pérez', 
      'Lalito Ramírez'
    ],
      statusItems: [
       'Pendiente',
       'Revisado'
      ],

      selectedArea: null,
      selectedNombre: null,
      selectedStatus: null,

      buscar:'',

      reporteDialog: false, // controla el modal
      fechaReporte: null,
      tipoReporte: null,
      tipoReporteItems: ['PDF', 'EXCEL'],
      menu:false, // para el date picker

      // Lista estática de incidencias
      incidencias: [
        {
          id: 1,
          asunto: 'Falta injustificada del área de Documentación',
          area: 'Asistencias',
          nombre: 'Pedro Pérez',
          status: 'Pendiente'
        },
        {
          id: 2,
          asunto: 'Falta injustificada del área de Documentación',
          area: 'Documentación',
          nombre: 'Lalito Ramírez',
          status: 'Revisado'
        },
        {
          id: 3,
          asunto: 'Falta injustificada del área de Documentación',
          area: 'Documentación',
          nombre: 'Lalito Ramírez',
          status: 'Revisado'
        },
        {
          id: 4,
          asunto: 'Falta injustificada del área de Documentación',
          area: 'Documentación',
          nombre: 'Lalito Ramírez',
          status: 'Pendiente'
        }

      ]
    };
  },

  computed: {
    // Filtra las incidencias según los selectores
    incidenciasFiltradas() {
      const texto = this.buscar.toLowerCase();
      return this.incidencias.filter(i => {
        const coincideTexto =
          !texto ||
          i.asunto.toLowerCase().includes(texto) ||
          i.area.toLowerCase().includes(texto) ||
          i.nombre.toLowerCase().includes(texto) ||
          i.status.toLowerCase().includes(texto);

        const areaOk = !this.selectedArea || i.area === this.selectedArea;
        const nombreOk = !this.selectedNombre || i.nombre === this.selectedNombre;
        const statusOk = !this.selectedStatus || i.status === this.selectedStatus;

        return coincideTexto && areaOk && nombreOk && statusOk;
      });
    }
  },

  methods: {
    abrirReporte() {
      this.reporteDialog = true;
    },
    generarReporte() {
      alert(`Reporte generado\nFecha: ${this.fechaReporte}\nTipo: ${this.tipoReporte}`);
      this.reporteDialog = false;
    },
    eliminarIncidencia(id) {
      this.incidencias = this.incidencias.filter(i => i.id !== id);
    },
    seleccionarFecha(valor) {
  // Formatear fecha a "DD/MM/YYYY"
  const fecha = new Date(valor);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  this.fechaReporte = `${dia}/${mes}/${anio}`;

  // Cerrar el menú después de seleccionar
  this.menu = false;
},

  }
};
</script>

<template>
  <div class="incidencias-content">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <h1>Incidencias</h1>
      </div>

      <div class="header-right">
        <!-- Botón Generar Reporte -->
<v-btn class="btn-Greporte" @click="abrirReporte">
  <span class="material-symbols-rounded">description</span>
  Generar reporte
</v-btn>

<!-- Modal de reporte -->
<v-dialog v-model="reporteDialog" max-width="480" transition="dialog-bottom-transition">
  <v-card class="reporte-card pa-5">

    <!-- Botón de cierre (parte superior derecha) -->
    <div class="d-flex justify-end mb-2">
      <v-btn icon variant="text" @click="reporteDialog = false" class="close-btn">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-divider class="mb-4"></v-divider>

    <!-- Contenido -->
    <v-card-text>
      <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Selecciona la fecha:</label>

      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template #activator="{ props }">
          <v-text-field
            v-model="fechaReporte"
            label="Seleccionar fecha"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="props"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </template>
        <v-date-picker 
        v-model="fechaReporte"
    @update:model-value="seleccionarFecha"
    scrollable
        ></v-date-picker>
      </v-menu>

      <!-- Botones de tipo de reporte -->
      <div class="tipo-reporte mt-6">
        <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Tipo de reporte:</label>
        <div class="btn-tipo-reporte">
          <v-btn
            :class="{'activo': tipoReporte === 'PDF'}"
            variant="flat"
            rounded="xl"
            color="white"
            @click="tipoReporte = 'PDF'"
          >
            <v-icon left color="black">mdi-file-pdf-box</v-icon>
            <span class="text-black font-weight-medium">PDF</span>
          </v-btn>

          <v-btn
            :class="{'activo': tipoReporte === 'EXCEL'}"
            variant="flat"
            rounded="xl"
            color="white"
            @click="tipoReporte = 'EXCEL'"
          >
            <v-icon left color="black">mdi-microsoft-excel</v-icon>
            <span class="text-black font-weight-medium">Excel</span>
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <!-- Botón de generar -->
    <v-card-actions class="mt-2">
      <v-spacer></v-spacer>
      <v-btn color="primary" rounded="lg" @click="generarReporte">
        <v-icon left>mdi-file-document-outline</v-icon>
        Generar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
        
        <div class="cont-buscar">
          <span class="material-symbols-rounded search-icon">search</span>
          <input
            v-model="buscar"
            type="search"
            name="sh-BuscarIncidencia"
            placeholder="Buscar..."
            aria-label="Buscar incidencias"
          />
        </div>
      </div>
    </header>

    <!-- Tarjetas de estado -->
    <div class="status-incidencias">
      <div class="tarjetas">
        <div class="pendientes">
          <span class="material-symbols-rounded">hourglass_top</span>
          <h2>{{ incidencias.filter(i => i.status === 'Pendiente').length }}</h2>
          <p>Pendientes</p>
        </div>

        <div class="revisados">
          <span class="material-symbols-rounded">visibility</span>
          <h2>{{ incidencias.filter(i => i.status === 'Revisado').length }}</h2>
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

    <!-- Lista de incidencias -->
     <!-- Lista de incidencias -->
<div class="lista-incidencias">
  <div
    v-for="(incidencia, index) in incidenciasFiltradas"
    :key="incidencia.id"
    class="incidencia-card"
  >
    <div class="incidencia-num">{{ index + 1 }}</div>

    <div class="incidencia-info">
      <p class="asunto">{{ incidencia.asunto }}</p>
      <p class="detalles">
        <strong>Área:</strong> {{ incidencia.area }} —
        <strong>Nombre:</strong> {{ incidencia.nombre }} —
        <strong>Estado:</strong>
        <span
          :class="[
            'status-tag',
            incidencia.status === 'Pendiente' ? 'pendiente' : 'revisado'
          ]"
        >
          {{ incidencia.status }}
        </span>
      </p>
    </div>

    <v-btn
      icon
      class="btn-eliminar"
      @click="eliminarIncidencia(incidencia.id)"
    >
      <v-icon>mdi-delete</v-icon>
    </v-btn>
  </div>

  <div v-if="incidenciasFiltradas.length === 0" class="no-incidencias">
    <span class="material-symbols-rounded">check_circle</span>
    <p>No hay solicitudes de revisión pendientes</p>
    <p><strong>Todas las asignaciones están al día</strong></p>
  </div>
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
  letter-spacing: 5px;
  font-weight: 600;
  color: #2c3e50;
  text-transform: uppercase;
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



/* Ventana*/
.reporte-card {
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.15);
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.close-btn {
  color: #6b7280;
  transition: color 0.2s ease, transform 0.2s ease;
}
.close-btn:hover {
  color: #ef4444;
  transform: rotate(90deg);
}

.btn-tipo-reporte {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.btn-tipo-reporte .v-btn {
  min-width: 110px;
  background-color: #ffffff !important;
  border: 1px solid #d1d5db !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}
.btn-tipo-reporte .v-btn:hover {
  background-color: #f3f4f6 !important;
  transform: scale(1.05);
}
.btn-tipo-reporte .v-btn.activo {
  border-color: #6366f1 !important;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
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


/* Lista de incidencias */
.lista-incidencias {
  width: 100%;
  margin-top: 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
}

/* Tarjeta de incidencia */
.incidencia-card {
  display: flex;
  align-items: center;
  background: #f4f4f5; /* fondo gris suave */
  border-radius: 16px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 3px 10px rgba(16, 24, 40, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.incidencia-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 14px rgba(16, 24, 40, 0.08);
}

/* Número de incidencia */
.incidencia-num {
  flex-shrink: 0;
  background: #9e9ea3;
  color: #fff;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  margin-right: 1.5rem;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

/* Información de la incidencia */
.incidencia-info {
  flex: 1;
  background-color: #e5e5e5; /* fondo gris dentro de la tarjeta */
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #1f2937;
}
.asunto {
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
  color: #111827;
}
.detalles {
  font-size: 0.9rem;
  margin-top: 0.3rem;
  color: #4b5563;
}

/* Etiqueta de estado */
.status-tag {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-tag.pendiente {
  background-color: #fef3c7;
  color: #92400e;
}
.status-tag.revisado {
  background-color: #dcfce7;
  color: #166534;
}

/* Botón eliminar */
.btn-eliminar {
  background-color: #ef4444 !important;
  color: #fff !important;
  border-radius: 10px;
  margin-left: 1rem;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.btn-eliminar:hover {
  background-color: #dc2626 !important;
  transform: scale(1.15);
}

/* Mensaje cuando no hay incidencias */
.no-incidencias {
  text-align: center;
  color: #555;
  margin-top: 2rem;
}
.no-incidencias span {
  font-size: 48px;
  color: #414141;
  margin-bottom: 0.5rem;
}





@media (min-width: 1024px) {
  .incidencias-content {
    padding: 3rem;
  }
}
</style>