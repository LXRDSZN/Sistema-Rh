<template>
    <div class="enlace-crear-contrato">
        <!-- Header con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="volverInicio">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contrato/Creación</h1>
        </div>

        <div class="content-box">
            <h2 class="section-title">CONTRATO NUEVO</h2>

            <!-- Datos Personales -->
            <div class="form-section">
                <h3 class="subsection-title">Datos Personales</h3>

                <!-- Foto placeholder y Nombre completo -->
                <div class="form-row">
                    <div class="form-group" style="grid-column: 1 / 2;">
                        <div class="photo-placeholder">
                            <div class="photo-box"></div>
                        </div>
                    </div>
                    <div class="form-group" style="grid-column: 2 / 4;">
                        <label>Nombre Completo</label>
                        <div class="inline-fields">
                            <input type="text" v-model="formData.nombre" placeholder="Nombre" class="form-input">
                            <input type="text" v-model="formData.apellidoPaterno" placeholder="Apellido Paterno"
                                class="form-input">
                            <input type="text" v-model="formData.apellidoMaterno" placeholder="Apellido Materno"
                                class="form-input">
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo de Contrato</label>
                        <select v-model="formData.tipoContrato" class="form-select">
                            <option value="">Seleccione tipo</option>
                            <option value="Indefinido">Indefinido</option>
                            <option value="Temporal">Temporal</option>
                            <option value="Por Obra">Por Obra</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fecha de inicio</label>
                        <input type="date" v-model="formData.fechaInicio" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Fecha de término</label>
                        <input type="date" v-model="formData.fechaTermino" class="form-input">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Proyecto (en caso de aplicar) </label>
                        <input type="text" v-model="formData.sueldoMensual" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Sueldo Mensual</label>
                        <input type="text" v-model="formData.sueldoMensual" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Modalidad</label>
                        <select v-model="formData.modalidad" class="form-select">
                            <option value="">Seleccione modalidad</option>
                            <option value="Presencial">Presencial</option>
                            <option value="Remoto">Remoto</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group full-width">
                        <label>Observaciones</label>
                        <textarea v-model="formData.observaciones" class="form-textarea" rows="4"></textarea>
                    </div>
                </div>
            </div>

            <!-- Asignación Laboral -->
            <div class="form-section">
                <h3 class="subsection-title">Asignación Laboral</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Área</label>
                        <select v-model="formData.area" class="form-select">
                            <option value="">Seleccione área</option>
                            <option value="Contratos">Contratos</option>
                            <option value="Asistencias">Asistencias</option>
                            <option value="Incidencias">Incidencias</option>
                            <option value="Vacaciones">Vacaciones</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Puesto</label>
                        <select v-model="formData.puesto" class="form-select">
                            <option value="">Seleccione puesto</option>
                            <option value="Gerente">Gerente</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Analista">Analista</option>
                            <option value="Asistente">Asistente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Jornada Laboral</label>
                        <select v-model="formData.jornadaLaboral" class="form-select">
                            <option value="">Seleccione tipo</option>
                            <option value="Completa">Completa</option>
                            <option value="Parcial">Parcial</option>
                            <option value="Por turnos">Por turnos</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Plantilla Contrato</label>
                        <select v-model="formData.plantillaContrato" class="form-select">
                            <option value="">Seleccione</option>
                            <option value="Plantilla A">Plantilla A</option>
                            <option value="Plantilla B">Plantilla B</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Estado del contrato</label>
                        <select v-model="formData.estadoContrato" class="form-select">
                            <option value="">Seleccione</option>
                            <option value="Activo">Activo</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Finalizado">Finalizado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Entrada</label>
                        <input type="time" v-model="formData.entrada" class="form-input time-input">
                    </div>
                    <div class="form-group">
                        <label>Salida</label>
                        <input type="time" v-model="formData.salida" class="form-input time-input">
                    </div>
                </div>
            </div>

            <!-- Documentos Asociados -->
            <div class="form-section">
                <h3 class="subsection-title">Documentos Asociados</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo de Documento</label>
                        <select v-model="formData.tipoDocumento" class="form-select">
                            <option value="">Seleccione</option>
                            <option value="Contrato">Contrato</option>
                            <option value="Anexo">Anexo</option>
                            <option value="Identificación">Identificación</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Subir documento (PDF)</label>
                        <input type="text" v-model="formData.documento" placeholder="Seleccione" class="form-input">
                    </div>
                </div>

            </div>

            <!-- Firmas y Acciones -->
            <div class="form-section">
                <h3 class="subsection-title">Firmas y Acciones</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha de Generación</label>
                        <input type="date" v-model="formData.fechaGeneracion" class="form-input">
                    </div>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
                <button class="btn-guardar" @click="guardarContrato">
                    <span class="material-symbols-rounded">save</span>
                    Guardar
                </button>
                <button class="btn-limpiar" @click="enviarLimpiar">
                    <span class="material-symbols-rounded">edit</span>
                    Limpiar
                </button>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['volver-inicio']);

// Función para volver al inicio
const volverInicio = () => {
    emit('volver-inicio');
};

// Datos del formulario
const formData = ref({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    tipoContrato: '',
    fechaInicio: '',
    fechaTermino: '',
    proyecto: '',
    sueldoMensual: '',
    modalidad: '',
    observaciones: '',
    area: '',
    puesto: '',
    jornadaLaboral: '',
    plantillaContrato: '',
    estadoContrato: '',
    entrada: '',
    salida: '',
    tipoDocumento: '',
    documento: '',
    fechaGeneracion: ''
});

const guardarContrato = () => {
    // Validar campos requeridos
    if (!formData.value.nombre || !formData.value.apellidoPaterno || !formData.value.area) {
        alert('Por favor complete los campos requeridos');
        return;
    }

    console.log('Guardando contrato:', formData.value);
    alert('Contrato guardado exitosamente');
};

const enviarLimpiar = () => {
    console.log('Enviando a firma:', formData.value);
    alert('Limpiado Correctamente');
};

</script>

<style scoped>
.enlace-crear-contrato {
    max-width: 1400px;
    margin: 0 auto;
}

/* Header con flecha */
.top-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    background-color: transparent;
}

.btn-back {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
}

.btn-back:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.btn-back .material-symbols-rounded {
    font-size: 26px;
}

.top-header h1 {
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
}

.content-box {
    background-color: white;
    border-radius: 12px;
    padding: 2rem;
    margin: 0 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
    color: #9370db;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 2rem 0;
    letter-spacing: 0.5px;
    text-align: center;
}

.form-section {
    margin-bottom: 2.5rem;
}

.subsection-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1.5rem 0;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-group label {
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
}

.form-input,
.form-select {
    padding: 0.75rem;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: white;
    transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
    outline: none;
    border-color: #9370db;
}

.form-input::placeholder {
    color: #999;
}

.form-select {
    cursor: pointer;
    color: #666;
}

.form-textarea {
    padding: 0.75rem;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    font-size: 0.95rem;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.3s ease;
}

.form-textarea:focus {
    outline: none;
    border-color: #9370db;
}

/* Photo placeholder */
.photo-placeholder {
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.photo-box {
    width: 100px;
    height: 100px;
    background-color: #d3d3d3;
    border-radius: 8px;
}

/* Inline fields para nombre completo */
.inline-fields {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

/* Time input */
.time-input {
    cursor: pointer;
}

/* Checkbox group */
.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: #333;
    cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #9370db;
}

/* Botones de acción */
.form-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e0e0e0;
}

.btn-guardar,
.btn-limpiar {
    padding: 0.85rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-guardar {
    background-color: #4caf50;
    color: white;
}

.btn-guardar:hover {
    background-color: #45a049;
}

.btn-limpiar {
    background-color: #ffc107;
    color: white;
}

.btn-limpiar:hover {
    background-color: #e0a800;
}


.material-symbols-rounded {
    font-size: 20px;
}

/* Responsive */
@media (max-width: 1024px) {
    .form-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .inline-fields {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .content-box {
        padding: 1.5rem;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn-guardar,
    .btn-enviar {
        width: 100%;
    }
}
</style>
