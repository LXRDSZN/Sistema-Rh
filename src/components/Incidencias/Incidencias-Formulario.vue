<script setup>
  import { ref, computed } from 'vue'
  import * as incidenciasService from '@/services/incidenciasService'

  const emit = defineEmits(['cerrar', 'incidencia-creada'])

  // Form data
  const usuario = ref('')
  const tipoIncidencia = ref('')
  const fechaInicio = ref(new Date().toISOString().split('T')[0])
  const descripcion = ref('')
  const archivo = ref(null)
  
  // UI state
  const fileName = ref('Subir archivo')
  const fileInput = ref(null)
  const isLoading = ref(false)
  const tiposIncidencia = ref([])
  const empleados = ref([])

  // Tipos de incidencia disponibles (opciones fijas)
  const tiposIncidenciaOpciones = [
    { id: 'incapacidad', nombre: 'Incapacidad' },
    { id: 'retardo', nombre: 'Retardo' },
    { id: 'falta', nombre: 'Falta' },
    { id: 'permiso', nombre: 'Permiso' },
    { id: 'vacaciones', nombre: 'Vacaciones' },
    { id: 'amonestacion', nombre: 'Amonestación' },
    { id: 'accidente', nombre: 'Accidente de Trabajo' },
    { id: 'conflicto', nombre: 'Conflicto Laboral' },
    { id: 'licencia_especial', nombre: 'Licencia Especial' },
    { id: 'disciplina', nombre: 'Incidente de Disciplina' }
  ]

  // Cargar datos iniciales
  const cargarDatos = async () => {
    try {
      // Cargar empleados
      const resEmpleados = await empleadosService.getEmpleados()
      if (resEmpleados.success) {
        empleados.value = resEmpleados.data
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }

  onMounted(() => {
    cargarDatos()
  })

  const triggerFile = () => {
    fileInput.value.click()
  }

  const handleFile = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword']
      if (!tiposPermitidos.includes(file.type)) {
        alert('Solo se permiten archivos: PDF, JPG, PNG, DOC')
        return
      }
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar 5MB')
        return
      }
      
      archivo.value = file
      fileName.value = file.name
    } else {
      archivo.value = null
      fileName.value = 'Subir archivo'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!usuario.value || !tipoIncidencia.value || !fechaInicio.value || !descripcion.value) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    isLoading.value = true
    try {
      let archivoId = null

      // Si hay archivo, subirlo primero
      if (archivo.value) {
        try {
          const uploadRes = await incidenciasService.uploadArchivo(archivo.value)
          if (uploadRes.success) {
            archivoId = uploadRes.data.id
          } else {
            alert('Error al subir el archivo: ' + uploadRes.message)
            isLoading.value = false
            return
          }
        } catch (uploadError) {
          alert('Error al subir el archivo: ' + uploadError.message)
          isLoading.value = false
          return
        }
      }

      // Crear la incidencia
      const datosIncidencia = {
        persona_id: usuario.value,
        tipo: tipoIncidencia.value,
        fecha_inicio: fechaInicio.value,
        descripcion: descripcion.value,
        archivo_id: archivoId
      }

      // Crear la incidencia en la BD
      const resultado = await incidenciasService.createIncidencia(datosIncidencia)
      
      if (resultado.success) {
        emit('incidencia-creada', resultado.data)
        emit('cerrar')
        
        // Limpiar formulario
        usuario.value = ''
        tipoIncidencia.value = ''
        fechaInicio.value = new Date().toISOString().split('T')[0]
        descripcion.value = ''
        archivo.value = null
        fileName.value = 'Subir archivo'
      }
    } catch (error) {
      console.error('Error al crear incidencia:', error)
      alert('Error al crear la incidencia: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  import { onMounted } from 'vue'
  import * as empleadosService from '@/services/empleadosService'
</script>




<template>
  <div class="incidencias-formulario" @click.self="$emit('cerrar')">
    <div class="modal-card">
      <header class="modal-header">
        <button class="btn-cerrar" @click="$emit('cerrar')">&times;</button>
      </header>

      <form class="form" @submit="handleSubmit">
        <div class="form-group">
          <label>Usuario (Empleado) *</label>
          <select v-model="usuario" class="input" required>
            <option value="" disabled>Selecciona un empleado</option>
            <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
              {{ emp.nombre }} {{ emp.apellido_paterno }} {{ emp.apellido_materno }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Tipo de Incidencia *</label>
          <select v-model="tipoIncidencia" class="input" required>
            <option value="" disabled>Selecciona un tipo</option>
            <option v-for="tipo in tiposIncidenciaOpciones" :key="tipo.id" :value="tipo.nombre">
              {{ tipo.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Fecha de Inicio *</label>
          <input
            type="date"
            v-model="fechaInicio"
            class="input"
            required
          />
        </div>

        <div class="form-group">
          <label>Descripción *</label>
          <textarea
            v-model="descripcion"
            rows="3"
            placeholder="Describe la incidencia detalladamente..."
            class="textarea"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label>Subir documento (Opcional).</label>
          <input type="file" ref="fileInput" @change="handleFile" style="display:none" />
          <button type="button" class="upload-btn" @click="triggerFile" :disabled="isLoading">
            <span class="material-symbols-rounded">upload_file</span>
            {{ fileName }}
          </button>
          <small style="display: block; margin-top: 5px; color: #666;">
            Máximo 5MB. Formatos: PDF, JPG, PNG, DOC
          </small>
        </div>

        <div class="form-footer">
          <button type="button" class="btn-cancelar" @click="$emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn-reportar" :disabled="isLoading">
            {{ isLoading ? 'Guardando...' : 'Reportar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Fondo difuminado */
.incidencias-formulario {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Tarjeta principal */
.modal-card {
  background: #f3f3f4;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  padding-bottom: 10px;
  animation: fadeIn 0.3s ease;
  position: relative;
}

/* Header (solo botón de cierre a la derecha) */
.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 15px 25px 5px 25px;
}

/* Botón cerrar (animación de giro en su lugar) */
.btn-cerrar {
  background: none;
  border: none;
  color: #333;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}

.btn-cerrar:hover {
  color: #ef4444 !important;
  transform: rotate(90deg);
}

/* Formulario */
.form {
  padding: 0 30px 20px;
}

.form-group {
  margin-bottom: 14px;
}

label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.input,
.textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: #fff;
  font-size: 0.95rem;
  transition: all 0.25s ease;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #4f39f6;
  box-shadow: 0 0 0 3px rgba(108, 71, 255, 0.1);
}

/* Caja de subir archivo */
.upload-box {
  display: flex;
  align-items: center;
  gap: 12px;
}
.upload-btn {
  position: relative;
  overflow: hidden;
  background: #6c47ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.upload-btn:disabled {
  cursor: default;
}

/* Efecto de “llenado de agua” */
.upload-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  z-index: 0;
  transition: width 3s ease; /* dura lo mismo que la carga */
  border-radius: 8px;
}

/* Cuando se está cargando, llena el botón */
.upload-btn:disabled::before {
  width: 100%;
}

/* Icono y texto por encima del pseudo-elemento */
.upload-btn span,
.upload-btn span + * {
  position: relative;
  z-index: 1;
}

.upload-btn:hover:not(:disabled) {
  background: #5938d1;
}

.material-symbols-rounded {
  font-size: 24px;
  color: #fff;
}








/* Pie del formulario */
.form-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 30px;
}

/* Botón Reportar con animación brillante */
.btn-reportar {
  background: #6c47ff;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 45px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-reportar:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(108, 71, 255, 0.4);
}

.btn-reportar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Botón Cancelar */
.btn-cancelar {
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 10px;
  padding: 12px 45px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.btn-cancelar:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}



/* Animación entrada */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

