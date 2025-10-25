-- =====================================================
-- SCRIPT SIMPLIFICADO - SOLO LO QUE FALTA
-- Módulo de Asistencias
-- =====================================================
-- Este script crea SOLO las tablas que faltan
-- tipo_incidencia ya existe, así que la omitimos

-- =====================================================
-- 1. TABLA: estado_asistencia
-- =====================================================
CREATE TABLE IF NOT EXISTS estado_asistencia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    codigo VARCHAR(10) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO estado_asistencia (id, nombre, descripcion, codigo) VALUES
    (1, 'Presente', 'Empleado presente a tiempo', 'A'),
    (2, 'Retardo', 'Empleado llegó tarde', 'R'),
    (3, 'Falta', 'Empleado no asistió', 'F'),
    (4, 'Falta Justificada', 'Falta con justificante aprobado', 'FJ'),
    (5, 'Vacaciones', 'Empleado en periodo vacacional', 'V'),
    (6, 'Incidencia', 'Incidencia especial', 'I'),
    (7, 'Permiso', 'Permiso autorizado', 'P')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. TABLA: horario_empleado
-- =====================================================
CREATE TABLE IF NOT EXISTS horario_empleado (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER NOT NULL REFERENCES persona(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    es_dia_laborable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(persona_id, dia_semana)
);

CREATE INDEX IF NOT EXISTS idx_horario_persona ON horario_empleado(persona_id);
CREATE INDEX IF NOT EXISTS idx_horario_dia ON horario_empleado(dia_semana);

-- =====================================================
-- 3. TABLA: registro_asistencias
-- =====================================================
CREATE TABLE IF NOT EXISTS registro_asistencias (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER NOT NULL REFERENCES persona(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    hora_programada_entrada TIME,
    hora_programada_salida TIME,
    horas_trabajadas DECIMAL(5,2),
    horas_extra DECIMAL(5,2) DEFAULT 0,
    estado_asistencia_id INTEGER NOT NULL REFERENCES estado_asistencia(id),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(persona_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_asistencia_persona ON registro_asistencias(persona_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON registro_asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencia_estado ON registro_asistencias(estado_asistencia_id);

-- =====================================================
-- 4. TABLA: justificantes
-- =====================================================
CREATE TABLE IF NOT EXISTS justificantes (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER NOT NULL REFERENCES persona(id) ON DELETE CASCADE,
    tipo_incidencia_id INTEGER NOT NULL REFERENCES tipo_incidencia(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    motivo TEXT NOT NULL,
    archivo_justificante VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    aprobado_por INTEGER REFERENCES persona(id),
    fecha_aprobacion TIMESTAMP,
    comentarios_aprobador TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_justificante_persona ON justificantes(persona_id);
CREATE INDEX IF NOT EXISTS idx_justificante_estado ON justificantes(estado);
CREATE INDEX IF NOT EXISTS idx_justificante_fechas ON justificantes(fecha_inicio, fecha_fin);

-- =====================================================
-- 5. TABLA: visitas
-- =====================================================
CREATE TABLE IF NOT EXISTS visitas (
    id SERIAL PRIMARY KEY,
    nombre_visitante VARCHAR(200) NOT NULL,
    cargo_rol VARCHAR(150),
    empresa_pertenece VARCHAR(200),
    area_visitada_id INTEGER REFERENCES area(id),
    persona_visitada_id INTEGER REFERENCES persona(id),
    motivo_visita TEXT,
    fecha DATE NOT NULL,
    hora_ingreso TIME NOT NULL,
    hora_salida TIME,
    documento_identidad VARCHAR(50),
    telefono_contacto VARCHAR(20),
    observaciones TEXT,
    registrado_por INTEGER REFERENCES persona(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visita_fecha ON visitas(fecha);
CREATE INDEX IF NOT EXISTS idx_visita_area ON visitas(area_visitada_id);
CREATE INDEX IF NOT EXISTS idx_visita_persona ON visitas(persona_visitada_id);

-- =====================================================
-- 6. TABLA: dias_festivos
-- =====================================================
CREATE TABLE IF NOT EXISTS dias_festivos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    es_obligatorio BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dias_festivos (fecha, nombre, descripcion, es_obligatorio) VALUES
    ('2025-01-01', 'Año Nuevo', 'Inicio del año calendario', true),
    ('2025-02-03', 'Día de la Constitución', 'Conmemoración de la Constitución Mexicana', true),
    ('2025-03-17', 'Natalicio de Benito Juárez', 'Celebración del nacimiento de Benito Juárez', true),
    ('2025-05-01', 'Día del Trabajo', 'Día Internacional de los Trabajadores', true),
    ('2025-09-16', 'Día de la Independencia', 'Independencia de México', true),
    ('2025-11-17', 'Revolución Mexicana', 'Conmemoración de la Revolución Mexicana', true),
    ('2025-12-25', 'Navidad', 'Celebración de Navidad', true)
ON CONFLICT (fecha) DO NOTHING;

-- =====================================================
-- 7. TRIGGERS Y FUNCIONES
-- =====================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_horario_empleado_updated_at ON horario_empleado;
CREATE TRIGGER update_horario_empleado_updated_at
    BEFORE UPDATE ON horario_empleado
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registro_asistencias_updated_at ON registro_asistencias;
CREATE TRIGGER update_registro_asistencias_updated_at
    BEFORE UPDATE ON registro_asistencias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_justificantes_updated_at ON justificantes;
CREATE TRIGGER update_justificantes_updated_at
    BEFORE UPDATE ON justificantes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visitas_updated_at ON visitas;
CREATE TRIGGER update_visitas_updated_at
    BEFORE UPDATE ON visitas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular horas trabajadas
CREATE OR REPLACE FUNCTION calcular_horas_trabajadas()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.hora_entrada IS NOT NULL AND NEW.hora_salida IS NOT NULL THEN
        NEW.horas_trabajadas = EXTRACT(EPOCH FROM (NEW.hora_salida - NEW.hora_entrada)) / 3600;
        IF NEW.horas_trabajadas > 8 THEN
            NEW.horas_extra = NEW.horas_trabajadas - 8;
        ELSE
            NEW.horas_extra = 0;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_calcular_horas ON registro_asistencias;
CREATE TRIGGER trigger_calcular_horas
    BEFORE INSERT OR UPDATE ON registro_asistencias
    FOR EACH ROW
    EXECUTE FUNCTION calcular_horas_trabajadas();

-- =====================================================
-- 8. OTORGAR PERMISOS A app_user
-- =====================================================

-- Permisos en tablas
GRANT ALL PRIVILEGES ON TABLE estado_asistencia TO app_user;
GRANT ALL PRIVILEGES ON TABLE horario_empleado TO app_user;
GRANT ALL PRIVILEGES ON TABLE registro_asistencias TO app_user;
GRANT ALL PRIVILEGES ON TABLE justificantes TO app_user;
GRANT ALL PRIVILEGES ON TABLE visitas TO app_user;
GRANT ALL PRIVILEGES ON TABLE dias_festivos TO app_user;

-- Permisos en secuencias
GRANT USAGE, SELECT ON SEQUENCE estado_asistencia_id_seq TO app_user;
GRANT USAGE, SELECT ON SEQUENCE horario_empleado_id_seq TO app_user;
GRANT USAGE, SELECT ON SEQUENCE registro_asistencias_id_seq TO app_user;
GRANT USAGE, SELECT ON SEQUENCE justificantes_id_seq TO app_user;
GRANT USAGE, SELECT ON SEQUENCE visitas_id_seq TO app_user;
GRANT USAGE, SELECT ON SEQUENCE dias_festivos_id_seq TO app_user;

-- =====================================================
-- COMPLETADO
-- =====================================================

SELECT 'Setup de Asistencias completado exitosamente!' as mensaje;
