<script setup>
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
          <div class="upload-box">
            <span class="material-symbols-rounded">upload_file</span>
            <button type="button" class="upload-btn">Subir archivo</button>
          </div>
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
  background: #6c47ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.upload-btn:hover {
  background: #5938d1;
  transform: translateY(-2px);
}

.material-symbols-rounded {
  font-size: 24px;
  color: #6c47ff;
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
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-reportar::before {
  content: "";
  position: absolute;
  top: 0;
  left: -75%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  transform: skewX(-25deg);
  transition: all 0.7s ease;
}

.btn-reportar:hover::before {
  left: 125%;
}

.btn-reportar:hover {
  background: #5938d1;
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(92, 63, 235, 0.4);
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

