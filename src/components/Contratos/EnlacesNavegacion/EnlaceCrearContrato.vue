<template>
    <div class="enlace-crear-contrato">
        <!-- Header con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="volverInicio">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Creación de contrato</h1>
        </div>

        <div class="content-box">
            <h2 class="section-title">CONTRATO NUEVO</h2>

            <!-- Datos Personales -->
            <div class="form-section">
                <h3 class="subsection-title">Datos Personales</h3>

                <div class="form-row">
                    <div class="form-group full-width">
                        <label>Fecha de contratación</label>
                        <input type="date" v-model="formData.fechaContratacion" class="form-input">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group full-width">
                        <label>Ingrese el número de solicitud</label>
                        <input type="text" v-model="formData.numeroSolicitud"
                            placeholder="Ingrese el número de solicitud" class="form-input">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" v-model="formData.nombre" placeholder="Nombre" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>&nbsp;</label>
                        <input type="text" v-model="formData.apellidoPaterno" placeholder="Apellido Paterno"
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label>&nbsp;</label>
                        <input type="text" v-model="formData.apellidoMaterno" placeholder="Apellido Materno"
                            class="form-input">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Día de nacimiento</label>
                        <select v-model="formData.diaNacimiento" class="form-select">
                            <option value="">Seleccione día</option>
                            <option v-for="dia in 31" :key="dia" :value="dia">{{ dia }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Mes de nacimiento</label>
                        <select v-model="formData.mesNacimiento" class="form-select">
                            <option value="">Seleccione mes</option>
                            <option value="1">Enero</option>
                            <option value="2">Febrero</option>
                            <option value="3">Marzo</option>
                            <option value="4">Abril</option>
                            <option value="5">Mayo</option>
                            <option value="6">Junio</option>
                            <option value="7">Julio</option>
                            <option value="8">Agosto</option>
                            <option value="9">Septiembre</option>
                            <option value="10">Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Año de nacimiento</label>
                        <select v-model="formData.anioNacimiento" class="form-select">
                            <option value="">Seleccione año</option>
                            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Nacionalidad</label>
                        <input type="text" v-model="formData.nacionalidad" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Sexo</label>
                        <select v-model="formData.sexo" class="form-select">
                            <option value="">Seleccione su sexo</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Estado civil</label>
                        <select v-model="formData.estadoCivil" class="form-select">
                            <option value="">Seleccione una opción</option>
                            <option value="Soltero">Soltero(a)</option>
                            <option value="Casado">Casado(a)</option>
                            <option value="Divorciado">Divorciado(a)</option>
                            <option value="Viudo">Viudo(a)</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>CURP</label>
                        <input type="text" v-model="formData.curp" placeholder="Ingrese tu CURP (18 caracteres)"
                            maxlength="18" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>NSS</label>
                        <input type="text" v-model="formData.nss" placeholder="Ingrese el Número de seguridad social"
                            class="form-input">
                    </div>
                </div>
            </div>

            <!-- Puesto de trabajo -->
            <div class="form-section">
                <h3 class="subsection-title">Puesto de trabajo</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Área</label>
                        <select v-model="formData.area" class="form-select">
                            <option value="">Seleccione Área</option>
                            <option value="Contratos">Contratos</option>
                            <option value="Asistencias">Asistencias</option>
                            <option value="Incidencias">Incidencias</option>
                            <option value="Vacaciones">Vacaciones</option>
                            <option value="Areas">Areas</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cargo</label>
                        <select v-model="formData.cargo" class="form-select">
                            <option value="">Seleccione cargo</option>
                            <option value="Gerente">Gerente</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Coordinador">Coordinador</option>
                            <option value="Analista">Analista</option>
                            <option value="Asistente">Asistente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo de contrato</label>
                        <select v-model="formData.tipoContrato" class="form-select">
                            <option value="">Seleccione tipo</option>
                            <option value="Indefinidos">Indefinidos</option>
                            <option value="Temporales">Temporales</option>
                            <option value="Por Obra">Por Obra</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group full-width">
                        <label>Descripción del trabajo</label>
                        <textarea v-model="formData.descripcionTrabajo" class="form-textarea" rows="4"></textarea>
                    </div>
                </div>
            </div>

            <!-- Jornada de trabajo -->
            <div class="form-section">
                <h3 class="subsection-title">Jornada de trabajo</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Hora de entrada</label>
                        <select v-model="formData.horaEntrada" class="form-select">
                            <option value="">Seleccione hora</option>
                            <option v-for="hora in horas" :key="hora" :value="hora">{{ hora }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Hora de salida</label>
                        <select v-model="formData.horaSalida" class="form-select">
                            <option value="">Seleccione hora</option>
                            <option v-for="hora in horas" :key="hora" :value="hora">{{ hora }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Total de horas por día</label>
                        <input type="number" v-model="formData.totalHoras" class="form-input">
                    </div>
                </div>
            </div>

            <!-- Salario y datos bancarios -->
            <div class="form-section">
                <h3 class="subsection-title">Salario y datos bancarios</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Cantidad (MXN)</label>
                        <select v-model="formData.salario" class="form-select">
                            <option value="">Seleccione cantidad</option>
                            <option value="5000">$5,000</option>
                            <option value="10000">$10,000</option>
                            <option value="15000">$15,000</option>
                            <option value="20000">$20,000</option>
                            <option value="25000">$25,000</option>
                            <option value="30000">$30,000</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Período</label>
                        <select v-model="formData.periodo" class="form-select">
                            <option value="">Seleccione periodo</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Quincenal">Quincenal</option>
                            <option value="Mensual">Mensual</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Título de la cuenta</label>
                        <input type="text" v-model="formData.tituloCuenta" placeholder="Ingrese nombre del titular"
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Entidad bancaria</label>
                        <select v-model="formData.banco" class="form-select">
                            <option value="">Seleccione una entidad bancaria</option>
                            <option value="BBVA">BBVA</option>
                            <option value="Santander">Santander</option>
                            <option value="Banamex">Banamex</option>
                            <option value="Banorte">Banorte</option>
                            <option value="HSBC">HSBC</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Número de cuenta</label>
                        <input type="text" v-model="formData.numeroCuenta" placeholder="Ingrese número de cuenta"
                            class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Clave interbancaria</label>
                        <input type="text" v-model="formData.clabe" placeholder="Ingrese clave interbancaria"
                            maxlength="18" class="form-input">
                    </div>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
                <button class="btn-cancelar" @click="cancelar">CANCELAR</button>
                <button class="btn-guardar" @click="guardarContrato">GUARDAR</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['volver-inicio']);

// Función para volver al inicio
const volverInicio = () => {
    emit('volver-inicio');
};

// Generar años para el selector (desde 1950 hasta el año actual)
const currentYear = new Date().getFullYear();
const years = computed(() => {
    const yearList = [];
    for (let year = currentYear; year >= 1950; year--) {
        yearList.push(year);
    }
    return yearList;
});

// Generar horas para selectores (00:00 - 23:00)
const horas = computed(() => {
    const horasList = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            horasList.push(hora);
        }
    }
    return horasList;
});

// Datos del formulario
const formData = ref({
    fechaContratacion: '',
    numeroSolicitud: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    diaNacimiento: '',
    mesNacimiento: '',
    anioNacimiento: '',
    nacionalidad: '',
    sexo: '',
    estadoCivil: '',
    curp: '',
    nss: '',
    area: '',
    cargo: '',
    tipoContrato: '',
    descripcionTrabajo: '',
    horaEntrada: '',
    horaSalida: '',
    totalHoras: '',
    salario: '',
    periodo: '',
    tituloCuenta: '',
    banco: '',
    numeroCuenta: '',
    clabe: ''
});

const cancelar = () => {
    if (confirm('¿Está seguro que desea cancelar? Se perderán los datos ingresados.')) {
        volverInicio();
    }
};

const guardarContrato = () => {
    // Validar campos requeridos
    if (!formData.value.nombre || !formData.value.apellidoPaterno || !formData.value.area) {
        alert('Por favor complete los campos requeridos');
        return;
    }

    // Aquí iría la lógica para guardar el contrato
    console.log('Guardando contrato:', formData.value);
    alert('Contrato guardado exitosamente');
    volverInicio();
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
    color: #00bcd4;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 2rem 0;
    letter-spacing: 0.5px;
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
    border-color: #00bcd4;
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
    border-color: #00bcd4;
}

/* Botones de acción */
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e0e0e0;
}

.btn-cancelar,
.btn-guardar {
    padding: 0.85rem 2.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-cancelar {
    background-color: white;
    color: #666;
    border: 2px solid #d0d0d0;
}

.btn-cancelar:hover {
    background-color: #f5f5f5;
    border-color: #999;
}

.btn-guardar {
    background-color: #00bcd4;
    color: white;
    border: 2px solid #00bcd4;
}

.btn-guardar:hover {
    background-color: #00a5bb;
    border-color: #00a5bb;
}

/* Responsive */
@media (max-width: 1024px) {
    .form-row {
        grid-template-columns: repeat(2, 1fr);
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

    .btn-cancelar,
    .btn-guardar {
        width: 100%;
    }
}
</style>
