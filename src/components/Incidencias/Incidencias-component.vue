<script>
import * as incidenciasService from '@/services/incidenciasService';
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import axios from 'axios';

export default {
  setup() {
    const { userRole } = useAuth();
    return { userRole };
  },
  data() {
    return {
      // Listas dinámicas desde la API
      areaItems: [],
      nombreItems: [],
      statusItems: [],

      selectedArea: null,
      selectedNombre: null,
      selectedStatus: null,

      buscar:'',

      reporteDialog: false,
      fechaInicio: null,
      fechaFin: null,
      tipoReporte: null,
      tipoReporteItems: ['PDF', 'EXCEL'],
      menuInicio: false,
      menuFin: false,
      rangoRapido: null,

      incidenciaSeleccionada: null,
      dialogIncidencia: false,
      dialogRechazo: false,
      motivoRechazo: '',
      cargando: false,
      modoEdicion: false,
      tipoIncidenciaEdit: null,
      archivoInfo: null,
      cargandoArchivo: false,
      mostrarVisorArchivo: false,
      urlFirmada: null,
      cargandoUrlFirmada: false,

      // Incidencias desde la API
      incidencias: [],
      tiposIncidencia: [],
      estadosIncidencia: []
    };
  },
  
  mounted() {
    this.cargarDatos();
    
    // Watch para recargar cuando se navega a esta vista
    const route = useRoute();
    watch(() => route.path, (newPath) => {
      if (newPath === '/Incidencias') {
        this.cargarDatos();
      }
    });
  },

  computed: {
    // Verificar si el usuario puede aprobar/rechazar incidencias (todos menos EMPLEADO)
    puedeAprobarRechazar() {
      return this.userRole !== 'EMPLEADO';
    },
    // Filtra las incidencias según los selectores
    incidenciasFiltradas() {
      const texto = this.buscar.toLowerCase();
      return this.incidencias.filter(i => {
        const coincideTexto =
          !texto ||
          i.tipo.toLowerCase().includes(texto) ||
          i.area.toLowerCase().includes(texto) ||
          i.nombre_completo.toLowerCase().includes(texto) ||
          i.estado.toLowerCase().includes(texto);

        const areaOk = !this.selectedArea || i.area === this.selectedArea;
        const nombreOk = !this.selectedNombre || i.nombre_completo === this.selectedNombre;
        const statusOk = !this.selectedStatus || i.estado === this.selectedStatus;

        return coincideTexto && areaOk && nombreOk && statusOk;
      });
    }
  },

  methods: {
    // Cargar todos los datos iniciales
    async cargarDatos() {
      this.cargando = true;
      try {
        // Cargar incidencias
        const incidenciasRes = await incidenciasService.getIncidencias();
        if (incidenciasRes.success) {
          this.incidencias = incidenciasRes.data;
          
          // Extraer listas únicas de áreas y nombres
          const areas = new Set(incidenciasRes.data.map(i => i.area).filter(Boolean));
          const nombres = new Set(incidenciasRes.data.map(i => i.nombre_completo).filter(Boolean));
          
          this.areaItems = Array.from(areas);
          this.nombreItems = Array.from(nombres);
        }
        
        // Cargar estados
        const estadosRes = await incidenciasService.getEstadosIncidencia();
        if (estadosRes.success) {
          this.estadosIncidencia = estadosRes.data;
          this.statusItems = estadosRes.data.map(e => e.nombre);
        }
        
        // Cargar tipos
        const tiposRes = await incidenciasService.getTiposIncidencia();
        if (tiposRes.success) {
          this.tiposIncidencia = tiposRes.data;
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        this.$emit('mostrar-toast', {
          color: 'error',
          mensaje: 'Error al cargar las incidencias'
        });
      } finally {
        this.cargando = false;
      }
    },

    abrirReporte() {
      // Inicializar con rango del mes actual
      const hoy = new Date();
      this.fechaInicio = null;
      this.fechaFin = null;
      this.rangoRapido = null;
      this.tipoReporte = null;
      this.reporteDialog = true;
    },
    
    aplicarRangoRapido(tipo) {
      const hoy = new Date();
      this.rangoRapido = tipo;
      
      if (tipo === 'hoy') {
        this.fechaInicio = hoy;
        this.fechaFin = hoy;
      } else if (tipo === 'mes') {
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        this.fechaInicio = primerDia;
        this.fechaFin = ultimoDia;
      }
    },
    
    async generarReporte() {
      // Validar que se hayan seleccionado los campos
      if (!this.fechaInicio || !this.fechaFin) {
        this.$emit('mostrar-toast', {
          color: 'error',
          mensaje: 'Por favor selecciona un rango de fechas'
        });
        return;
      }
      
      if (!this.tipoReporte) {
        this.$emit('mostrar-toast', {
          color: 'error',
          mensaje: 'Por favor selecciona un tipo de reporte (PDF o EXCEL)'
        });
        return;
      }

      try {
        // Filtrar incidencias por rango de fechas
        const inicio = new Date(this.fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(this.fechaFin);
        fin.setHours(23, 59, 59, 999);
        
        const datosReporte = this.incidenciasFiltradas.filter(incidencia => {
          // Parsear la fecha en formato DD/MM/YYYY
          const [dia, mes, anio] = incidencia.fecha_inicio.split('/');
          const fechaIncidencia = new Date(anio, mes - 1, dia);
          return fechaIncidencia >= inicio && fechaIncidencia <= fin;
        });
        
        if (datosReporte.length === 0) {
          this.$emit('mostrar-toast', {
            color: 'warning',
            mensaje: 'No hay incidencias para generar el reporte'
          });
          return;
        }

        if (this.tipoReporte === 'PDF') {
          this.generarReportePDF(datosReporte);
        } else if (this.tipoReporte === 'EXCEL') {
          this.generarReporteExcel(datosReporte);
        }
        
        this.reporteDialog = false;
        this.$emit('mostrar-toast', {
          color: 'success',
          mensaje: `Reporte ${this.tipoReporte} generado exitosamente`
        });
      } catch (error) {
        console.error('Error al generar reporte:', error);
        this.$emit('mostrar-toast', {
          color: 'error',
          mensaje: 'Error al generar el reporte'
        });
      }
    },
    
    generarReportePDF(datos) {
      // Crear contenido HTML para el PDF
      let contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Incidencias</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4F39F6; text-align: center; }
            .fecha { text-align: center; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #4F39F6; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:hover { background-color: #f5f5f5; }
            .estado { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
            .estado.pendiente { background-color: #fef3c7; color: #92400e; }
            .estado.aprobada { background-color: #dcfce7; color: #166534; }
            .estado.rechazada { background-color: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <h1>Reporte de Incidencias</h1>
          <p class="fecha">Período: ${this.formatearFecha(this.fechaInicio)} - ${this.formatearFecha(this.fechaFin)}</p>
          <p class="fecha" style="margin-top: -15px; font-size: 12px;">Generado: ${new Date().toLocaleDateString('es-MX')}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Empleado</th>
                <th>Tipo</th>
                <th>Área</th>
                <th>Fecha Inicio</th>
                <th>Estado</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      datos.forEach((incidencia, index) => {
        const estadoClass = incidencia.estado.toLowerCase().replace(' ', '-');
        contenidoHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${incidencia.nombre_completo}</td>
            <td>${incidencia.tipo}</td>
            <td>${incidencia.area}</td>
            <td>${incidencia.fecha_inicio}</td>
            <td><span class="estado ${estadoClass}">${incidencia.estado}</span></td>
            <td>${incidencia.descripcion || 'Sin descripción'}</td>
          </tr>
        `;
      });
      
      contenidoHTML += `
            </tbody>
          </table>
          <p style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            Total de incidencias: ${datos.length}
          </p>
        </body>
        </html>
      `;
      
      // Abrir en nueva ventana para imprimir como PDF
      const ventana = window.open('', '_blank');
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
      // Esperar a que cargue y luego mostrar el diálogo de impresión
      ventana.onload = () => {
        ventana.print();
      };
    },
    
    generarReporteExcel(datos) {
      // Crear contenido CSV (compatible con Excel)
      let csv = 'Número,Empleado,Tipo,Área,Fecha Inicio,Estado,Descripción\n';
      
      datos.forEach((incidencia, index) => {
        const descripcion = (incidencia.descripcion || 'Sin descripción').replace(/,/g, ';').replace(/\n/g, ' ');
        csv += `${index + 1},${incidencia.nombre_completo},${incidencia.tipo},${incidencia.area},${incidencia.fecha_inicio},${incidencia.estado},"${descripcion}"\n`;
      });
      
      // Crear blob y descargar
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const nombreArchivo = `reporte_incidencias_${this.formatearFecha(this.fechaInicio)}_${this.formatearFecha(this.fechaFin)}.csv`.replace(/\//g, '-');
      link.setAttribute('href', url);
      link.setAttribute('download', nombreArchivo);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    formatearFecha(fecha) {
      if (!fecha) return '';
      const f = new Date(fecha);
      const dia = String(f.getDate()).padStart(2, '0');
      const mes = String(f.getMonth() + 1).padStart(2, '0');
      const anio = f.getFullYear();
      return `${dia}/${mes}/${anio}`;
    },
    
    async eliminarIncidencia(id) {
      if (confirm('¿Estás seguro de que deseas eliminar esta incidencia?')) {
        try {
          const resultado = await incidenciasService.deleteIncidencia(id);
          if (resultado.success) {
            this.incidencias = this.incidencias.filter(i => i.id !== id);
            this.$emit('mostrar-toast', {
              color: 'success',
              mensaje: 'Incidencia eliminada correctamente'
            });
          }
        } catch (error) {
          this.$emit('mostrar-toast', {
            color: 'error',
            mensaje: 'Error al eliminar la incidencia'
          });
        }
      }
    },

    async abrirIncidencia(incidencia) {
      this.incidenciaSeleccionada = incidencia;
      this.tipoIncidenciaEdit = incidencia.tipo_id;
      this.modoEdicion = false;
      this.archivoInfo = null;
      this.dialogIncidencia = true;
      
      // Cargar información del archivo si existe
      if (incidencia.archivo_id) {
        await this.cargarArchivo(incidencia.archivo_id);
      }
    },
    
    async cargarArchivo(archivoId) {
      this.cargandoArchivo = true;
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/archivo/${archivoId}`, {
          withCredentials: true
        });
        
        console.log('Respuesta del archivo:', response.data);
        
        // Manejar ambas estructuras de respuesta: {ok, archivo} y {success, data}
        if ((response.data.ok && response.data.archivo) || (response.data.success && response.data.data)) {
          this.archivoInfo = response.data.archivo || response.data.data;
        } else {
          console.error('Estructura de respuesta inesperada:', response.data);
          this.archivoInfo = null;
        }
      } catch (error) {
        console.error('Error al cargar archivo:', error);
        console.error('Detalles del error:', error.response?.data);
        this.archivoInfo = null;
      } finally {
        this.cargandoArchivo = false;
      }
    },
    
    async verArchivo() {
      this.mostrarVisorArchivo = true;
      await this.obtenerUrlFirmada();
    },
    
    async obtenerUrlFirmada() {
      if (!this.archivoInfo || !this.archivoInfo.storage_url) return;
      
      this.cargandoUrlFirmada = true;
      try {
        // Extraer el nombre del archivo de la URL de S3
        const fileName = this.archivoInfo.storage_url.split('/').pop();
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const response = await axios.get(`${API_URL}/get-file/${fileName}`, {
          withCredentials: true
        });
        
        if (response.data.ok && response.data.url) {
          this.urlFirmada = response.data.url;
        } else {
          console.error('No se pudo obtener URL firmada:', response.data);
          this.urlFirmada = null;
        }
      } catch (error) {
        console.error('Error al obtener URL firmada:', error);
        this.urlFirmada = null;
      } finally {
        this.cargandoUrlFirmada = false;
      }
    },
    
    cerrarVisor() {
      this.mostrarVisorArchivo = false;
      this.urlFirmada = null;
    },
    
    descargarArchivo() {
      if (this.archivoInfo && this.archivoInfo.storage_url) {
        // Extraer el nombre del archivo de la URL de S3
        const fileName = this.archivoInfo.storage_url.split('/').pop();
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.open(`${API_URL}/download-file/${fileName}`, '_blank');
      }
    },
    
    esImagen(tipoMime) {
      return tipoMime && tipoMime.startsWith('image/');
    },
    
    esPDF(tipoMime) {
      return tipoMime && tipoMime === 'application/pdf';
    },
    
    obtenerIconoArchivo(tipoMime) {
      if (!tipoMime) return 'mdi-file';
      
      if (tipoMime.includes('pdf')) return 'mdi-file-pdf-box';
      if (tipoMime.includes('image')) return 'mdi-file-image';
      if (tipoMime.includes('word') || tipoMime.includes('document')) return 'mdi-file-word';
      if (tipoMime.includes('excel') || tipoMime.includes('spreadsheet')) return 'mdi-file-excel';
      
      return 'mdi-file-document';
    },
    
    formatearTamano(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },
    
    activarEdicion() {
      this.modoEdicion = true;
    },
    
    cancelarEdicion() {
      this.modoEdicion = false;
      this.tipoIncidenciaEdit = this.incidenciaSeleccionada.tipo_id;
    },
    
    async guardarCambios() {
      try {
        const resultado = await incidenciasService.updateIncidencia(
          this.incidenciaSeleccionada.id,
          { tipo_id: this.tipoIncidenciaEdit }
        );
        
        if (resultado.success) {
          // Actualizar en la lista
          const index = this.incidencias.findIndex(i => i.id === this.incidenciaSeleccionada.id);
          if (index !== -1) {
            // Buscar el nombre del tipo seleccionado
            const tipoSeleccionado = this.tiposIncidencia.find(t => t.id === this.tipoIncidenciaEdit);
            if (tipoSeleccionado) {
              this.incidencias[index].tipo = tipoSeleccionado.nombre;
              this.incidencias[index].tipo_codigo = tipoSeleccionado.codigo;
              this.incidenciaSeleccionada.tipo = tipoSeleccionado.nombre;
            }
          }
          
          this.modoEdicion = false;
          this.$emit('mostrar-toast', {
            color: 'success',
            mensaje: 'Tipo de incidencia actualizado correctamente'
          });
        }
      } catch (error) {
        this.$emit('mostrar-toast', {
          color: 'error',
          mensaje: 'Error al actualizar el tipo de incidencia'
        });
      }
    },
    
    async aprobarIncidencia() {
      try {
        const resultado = await incidenciasService.approveIncidencia(this.incidenciaSeleccionada.id);
        if (resultado.success) {
          // Actualizar la incidencia en la lista
          const index = this.incidencias.findIndex(i => i.id === this.incidenciaSeleccionada.id);
          if (index !== -1) {
            this.incidencias[index].estado = 'Aprobada';
          }
          
          this.incidenciaSeleccionada.estado = 'Aprobada';
          this.incidenciaSeleccionada.motivo = '';
          this.dialogIncidencia = false;
          this.incidenciaSeleccionada = null;
          
          this.$emit('mostrar-toast', {
            color: 'success',
            mensaje: 'Incidencia aprobada correctamente'
          });
        }
      } catch (error) {
        this.$emit('mostrar-toast', {
          color: 'error',
          mensaje: 'Error al aprobar la incidencia'
        });
      }
    },
    
    rechazarIncidencia() {
      this.dialogIncidencia = false;
      this.dialogRechazo = true;
    },
    
    async confirmarRechazo() {
      if (!this.motivoRechazo.trim()) {
        this.$emit('mostrar-toast', {
          color: 'error',
          mensaje: 'Por favor ingresa una razón del rechazo.'
        });
        return;
      }

      try {
        const resultado = await incidenciasService.rejectIncidencia(
          this.incidenciaSeleccionada.id,
          this.motivoRechazo
        );
        
        if (resultado.success) {
          // Actualizar la incidencia en la lista
          const index = this.incidencias.findIndex(i => i.id === this.incidenciaSeleccionada.id);
          if (index !== -1) {
            this.incidencias[index].estado = 'Rechazada';
            this.incidencias[index].descripcion = `RECHAZADA: ${this.motivoRechazo}`;
          }
          
          this.incidenciaSeleccionada.estado = 'Rechazada';
          this.incidenciaSeleccionada.motivo = this.motivoRechazo;
          this.incidenciaSeleccionada.descripcion = `RECHAZADA: ${this.motivoRechazo}`;
          
          this.dialogRechazo = false;
          this.motivoRechazo = '';
          this.dialogIncidencia = false;
          this.incidenciaSeleccionada = null;
          
          this.$emit('mostrar-toast', {
            color: 'success',
            mensaje: 'Incidencia rechazada correctamente'
          });
        }
      } catch (error) {
        this.$emit('mostrar-toast', {
          color: 'error',
          mensaje: 'Error al rechazar la incidencia'
        });
      }
    }
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
        <!-- Botón Recargar -->
        <v-btn class="btn-Greporte" @click="cargarDatos" :loading="cargando" title="Recargar incidencias">
          <span class="material-symbols-rounded">refresh</span>
          Recargar
        </v-btn>
        
        <!-- Botón Generar Reporte -->
<v-btn class="btn-Greporte" @click="abrirReporte">
  <span class="material-symbols-rounded">description</span>
  Generar reporte
</v-btn>

<!-- Modal de reporte mejorado -->
<v-dialog
  v-model="reporteDialog"
  max-width="420"
  transition="dialog-bottom-transition"
  persistent
>
  <v-card
    class="reporte-card-elegante pa-6"
    elevation="8"
  >
    <!-- Botón de cierre -->
    <div class="d-flex justify-end">
      <v-btn icon variant="text" class="cerrar-modal" @click="reporteDialog = false">
        <v-icon size="22">mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Contenido -->
    <v-card-text>
      <!-- Opciones rápidas -->
      <label class="label-modal mb-2">Rango rápido:</label>
      <div class="botones-rapidos mb-4">
        <v-btn
          :class="['btn-rapido', rangoRapido === 'hoy' ? 'activo' : '']"
          variant="outlined"
          size="small"
          @click="aplicarRangoRapido('hoy')"
        >
          <v-icon left size="18">mdi-calendar-today</v-icon>
          Solo hoy
        </v-btn>
        <v-btn
          :class="['btn-rapido', rangoRapido === 'mes' ? 'activo' : '']"
          variant="outlined"
          size="small"
          @click="aplicarRangoRapido('mes')"
        >
          <v-icon left size="18">mdi-calendar-month</v-icon>
          Este mes
        </v-btn>
      </div>

      <!-- Fecha inicio -->
      <label class="label-modal">Fecha inicio:</label>
      <v-date-picker
        v-model="fechaInicio"
        color="primary"
        class="mb-4"
        hide-header
      ></v-date-picker>

      <!-- Fecha fin -->
      <label class="label-modal mt-3">Fecha fin:</label>
      <v-date-picker
        v-model="fechaFin"
        color="primary"
        class="mb-4"
        hide-header
      ></v-date-picker>

      <label class="label-modal mb-2">Generar como:</label>

      <div class="botones-tipo">
        <v-btn
          :class="['btn-tipo', tipoReporte === 'PDF' ? 'activo-pdf' : '']"
          variant="flat"
          rounded="xl"
          size="large"
          @click="tipoReporte = 'PDF'"
        >
          <v-icon left>mdi-file-pdf-box</v-icon>
          PDF
        </v-btn>

        <v-btn
          :class="['btn-tipo', tipoReporte === 'EXCEL' ? 'activo-excel' : '']"
          variant="flat"
          rounded="xl"
          size="large"
          @click="tipoReporte = 'EXCEL'"
        >
          <v-icon left>mdi-microsoft-excel</v-icon>
          EXCEL
        </v-btn>
      </div>
    </v-card-text>

    <!-- Botón generar -->
    <v-card-actions class="justify-center mt-4">
      <v-btn
        color="primary"
        rounded="xl"
        size="large"
        elevation="4"
        class="btn-generar"
        @click="generarReporte"
      >
        <v-icon left>mdi-file-document-outline</v-icon>
        Generar reporte
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
          <h2>{{ incidencias.filter(i => i.estado === 'Pendiente').length }}</h2>
          <p>Pendientes</p>
        </div>

        <div class="revisados">
          <span class="material-symbols-rounded">visibility</span>
          <h2>{{ incidencias.filter(i => i.estado === 'Aprobada').length }}</h2>
          <p>Aprobadas</p>
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
<div class="lista-incidencias">
  <div
    v-for="(incidencia, index) in incidenciasFiltradas"
    :key="incidencia.id"
    class="incidencia-card"
    @click="abrirIncidencia(incidencia)"
    style="cursor:pointer"
  >
    <div class="incidencia-num">{{ index + 1 }}</div>

    <div class="incidencia-info">
      <p class="asunto">{{ incidencia.tipo }} - {{ incidencia.fecha_inicio }}</p>
      <p class="detalles">
        <strong>Área:</strong> {{ incidencia.area }} —
        <strong>Empleado:</strong> {{ incidencia.nombre_completo }} —
        <strong>Estado:</strong>
        <span
          :class="[
            'status-tag',
            incidencia.estado === 'Pendiente'
            ? 'pendiente'
            : incidencia.estado === 'Rechazada'
            ? 'rechazada'
            : 'revisado'
          ]"
        >
          {{ incidencia.estado }}
        </span>
      </p>
    </div>
  </div>

  <div v-if="incidenciasFiltradas.length === 0" class="no-incidencias">
    <span class="material-symbols-rounded">check_circle</span>
    <p>No hay solicitudes de revisión pendientes</p>
    <p><strong>Todas las asignaciones están al día</strong></p>
  </div>
</div>

<!-- Modal de información de la incidencia -->

<v-dialog v-model="dialogIncidencia" max-width="600" scrollable>
  <v-card class="pa-6 rounded-xl" elevation="8">
    <v-card-title class="text-h6 text-center d-flex align-center justify-center mb-2">
      <span>Detalles de la incidencia</span>
    </v-card-title>

    <v-divider class="mb-4"></v-divider>

    <v-card-text v-if="incidenciaSeleccionada" class="modal-content">
      <div class="detalle-item">
        <label><strong>Tipo:</strong></label>
        <div v-if="!modoEdicion">
          <p style="display: inline-block;">{{ incidenciaSeleccionada.tipo }}</p>
          <v-btn 
            icon 
            size="small" 
            variant="text" 
            color="primary" 
            @click="activarEdicion"
            class="ml-2"
            title="Editar tipo de incidencia"
          >
            <v-icon size="18">mdi-pencil</v-icon>
          </v-btn>
        </div>
        <div v-else>
          <v-select
            v-model="tipoIncidenciaEdit"
            :items="tiposIncidencia"
            item-title="nombre"
            item-value="id"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-2"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :title="`${item.raw.codigo} - ${item.raw.nombre}`"></v-list-item>
            </template>
            <template #selection="{ item }">
              {{ item.raw.codigo }} - {{ item.raw.nombre }}
            </template>
          </v-select>
          <div class="d-flex gap-2 mt-2">
            <v-btn 
              size="small" 
              color="success" 
              variant="flat"
              @click="guardarCambios"
            >
              <v-icon left size="16">mdi-check</v-icon>
              Guardar
            </v-btn>
            <v-btn 
              size="small" 
              color="error" 
              variant="outlined"
              @click="cancelarEdicion"
            >
              <v-icon left size="16">mdi-close</v-icon>
              Cancelar
            </v-btn>
          </div>
        </div>
      </div>

      <div class="detalle-item">
        <label><strong>Fecha inicio:</strong></label>
        <p>{{ incidenciaSeleccionada.fecha_inicio }}</p>
      </div>

      <div class="detalle-item">
        <label><strong>Área:</strong></label>
        <p>{{ incidenciaSeleccionada.area }}</p>
      </div>

      <div class="detalle-item">
        <label><strong>Empleado:</strong></label>
        <p>{{ incidenciaSeleccionada.nombre_completo }}</p>
      </div>

      <div class="detalle-item descripcion-item">
        <label><strong>Descripción:</strong></label>
        <p class="descripcion-text">{{ incidenciaSeleccionada.descripcion || 'Sin descripción' }}</p>
      </div>

      <div class="detalle-item">
        <label><strong>Estado actual:</strong></label>
        <span
          :class="[
            'status-tag',
            incidenciaSeleccionada.estado === 'Pendiente'
              ? 'pendiente'
              : incidenciaSeleccionada.estado === 'Rechazada'
              ? 'rechazada'
              : 'revisado'
          ]"
        >
          {{ incidenciaSeleccionada.estado }}
        </span>
      </div>

      <!-- Documento adjunto -->
      <div v-if="incidenciaSeleccionada.archivo_id" class="detalle-item">
        <label><strong>Documento adjunto:</strong></label>
        
        <div v-if="cargandoArchivo" class="archivo-cargando">
          <v-progress-circular indeterminate size="24" width="2" color="primary"></v-progress-circular>
          <span>Cargando archivo...</span>
        </div>
        
        <div v-else-if="archivoInfo" class="archivo-card">
          <div class="archivo-icon">
            <v-icon :icon="obtenerIconoArchivo(archivoInfo.tipo_mime)" size="48" color="primary"></v-icon>
          </div>
          <div class="archivo-detalles">
            <p class="archivo-nombre">{{ archivoInfo.nombre }}</p>
            <p class="archivo-info">
              <span>{{ formatearTamano(archivoInfo.tamano_bytes) }}</span>
              <span class="separador">•</span>
              <span>{{ new Date(archivoInfo.creado_en).toLocaleDateString('es-MX') }}</span>
            </p>
          </div>
          <div class="archivo-acciones">
            <v-btn
              icon
              variant="tonal"
              color="primary"
              @click="verArchivo"
              title="Ver archivo"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="tonal"
              color="success"
              @click="descargarArchivo"
              title="Descargar archivo"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </div>
        </div>
        
        <div v-else class="archivo-error">
          <v-icon color="error">mdi-alert-circle</v-icon>
          <span>No se pudo cargar el archivo</span>
        </div>
      </div>

      <!-- Motivo del rechazo dentro del modal -->
      <div
        v-if="incidenciaSeleccionada.estado === 'Rechazada' && incidenciaSeleccionada.descripcion?.includes('RECHAZADA')"
        class="motivo-box mt-4"
      >
        <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
        <div>
          <strong>Motivo del rechazo:</strong>
          <p class="motivo-text">{{ incidenciaSeleccionada.descripcion }}</p>
        </div>
      </div>
    </v-card-text>

    <v-card-actions
      v-if="incidenciaSeleccionada && incidenciaSeleccionada.estado === 'Pendiente' && puedeAprobarRechazar"
      class="justify-center mt-4"
    >
      <v-btn color="success" rounded="xl" @click="aprobarIncidencia">
        <v-icon left>mdi-check-circle</v-icon> Aprobar
      </v-btn>
      <v-btn color="error" rounded="xl" @click="rechazarIncidencia">
        <v-icon left>mdi-close-circle</v-icon> Rechazar
      </v-btn>
    </v-card-actions>


  </v-card>
</v-dialog>


<!-- Modal de rechazo -->
<v-dialog v-model="dialogRechazo" max-width="450">
  <v-card class="pa-5 rounded-xl" elevation="8">
    <v-card-title class="text-h6 text-center mb-2">
      <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
      Escribe el motivo del rechazo
    </v-card-title>

    <v-divider class="mb-3"></v-divider>

    <v-card-text>
      <v-textarea
        v-model="motivoRechazo"
        label="Motivo del rechazo"
        auto-grow
        outlined
        clearable
        rows="3"
      ></v-textarea>
    </v-card-text>

    <v-card-actions class="justify-center">
      <v-btn color="primary" rounded="xl" @click="confirmarRechazo">
        Confirmar
      </v-btn>
      <v-btn text @click="dialogRechazo = false">
        Cancelar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- Modal visor de archivos -->
<v-dialog v-model="mostrarVisorArchivo" max-width="900" scrollable>
  <v-card class="visor-archivo-card">
    <v-card-title class="d-flex justify-space-between align-center pa-4">
      <div class="d-flex align-center gap-2">
        <v-icon :icon="obtenerIconoArchivo(archivoInfo?.tipo_mime)" color="primary" size="24"></v-icon>
        <span class="text-h6">{{ archivoInfo?.nombre }}</span>
      </div>
      <v-btn icon variant="text" @click="cerrarVisor">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <v-card-text class="pa-0 visor-contenido">
      <!-- Loading mientras se obtiene URL firmada -->
      <div v-if="cargandoUrlFirmada" class="visor-loading">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <p class="mt-4">Cargando archivo...</p>
      </div>
      
      <!-- Vista previa para imágenes -->
      <div v-else-if="archivoInfo && urlFirmada && esImagen(archivoInfo.tipo_mime)" class="imagen-container">
        <img :src="urlFirmada" :alt="archivoInfo.nombre" class="imagen-preview" />
      </div>
      
      <!-- Vista previa para PDFs -->
      <div v-else-if="archivoInfo && urlFirmada && esPDF(archivoInfo.tipo_mime)" class="pdf-container">
        <iframe 
          :src="urlFirmada" 
          frameborder="0"
          class="pdf-viewer"
        ></iframe>
      </div>
      
      <!-- Mensaje para otros tipos de archivo -->
      <div v-else class="no-preview">
        <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
        <p class="mt-4">Vista previa no disponible para este tipo de archivo</p>
        <v-btn color="primary" @click="descargarArchivo" class="mt-4">
          <v-icon left>mdi-download</v-icon>
          Descargar archivo
        </v-btn>
      </div>
    </v-card-text>
    
    <v-divider></v-divider>
    
    <v-card-actions class="pa-4">
      <div class="archivo-info-footer">
        <span>{{ formatearTamano(archivoInfo?.tamano_bytes) }}</span>
        <span class="separador">•</span>
        <span>{{ new Date(archivoInfo?.creado_en).toLocaleDateString('es-MX') }}</span>
      </div>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="descargarArchivo">
        <v-icon left>mdi-download</v-icon>
        Descargar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

  </div>
</template>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.incidencias-content {
  flex: 1;
  min-height: 100vh;
  background-color: #E4E4E7;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 2rem;
  transition: all 0.3s ease;
  
  margin-left: 60px;
  width: calc(100% - 60px);
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

/* -- Ventana generar reporte estilos --*/
.v-overlay__scrim {
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.3) !important;
}
.reporte-card-elegante {
  border-radius: 20px;
  background-color: #ffffff !important;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.cerrar-modal {
  color: #9ca3af !important;
  transition: transform 0.2s ease, color 0.2s ease;
}
.cerrar-modal:hover {
  color: #ef4444 !important;
  transform: rotate(90deg);
}
.label-modal {
  display: block;
  text-align: left;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

/* ----------- Estilos del campo de fecha ----------- */
.campo-fecha :deep(.v-field__outline__start),
.campo-fecha :deep(.v-field__outline__end) {
  border-color: #d1d5db !important;
  transition: all 0.25s ease;
}

/* Hover */
.campo-fecha:hover :deep(.v-field__outline__start),
.campo-fecha:hover :deep(.v-field__outline__end) {
  border-color: #6366f1 !important;
}

/* Cuando hay fecha seleccionada */
.fecha-activa :deep(.v-field__outline__start),
.fecha-activa :deep(.v-field__outline__end) {
  border-color: #7c3aed !important; /* morado */
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
}

.fecha-activa :deep(input) {
  color: #7c3aed !important;
  font-weight: 600;
}

/* Iconos del campo */
.campo-fecha ::v-deep(.v-field__prepend-inner .v-icon),
.fecha-activa ::v-deep(.v-field__prepend-inner .v-icon) {
  color: #6b7280 !important;
}
.campo-fecha ::v-deep(.v-field__append-inner .v-icon),
.fecha-activa ::v-deep(.v-field__append-inner .v-icon) {
  color: #9ca3af !important;
  transition: color 0.2s ease;
  cursor: pointer;
}
.campo-fecha ::v-deep(.v-field__append-inner .v-icon:hover),
.fecha-activa ::v-deep(.v-field__append-inner .v-icon:hover) {
  color: #ef4444 !important;
}

.botones-tipo {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-tipo {
  background-color: #f9fafb !important;
  color: #111827 !important;
  border: 1px solid #d1d5db !important;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
}
.btn-tipo:hover {
  transform: scale(1.05);
}
.activo-pdf {
  background-color: #fee2e2 !important;
  border-color: #ef4444 !important;
  color: #b91c1c !important;
}
.activo-excel {
  background-color: #dcfce7 !important;
  border-color: #16a34a !important;
  color: #166534 !important;
}
/* Botón ancho y llamativo */
.btn-generar {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white !important;
  font-weight: 600;
  padding: 0.6rem 2rem;
  transition: all 0.3s ease;
}
.btn-generar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(99, 102, 241, 0.4);
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
.status-tag.rechazada {
  background-color: #f8d7da;
  color: #721c24;
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

/* --- Estilo para el motivo del rechazo dentro del modal --- */
.motivo-box {
  display: flex;
  align-items: flex-start;
  background: #fee2e2;
  border-left: 5px solid #ef4444;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
  color: #991b1b;
  max-height: 200px; /* evita que crezca demasiado */
  overflow-y: auto; /* agrega scroll si es muy largo */
  word-wrap: break-word; /* evita que se salga del contenedor */
  white-space: pre-wrap; /* conserva saltos de línea y adapta el texto */
  line-height: 1.4;
}

.motivo-box p {
  margin: 0.25rem 0 0 0;
  font-size: 0.95rem;
  overflow-wrap: break-word;
}

.motivo-box::-webkit-scrollbar {
  width: 6px;
}
.motivo-box::-webkit-scrollbar-thumb {
  background-color: #f87171;
  border-radius: 8px;
}

@media (min-width: 1024px) {
  .incidencias-content {
    padding: 3rem;
  }
}

/* Estilos para modal dinámico */
.modal-content {
  max-height: 70vh;
  overflow-y: auto;
}

.detalle-item {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.detalle-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detalle-item label {
  display: block;
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.detalle-item p {
  margin: 0;
  color: #111827;
  font-size: 0.95rem;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.descripcion-item p.descripcion-text {
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid #6366f1;
}

.motivo-text {
  margin: 0.5rem 0 0 0;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

/* Scroll personalizado para modal */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 8px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Estilos para botones de edición */
.d-flex.gap-2 {
  gap: 8px;
}

/* Botones rápidos de rango */
.botones-rapidos {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-rapido {
  flex: 1;
  transition: all 0.2s ease;
}

.btn-rapido.activo {
  background-color: #6366f1 !important;
  color: white !important;
  border-color: #6366f1 !important;
}

/* Estilos para documento adjunto */
.archivo-cargando {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.9rem;
}

.archivo-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  border-radius: 12px;
  border: 1px solid #d1d9e6;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
}

.archivo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.archivo-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.archivo-detalles {
  flex: 1;
  min-width: 0;
}

.archivo-nombre {
  margin: 0 0 4px 0;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.archivo-info {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.archivo-info .separador {
  color: #d1d5db;
}

.archivo-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1rem;
  background-color: #fef2f2;
  border-radius: 8px;
  color: #991b1b;
  font-size: 0.9rem;
  border-left: 3px solid #ef4444;
}

.archivo-acciones {
  display: flex;
  gap: 8px;
}

/* Estilos para el visor de archivos */
.visor-archivo-card {
  max-height: 90vh;
}

.visor-contenido {
  min-height: 500px;
  max-height: calc(90vh - 180px);
  background-color: #f5f5f5;
}

.visor-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  color: #6b7280;
  text-align: center;
}

.imagen-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #1a1a1a;
}

.imagen-preview {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pdf-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.pdf-viewer {
  width: 100%;
  height: 70vh;
  border: none;
}

.no-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
  text-align: center;
  padding: 2rem;
}

.archivo-info-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.9rem;
}

.archivo-info-footer .separador {
  color: #d1d5db;
}
</style>
