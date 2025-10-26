<script setup>
  import { ref } from 'vue'

  const fileName = ref('Subir archivo')
  const fileInput = ref(null)
  const isLoading = ref(false)

  const triggerFile = () => {
    fileInput.value.click()
  }

  const handleFile = (event) => {
    const file = event.target.files[0]
    if (file) {
      isLoading.value = true
      fileName.value = file.name

      // Simula la carga del archivo (3 segundos)
      setTimeout(() => {
        isLoading.value = false
      }, 3000)
    } else {
      fileName.value = 'Subir archivo'
    }
  }
</script>




<template>
  <div class="incidencias-formulario" @click.self="$emit('cerrar')">
    <div class="modal-card">
      <header class="modal-header">
        <button class="btn-cerrar" @click="$emit('cerrar')">&times;</button>
      </header>

      <form class="form">
        <div class="form-group">
          <label>Usuario (Empleado)</label>
          <input
            type="text"
            v-model="usuario"
            placeholder="Ej. Carlos Méndez"
            class="input"
            required
          />
        </div>

        <div class="form-group">
          <label>Asunto</label>
          <input
            type="text"
            v-model="asunto"
            placeholder="Ej. Falta, Retardo..."
            class="input"
            required
          />
        </div>

        <div class="form-group">
          <label>Descripción</label>
          <textarea
            v-model="descripcion"
            rows="2"
            placeholder="Describe la situación..."
            class="textarea"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label>Subir acta emitida</label>
          <input type="file" ref="fileInput" @change="handleFile" style="display:none" />
          <button type="button" class="upload-btn" @click="triggerFile" :disabled="isLoading">
            <span class="material-symbols-rounded">upload_file</span>
            {{ isLoading ? 'Cargando...' : fileName }}
          </button>
        </div>


        <div class="form-footer">
          <button type="submit" class="btn-reportar">Reportar</button>
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

.btn-reportar:hover {
  transform: scale(1.05); /* se agranda un poco */
  box-shadow: 0 8px 20px rgba(108, 71, 255, 0.4); /* sombra suave */
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

