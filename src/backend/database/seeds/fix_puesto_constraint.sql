-- ============================================
-- SEED: Insertar puestos basados en roles existentes
-- ============================================
-- Copia los roles del sistema como puestos de trabajo
-- Mantiene la misma estructura y IDs para compatibilidad

-- Insertar puestos con los mismos IDs y nombres que los roles
INSERT INTO puesto (id, nombre, codigo, descripcion) 
SELECT 
    id, 
    nombre,
    CASE 
        WHEN nombre = 'ADMIN' THEN 'ADM'
        WHEN nombre = 'JEFE_RH' THEN 'JRH'
        WHEN nombre = 'JEFE_AREA' THEN 'JAR'
        WHEN nombre = 'EMPLEADO' THEN 'EMP'
        ELSE LEFT(nombre, 3)
    END as codigo,
    CASE 
        WHEN nombre = 'ADMIN' THEN 'Administrador del sistema'
        WHEN nombre = 'JEFE_RH' THEN 'Jefe de Recursos Humanos'
        WHEN nombre = 'JEFE_AREA' THEN 'Jefe de área o departamento'
        WHEN nombre = 'EMPLEADO' THEN 'Empleado general'
        ELSE 'Puesto ' || nombre
    END as descripcion
FROM rol
ON CONFLICT (id) DO UPDATE 
SET 
    nombre = EXCLUDED.nombre,
    codigo = EXCLUDED.codigo,
    descripcion = EXCLUDED.descripcion;

-- Verificar que se insertaron correctamente
SELECT COUNT(*) as total_puestos FROM puesto;
SELECT id, nombre, codigo, descripcion FROM puesto ORDER BY nombre;
