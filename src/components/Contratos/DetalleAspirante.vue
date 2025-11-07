<template>
    <div class="detalle-aspirante-page">
        <!-- Header -->
        <div class="header">
            <button class="btn-back" @click="cerrar">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos/Aspirante</h1>
        </div>

            <!-- Título -->
            <div class="titulo-section">
                <h2>ASPIRANTE</h2>
            </div>

            <!-- Información Principal -->
            <div class="info-principal">
                <div class="info-left">
                    <img :src="aspirante.avatar" :alt="aspirante.nombre" class="avatar-grande">
                    <div class="datos-principales">
                        <h3>{{ aspirante.nombre }}</h3>
                        <div class="info-item">
                            <span class="label">CURP:</span>
                            <span class="value">{{ aspirante.curp || 'XXXXXXXXXXXXXXXXXXXX' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">RFC:</span>
                            <span class="value">{{ aspirante.rfc || 'XXXXXXXXXXXXXXXXXXXX' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">NSS:</span>
                            <span class="value">{{ aspirante.nss || 'XXXXXXXXXXXXXXXXXXXX' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Iconos de estado -->
                <div class="iconos-estado">
                    <div class="icono-card">
                        <span class="material-symbols-rounded">badge</span>
                        <span class="icono-label">CV</span>
                    </div>
                    <div class="icono-card">
                        <span class="material-symbols-rounded">fingerprint</span>
                        <span class="icono-label">Huella</span>
                    </div>
                    <div class="icono-card">
                        <span class="material-symbols-rounded">description</span>
                        <span class="icono-label">Contrato</span>
                    </div>
                </div>

                <!-- Estado y Fecha -->
                <div class="info-right">
                    <div class="estado-box">
                        <span class="label">Estado del proceso</span>
                        <span class="estado-valor">{{ aspirante.estadoProceso || 'EN REVISIÓN' }}</span>
                    </div>
                    <div class="fecha-box">
                        <span class="label">Fecha de Registro:</span>
                        <span class="fecha-valor">{{ formatearFecha(aspirante.fechaRegistro) }}</span>
                    </div>
                </div>
            </div>

            <!-- Tabs de navegación -->
            <div class="tabs-navigation">
                <button 
                    v-for="tab in tabs" 
                    :key="tab.id"
                    :class="['tab-btn', { active: tabActual === tab.id }]"
                    @click="tabActual = tab.id"
                >
                    {{ tab.label }}
                </button>
            </div>

            <!-- Contenido de los tabs -->
            <div class="tab-content">
                <!-- Tab: Datos Personales y Contacto -->
                <div v-if="tabActual === 'datos'" class="tab-panel">
                    <div class="panel-grid">
                        <!-- Persona -->
                        <div class="info-card">
                            <div class="card-icon">
                                <span class="material-symbols-rounded">person</span>
                            </div>
                            <h4>Persona</h4>
                            <div class="info-rows">
                                <div class="info-row">
                                    <span class="label">Nombre:</span>
                                    <span class="value">{{ getNombre() }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Apellido Paterno:</span>
                                    <span class="value">{{ getApellidoPaterno() }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Apellido Materno:</span>
                                    <span class="value">{{ getApellidoMaterno() }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Fecha de Nacimiento:</span>
                                    <span class="value">{{ aspirante.fechaNacimiento || '12/11/1996' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Sexo:</span>
                                    <span class="value">{{ aspirante.sexo || 'Masculino' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Nacionalidad:</span>
                                    <span class="value">{{ aspirante.nacionalidad || 'Mexicana' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Identificación -->
                        <div class="info-card">
                            <div class="card-icon">
                                <span class="material-symbols-rounded">badge</span>
                            </div>
                            <h4>Identificación</h4>
                            <div class="info-rows">
                                <div class="info-row">
                                    <span class="label">CURP:</span>
                                    <span class="value">{{ aspirante.curp || 'XXXX' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">RFC:</span>
                                    <span class="value">{{ aspirante.rfc || 'XXXX' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">NSS:</span>
                                    <span class="value">{{ aspirante.nss || 'XXXX' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Teléfono:</span>
                                    <span class="value">{{ aspirante.telefono || 'XXXX' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Domicilio:</span>
                                    <span class="value">{{ aspirante.domicilio || 'XXXX' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Documentos cargados -->
                        <div class="info-card">
                            <div class="card-icon">
                                <span class="material-symbols-rounded">upload_file</span>
                            </div>
                            <h4>Documentos cargados</h4>
                            <div class="documentos-list">
                                <div class="documento-item">
                                    <span class="doc-nombre">INE</span>
                                    <span class="material-symbols-rounded check">check_circle</span>
                                </div>
                                <div class="documento-item">
                                    <span class="doc-nombre">Comprobante</span>
                                    <span class="material-symbols-rounded check">check_circle</span>
                                </div>
                                <div class="documento-item">
                                    <span class="doc-nombre">CURP</span>
                                    <span class="material-symbols-rounded check">check_circle</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Formación y Experiencia -->
                <div v-if="tabActual === 'formacion'" class="tab-panel">
                    <div class="formacion-experiencia-grid">
                        <!-- Formación académica -->
                        <div class="seccion-formacion">
                            <h3 class="seccion-titulo">Formación académica</h3>
                            
                            <div class="formacion-card">
                                <div class="formacion-icon">
                                    <span class="material-symbols-rounded">school</span>
                                </div>
                                <div class="formacion-detalles">
                                    <div class="detalle-row">
                                        <span class="detalle-label">Nivel de estudios:</span>
                                        <span class="detalle-value">Licenciatura</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Institución:</span>
                                        <span class="detalle-value">TECNM</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Título:</span>
                                        <span class="detalle-value">ING. IND</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Fecha Inicio:</span>
                                        <span class="detalle-value">12/11/2018</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Fecha Fin:</span>
                                        <span class="detalle-value">12/11/2018</span>
                                    </div>
                                </div>
                            </div>

                            <div class="formacion-card">
                                <div class="formacion-icon">
                                    <span class="material-symbols-rounded">school</span>
                                </div>
                                <div class="formacion-detalles">
                                    <div class="detalle-row">
                                        <span class="detalle-label">Nivel de estudios:</span>
                                        <span class="detalle-value">Licenciatura</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Institución:</span>
                                        <span class="detalle-value">TECNM</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Título:</span>
                                        <span class="detalle-value">ING. IND</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Fecha Inicio:</span>
                                        <span class="detalle-value">12/11/2018</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Fecha Fin:</span>
                                        <span class="detalle-value">12/11/2018</span>
                                    </div>
                                </div>
                            </div>

                            <button class="btn-añadir">+ Añadir</button>
                        </div>

                        <!-- Experiencia laboral -->
                        <div class="seccion-experiencia">
                            <h3 class="seccion-titulo">Experiencia laboral</h3>
                            
                            <div class="experiencia-card">
                                <div class="experiencia-icon">
                                    <span class="material-symbols-rounded">work</span>
                                </div>
                                <div class="experiencia-detalles">
                                    <div class="detalle-row">
                                        <span class="detalle-label">Empresa:</span>
                                        <span class="detalle-value">Licenciatura</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Puesto:</span>
                                        <span class="detalle-value">TECNM</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Periodo:</span>
                                        <span class="detalle-value">ING. IND</span>
                                    </div>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Actividades Principales:</span>
                                    </div>
                                    <ul class="actividades-list">
                                        <li>XXX</li>
                                        <li>XXX</li>
                                    </ul>
                                    <div class="detalle-row">
                                        <span class="detalle-label">Motivo de Salida:</span>
                                        <span class="detalle-value">Echar la wueva</span>
                                    </div>
                                </div>
                            </div>

                            <button class="btn-añadir">+ Añadir</button>
                        </div>
                    </div>
                </div>

                <!-- Tab: Puesto Deseado -->
                <div v-if="tabActual === 'puesto'" class="tab-panel">
                    <div class="puesto-deseado-grid">
                        <!-- Columna Izquierda -->
                        <div class="puesto-columna">
                            <!-- Área o departamento deseado -->
                            <div class="puesto-item">
                                <div class="puesto-icon">
                                    <span class="material-symbols-rounded">corporate_fare</span>
                                </div>
                                <div class="puesto-info">
                                    <span class="puesto-label">Área o departamento deseado:</span>
                                    <span class="puesto-value">{{ aspirante.area || 'XXXXXXXXX' }}</span>
                                </div>
                            </div>

                            <!-- Puesto solicitado -->
                            <div class="puesto-item">
                                <div class="puesto-icon">
                                    <span class="material-symbols-rounded">computer</span>
                                </div>
                                <div class="puesto-info">
                                    <span class="puesto-label">Puesto solicitado:</span>
                                    <span class="puesto-value">{{ aspirante.puesto || 'XXXXXXXXX' }}</span>
                                </div>
                            </div>

                            <!-- Tipo de contrato -->
                            <div class="puesto-item">
                                <div class="puesto-icon">
                                    <span class="material-symbols-rounded">description</span>
                                </div>
                                <div class="puesto-info">
                                    <span class="puesto-label">Tipo de contrato:</span>
                                    <span class="puesto-value">XXXXXXXXX</span>
                                </div>
                            </div>

                            <!-- Jornada -->
                            <div class="puesto-item">
                                <div class="puesto-icon-circle">
                                    <span class="puesto-icon-letter">W</span>
                                </div>
                                <div class="puesto-info">
                                    <span class="puesto-label">Jornada:</span>
                                    <span class="puesto-value">XXXXXXXXX</span>
                                </div>
                            </div>
                        </div>

                        <!-- Columna Derecha -->
                        <div class="puesto-columna">
                            <!-- Cargo -->
                            <div class="puesto-item">
                                <div class="puesto-icon">
                                    <span class="material-symbols-rounded">work</span>
                                </div>
                                <div class="puesto-info">
                                    <span class="puesto-label">Cargo:</span>
                                    <span class="puesto-value">XXXXXXXXXXXXXXXXX</span>
                                </div>
                            </div>

                            <!-- Periodo -->
                            <div class="puesto-item">
                                <div class="puesto-icon">
                                    <span class="material-symbols-rounded">sync_alt</span>
                                </div>
                                <div class="puesto-info">
                                    <span class="puesto-label">Periodo:</span>
                                    <span class="puesto-value">XXXXXXXXXXXXXXXXX</span>
                                </div>
                            </div>

                            <!-- Motivo de salida -->
                            <div class="puesto-item">
                                <div class="puesto-icon">
                                    <span class="material-symbols-rounded">warning</span>
                                </div>
                                <div class="puesto-info">
                                    <span class="puesto-label">Motivo de salida:</span>
                                    <span class="puesto-value">XXXXXXXXXXXXXXXXX</span>
                                </div>
                            </div>

                            <!-- Domicilio -->
                            <div class="puesto-item">
                                <div class="puesto-icon">
                                    <span class="material-symbols-rounded">home</span>
                                </div>
                                <div class="puesto-info">
                                    <span class="puesto-label">Domicilio:</span>
                                    <span class="puesto-value">{{ aspirante.domicilio || 'XXXXXXXXXXXXXXXXX' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Proceso de Selección -->
                <div v-if="tabActual === 'proceso'" class="tab-panel">
                    <div class="proceso-container">
                        <!-- Información de Etapas -->
                        <div class="etapas-info">
                            <div class="etapa-item">
                                <span class="etapa-label">Etapa</span>
                                <span class="etapa-value">XXXXXXXXX</span>
                            </div>
                            <div class="etapa-item">
                                <span class="etapa-label">Fecha</span>
                                <span class="etapa-value">XXXXXXXXX</span>
                            </div>
                            <div class="etapa-item">
                                <span class="etapa-label">Resultado de entrevista</span>
                                <span class="etapa-value">XXXXXXXXX</span>
                            </div>
                            <div class="etapa-item">
                                <span class="etapa-label">Resultado de examen</span>
                                <span class="etapa-value">XXXXXXXXX</span>
                            </div>
                            <div class="etapa-item">
                                <span class="etapa-label">Evaluador Asignado</span>
                                <span class="etapa-value">XXXXXXXXX</span>
                            </div>
                        </div>

                        <!-- Línea de Progreso -->
                        <div class="progreso-linea">
                            <div class="progreso-step completado">
                                <div class="step-circle">
                                    <span class="material-symbols-rounded">check</span>
                                </div>
                                <span class="step-label">Registro</span>
                            </div>
                            <div class="progreso-conexion completado"></div>
                            
                            <div class="progreso-step completado">
                                <div class="step-circle">
                                    <span class="material-symbols-rounded">check</span>
                                </div>
                                <span class="step-label">Revisión</span>
                            </div>
                            <div class="progreso-conexion completado"></div>
                            
                            <div class="progreso-step completado">
                                <div class="step-circle">
                                    <span class="material-symbols-rounded">check</span>
                                </div>
                                <span class="step-label">Entrevista</span>
                            </div>
                            <div class="progreso-conexion completado"></div>
                            
                            <div class="progreso-step completado">
                                <div class="step-circle">
                                    <span class="material-symbols-rounded">check</span>
                                </div>
                                <span class="step-label">Evaluación</span>
                            </div>
                            <div class="progreso-conexion pendiente"></div>
                            
                            <div class="progreso-step pendiente">
                                <div class="step-circle">
                                    <span class="material-symbols-rounded">check</span>
                                </div>
                                <span class="step-label">Contratación</span>
                            </div>
                        </div>

                        <!-- Sección de Comentarios y Historial -->
                        <div class="comentarios-historial-grid">
                            <!-- Comentarios -->
                            <div class="comentarios-box">
                                <h4>Comentarios</h4>
                                <textarea placeholder="Agregar un Comentario..."></textarea>
                                <button class="btn-comentar">COMENTAR</button>
                            </div>

                            <!-- Historial -->
                            <div class="historial-box">
                                <div class="historial-item">
                                    <span class="historial-text">Se aplicó parcialmente el examen, no respeta</span>
                                </div>
                                <div class="historial-item">
                                    <span class="historial-text">Se aplicó parcialmente el examen, no respeta</span>
                                </div>
                                <div class="historial-item">
                                    <span class="historial-text">Se aplicó parcialmente el examen, no respeta</span>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción -->
                        <div class="proceso-acciones">
                            <button class="btn-actualizar">Actualizar estado</button>
                            <button class="btn-mover">Mover a siguiente etapa</button>
                        </div>
                    </div>
                </div>

                <!-- Tab: Documentación -->
                <div v-if="tabActual === 'documentacion'" class="tab-panel">
                    <div class="documentacion-container">
                        <!-- Tabla de Documentos -->
                        <div class="documentos-tabla">
                            <!-- Header de la tabla -->
                            <div class="tabla-header">
                                <div class="tabla-col">Tipo</div>
                                <div class="tabla-col">Estado</div>
                                <div class="tabla-col">Fecha de subida</div>
                                <div class="tabla-col">Acciones</div>
                            </div>

                            <!-- Filas de documentos -->
                            <div class="tabla-row">
                                <div class="tabla-col tipo-col">
                                    <span class="doc-icon"></span>
                                    <span>CV</span>
                                </div>
                                <div class="tabla-col">
                                    <span class="estado-badge subido">Subido</span>
                                </div>
                                <div class="tabla-col">11/11/25</div>
                                <div class="tabla-col acciones-col">
                                    <button class="btn-accion upload" title="Subir">
                                        <span class="material-symbols-rounded">upload</span>
                                    </button>
                                    <button class="btn-accion delete" title="Eliminar">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                    <button class="btn-accion view" title="Ver">
                                        <span class="material-symbols-rounded">visibility</span>
                                    </button>
                                    <button class="btn-accion download" title="Descargar">
                                        <span class="material-symbols-rounded">download</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tabla-row">
                                <div class="tabla-col tipo-col">
                                    <span class="doc-icon"></span>
                                    <span>Identificación</span>
                                </div>
                                <div class="tabla-col">
                                    <span class="estado-badge pendiente">Pendiente</span>
                                </div>
                                <div class="tabla-col">11/11/25</div>
                                <div class="tabla-col acciones-col">
                                    <button class="btn-accion upload">
                                        <span class="material-symbols-rounded">upload</span>
                                    </button>
                                    <button class="btn-accion delete">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                    <button class="btn-accion view">
                                        <span class="material-symbols-rounded">visibility</span>
                                    </button>
                                    <button class="btn-accion download">
                                        <span class="material-symbols-rounded">download</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tabla-row">
                                <div class="tabla-col tipo-col">
                                    <span class="doc-icon"></span>
                                    <span>Comprobante</span>
                                </div>
                                <div class="tabla-col">
                                    <span class="estado-badge rechazado">Rechazado</span>
                                </div>
                                <div class="tabla-col">11/11/25</div>
                                <div class="tabla-col acciones-col">
                                    <button class="btn-accion upload">
                                        <span class="material-symbols-rounded">upload</span>
                                    </button>
                                    <button class="btn-accion delete">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                    <button class="btn-accion view">
                                        <span class="material-symbols-rounded">visibility</span>
                                    </button>
                                    <button class="btn-accion download">
                                        <span class="material-symbols-rounded">download</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tabla-row">
                                <div class="tabla-col tipo-col">
                                    <span class="doc-icon"></span>
                                    <span>Carta de recomendación</span>
                                </div>
                                <div class="tabla-col">
                                    <span class="estado-badge subido">Subido</span>
                                </div>
                                <div class="tabla-col">11/11/25</div>
                                <div class="tabla-col acciones-col">
                                    <button class="btn-accion upload">
                                        <span class="material-symbols-rounded">upload</span>
                                    </button>
                                    <button class="btn-accion delete">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                    <button class="btn-accion view">
                                        <span class="material-symbols-rounded">visibility</span>
                                    </button>
                                    <button class="btn-accion download">
                                        <span class="material-symbols-rounded">download</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tabla-row">
                                <div class="tabla-col tipo-col">
                                    <span class="doc-icon"></span>
                                    <span>XXXXXXXX</span>
                                </div>
                                <div class="tabla-col">
                                    <span class="estado-badge pendiente">Pendiente</span>
                                </div>
                                <div class="tabla-col">11/11/25</div>
                                <div class="tabla-col acciones-col">
                                    <button class="btn-accion upload">
                                        <span class="material-symbols-rounded">upload</span>
                                    </button>
                                    <button class="btn-accion delete">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                    <button class="btn-accion view">
                                        <span class="material-symbols-rounded">visibility</span>
                                    </button>
                                    <button class="btn-accion download">
                                        <span class="material-symbols-rounded">download</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tabla-row">
                                <div class="tabla-col tipo-col">
                                    <span class="doc-icon"></span>
                                    <span>XXXXXXXX</span>
                                </div>
                                <div class="tabla-col">
                                    <span class="estado-badge rechazado">Rechazado</span>
                                </div>
                                <div class="tabla-col">11/11/25</div>
                                <div class="tabla-col acciones-col">
                                    <button class="btn-accion upload">
                                        <span class="material-symbols-rounded">upload</span>
                                    </button>
                                    <button class="btn-accion delete">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                    <button class="btn-accion view">
                                        <span class="material-symbols-rounded">visibility</span>
                                    </button>
                                    <button class="btn-accion download">
                                        <span class="material-symbols-rounded">download</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tabla-row">
                                <div class="tabla-col tipo-col">
                                    <span class="doc-icon"></span>
                                    <span>XXXXXXXX</span>
                                </div>
                                <div class="tabla-col">
                                    <span class="estado-badge subido">Subido</span>
                                </div>
                                <div class="tabla-col">11/11/25</div>
                                <div class="tabla-col acciones-col">
                                    <button class="btn-accion upload">
                                        <span class="material-symbols-rounded">upload</span>
                                    </button>
                                    <button class="btn-accion delete">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                    <button class="btn-accion view">
                                        <span class="material-symbols-rounded">visibility</span>
                                    </button>
                                    <button class="btn-accion download">
                                        <span class="material-symbols-rounded">download</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tabla-row">
                                <div class="tabla-col tipo-col">
                                    <span class="doc-icon"></span>
                                    <span>XXXXXXXX</span>
                                </div>
                                <div class="tabla-col">
                                    <span class="estado-badge pendiente">Pendiente</span>
                                </div>
                                <div class="tabla-col">11/11/25</div>
                                <div class="tabla-col acciones-col">
                                    <button class="btn-accion upload">
                                        <span class="material-symbols-rounded">upload</span>
                                    </button>
                                    <button class="btn-accion delete">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                    <button class="btn-accion view">
                                        <span class="material-symbols-rounded">visibility</span>
                                    </button>
                                    <button class="btn-accion download">
                                        <span class="material-symbols-rounded">download</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    aspirante: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['cerrar']);

const tabActual = ref('datos');

const tabs = [
    { id: 'datos', label: 'Datos Personales y Contacto' },
    { id: 'formacion', label: 'Formación y experiencia' },
    { id: 'puesto', label: 'Puesto deseado' },
    { id: 'proceso', label: 'Proceso de Selección' },
    { id: 'documentacion', label: 'Documentación' }
];

const cerrar = () => {
    emit('cerrar');
};

const formatearFecha = (fecha) => {
    if (!fecha) return '16/08/2025';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getNombre = () => {
    const nombreCompleto = props.aspirante.nombre.split(' ');
    return nombreCompleto[0] || 'Braulio';
};

const getApellidoPaterno = () => {
    const nombreCompleto = props.aspirante.nombre.split(' ');
    return nombreCompleto[1] || 'Torres';
};

const getApellidoMaterno = () => {
    const nombreCompleto = props.aspirante.nombre.split(' ');
    return nombreCompleto[2] || 'Arispe';
};
</script>

<style scoped>
.detalle-aspirante-page {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding: 1rem;
}

/* Header */
.header {
    background-color: transparent;
    padding: 1.5rem 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.btn-back {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.btn-back:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.btn-back .material-symbols-rounded {
    font-size: 28px;
}

.header h1 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
    margin: 0;
}

/* Título */
.titulo-section {
    background-color: white;
    padding: 1.5rem 2rem;
    margin: 1.5rem;
    border-radius: 12px;
    text-align: center;
}

.titulo-section h2 {
    color: #7c4dff;
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: 2px;
}

/* Información Principal */
.info-principal {
    background-color: white;
    margin: 0 1.5rem 1.5rem;
    padding: 2rem;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

.info-left {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    flex: 1;
}

.avatar-grande {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.datos-principales {
    flex: 1;
}

.datos-principales h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 0.75rem 0;
}

.info-item {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.35rem;
    font-size: 0.85rem;
}

.info-item .label {
    font-weight: 600;
    color: #666;
}

.info-item .value {
    color: #333;
}

/* Iconos de estado */
.iconos-estado {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.icono-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 0.75rem 1rem;
    border: 2px solid #7c4dff;
    border-radius: 8px;
    min-width: 70px;
}

.icono-card .material-symbols-rounded {
    font-size: 28px;
    color: #7c4dff;
}

.icono-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #333;
}

/* Estado y Fecha */
.info-right {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 180px;
}

.estado-box,
.fecha-box {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    text-align: left;
}

.estado-box {
    background-color: transparent;
}

.fecha-box {
    background-color: transparent;
}

.estado-box .label,
.fecha-box .label {
    display: block;
    font-size: 0.8rem;
    color: #666;
    font-weight: 600;
    margin-bottom: 0.35rem;
}

.estado-valor {
    display: block;
    font-weight: 700;
    color: #7c4dff;
    font-size: 0.95rem;
}

.fecha-valor {
    display: block;
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
}

/* Tabs */
.tabs-navigation {
    display: flex;
    gap: 0.5rem;
    padding: 0 1.5rem;
    margin-bottom: 1rem;
    overflow-x: auto;
}

.tab-btn {
    padding: 0.75rem 1.5rem;
    background-color: #e0e0e0;
    border: none;
    border-radius: 8px 8px 0 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.tab-btn:hover {
    background-color: #d0d0d0;
}

.tab-btn.active {
    background-color: #7c4dff;
    color: white;
}

/* Tab Content */
.tab-content {
    background-color: white;
    margin: 0 1.5rem 1.5rem;
    padding: 2rem;
    border-radius: 12px;
    min-height: 300px;
}

.panel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.info-card {
    background-color: #fafafa;
    padding: 1.5rem;
    border-radius: 12px;
    border: 2px solid #7c4dff;
}

.info-card.full-width {
    grid-column: 1 / -1;
}

.card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background-color: #7c4dff;
    border-radius: 12px;
    margin: 0 auto 1rem;
}

.card-icon .material-symbols-rounded {
    font-size: 32px;
    color: white;
}

.info-card h4 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 1rem 0;
    text-align: center;
}

.info-rows {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e0e0e0;
}

.info-row:last-child {
    border-bottom: none;
}

.info-row .label {
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
}

.info-row .value {
    color: #333;
    font-size: 0.9rem;
}

/* Documentos */
.documentos-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.documento-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.doc-nombre {
    font-weight: 600;
    color: #333;
}

.documento-item .check {
    color: #4caf50;
    font-size: 24px;
}

.placeholder-text {
    color: #999;
    font-style: italic;
    text-align: center;
    padding: 2rem;
}

/* Formación y Experiencia */
.formacion-experiencia-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.seccion-formacion,
.seccion-experiencia {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.seccion-titulo {
    font-size: 1.1rem;
    font-weight: 700;
    color: #333;
    margin: 0;
    text-align: center;
}

.formacion-card,
.experiencia-card {
    background-color: white;
    border: 2px solid #7c4dff;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1.5rem;
}

.formacion-icon,
.experiencia-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background-color: #7c4dff;
    border-radius: 12px;
    flex-shrink: 0;
}

.formacion-icon .material-symbols-rounded,
.experiencia-icon .material-symbols-rounded {
    font-size: 36px;
    color: white;
}

.formacion-detalles,
.experiencia-detalles {
    flex: 1;
}

.detalle-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.detalle-label {
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
    white-space: nowrap;
}

.detalle-value {
    color: #333;
    font-size: 0.9rem;
}

.actividades-list {
    margin: 0.5rem 0 0.5rem 1.5rem;
    padding: 0;
}

.actividades-list li {
    color: #333;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}

.btn-añadir {
    padding: 0.75rem 2rem;
    background-color: white;
    color: #4caf50;
    border: 2px solid #4caf50;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    align-self: center;
}

.btn-añadir:hover {
    background-color: #4caf50;
    color: white;
}

/* Puesto Deseado */
.puesto-deseado-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
}

.puesto-columna {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.puesto-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.puesto-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    flex-shrink: 0;
}

.puesto-icon .material-symbols-rounded {
    font-size: 48px;
    color: #7c4dff;
}

.puesto-icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border: 3px solid #7c4dff;
    border-radius: 50%;
    flex-shrink: 0;
}

.puesto-icon-letter {
    font-size: 32px;
    font-weight: 700;
    color: #7c4dff;
}

.puesto-info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.puesto-label {
    font-weight: 700;
    color: #333;
    font-size: 0.95rem;
}

.puesto-value {
    color: #666;
    font-size: 0.9rem;
}

/* Proceso de Selección */
.proceso-container {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.etapas-info {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.etapa-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.etapa-label {
    font-weight: 600;
    color: #333;
    min-width: 200px;
}

.etapa-value {
    color: #666;
}

.progreso-linea {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 0;
    position: relative;
}

.progreso-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 0 0 auto;
}

.step-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #4caf50;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    transition: all 0.3s ease;
}

.progreso-step.pendiente .step-circle {
    background-color: #e0e0e0;
    color: #999;
}

.step-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #333;
    text-align: center;
}

.progreso-conexion {
    flex: 1;
    height: 4px;
    background-color: #4caf50;
    margin: 0 -10px;
    margin-bottom: 25px;
}

.progreso-conexion.pendiente {
    background-color: #e0e0e0;
}

.comentarios-historial-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.comentarios-box {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.comentarios-box h4 {
    margin: 0;
    font-size: 1rem;
    color: #333;
    font-weight: 600;
}

.comentarios-box textarea {
    width: 100%;
    min-height: 100px;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    resize: vertical;
}

.btn-comentar {
    align-self: flex-start;
    padding: 0.6rem 1.5rem;
    background-color: transparent;
    border: 1px solid #7c4dff;
    color: #7c4dff;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-comentar:hover {
    background-color: #7c4dff;
    color: white;
}

.historial-box {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.historial-item {
    padding: 0.8rem;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.historial-text {
    color: #666;
    font-size: 0.9rem;
}

.proceso-acciones {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 1rem;
}

.btn-actualizar,
.btn-mover {
    padding: 0.8rem 2rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
}

.btn-actualizar {
    background-color: #4caf50;
    color: white;
}

.btn-actualizar:hover {
    background-color: #45a049;
}

.btn-mover {
    background-color: transparent;
    border: 2px solid #7c4dff;
    color: #7c4dff;
}

.btn-mover:hover {
    background-color: #7c4dff;
    color: white;
}

/* Documentación */
.documentacion-container {
    width: 100%;
}

.documentos-tabla {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.tabla-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr 2fr;
    gap: 1rem;
    padding: 1rem;
    background-color: #f5f5f5;
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
    border-bottom: 2px solid #ddd;
}

.tabla-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr 2fr;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
    align-items: center;
    transition: background-color 0.2s ease;
}

.tabla-row:hover {
    background-color: #fafafa;
}

.tabla-col {
    display: flex;
    align-items: center;
}

.tipo-col {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.doc-icon {
    width: 8px;
    height: 8px;
    background-color: #f44336;
    border-radius: 50%;
    flex-shrink: 0;
}

.estado-badge {
    padding: 0.4rem 1rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
    text-align: center;
    display: inline-block;
}

.estado-badge.subido {
    background-color: #e8f5e9;
    color: #4caf50;
}

.estado-badge.pendiente {
    background-color: #fff3e0;
    color: #ff9800;
}

.estado-badge.rechazado {
    background-color: #ffebee;
    color: #f44336;
}

.acciones-col {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-start;
}

.btn-accion {
    width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
}

.btn-accion .material-symbols-rounded {
    font-size: 18px;
    color: #666;
}

.btn-accion.upload:hover {
    background-color: #4caf50;
    border-color: #4caf50;
}

.btn-accion.upload:hover .material-symbols-rounded {
    color: white;
}

.btn-accion.delete:hover {
    background-color: #f44336;
    border-color: #f44336;
}

.btn-accion.delete:hover .material-symbols-rounded {
    color: white;
}

.btn-accion.view:hover {
    background-color: #2196f3;
    border-color: #2196f3;
}

.btn-accion.view:hover .material-symbols-rounded {
    color: white;
}

.btn-accion.download:hover {
    background-color: #666;
    border-color: #666;
}

.btn-accion.download:hover .material-symbols-rounded {
    color: white;
}

/* Responsive */
@media (max-width: 1024px) {
    .info-principal {
        flex-direction: column;
        align-items: stretch;
    }

    .info-left {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .iconos-estado {
        justify-content: center;
    }

    .info-right {
        width: 100%;
    }

    .panel-grid {
        grid-template-columns: 1fr;
    }

    .formacion-experiencia-grid {
        grid-template-columns: 1fr;
    }

    .puesto-deseado-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .comentarios-historial-grid {
        grid-template-columns: 1fr;
    }

    .progreso-linea {
        overflow-x: auto;
        padding: 1rem;
        justify-content: flex-start;
        gap: 1rem;
    }

    .proceso-acciones {
        flex-direction: column;
    }

    .btn-actualizar,
    .btn-mover {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .detalle-aspirante-page {
        padding: 0.5rem;
    }

    .info-principal {
        padding: 1.5rem;
    }

    .panel-grid {
        grid-template-columns: 1fr;
    }

    .formacion-experiencia-grid {
        grid-template-columns: 1fr;
    }

    .puesto-deseado-grid {
        grid-template-columns: 1fr;
    }

    .comentarios-historial-grid {
        grid-template-columns: 1fr;
    }

    .formacion-card,
    .experiencia-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .etapa-item {
        flex-direction: column;
        align-items: flex-start;
    }

    .etapa-label {
        min-width: auto;
    }

    .progreso-linea {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .progreso-conexion {
        display: none;
    }

    .documentos-tabla {
        overflow-x: auto;
    }

    .tabla-header,
    .tabla-row {
        grid-template-columns: 1.5fr 1fr 1fr 1.8fr;
        gap: 0.5rem;
        padding: 0.8rem;
        font-size: 0.85rem;
    }

    .acciones-col {
        gap: 0.3rem;
    }

    .btn-accion {
        width: 32px;
        height: 32px;
    }
}
</style>
