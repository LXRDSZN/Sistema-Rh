-- Script para eliminar personas y usuarios duplicados creados por el bug

-- Ver duplicados primero
SELECT 
    p.id,
    p.nombre,
    p.apellido_paterno,
    p.apellido_materno,
    u.email,
    u.id as usuario_id,
    p.created_at
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id
WHERE (p.nombre, p.apellido_paterno, p.apellido_materno) IN (
    SELECT nombre, apellido_paterno, apellido_materno
    FROM persona
    WHERE tipo = 'Empleado'
    GROUP BY nombre, apellido_paterno, apellido_materno
    HAVING COUNT(*) > 1
)
ORDER BY p.nombre, p.apellido_paterno, p.created_at;

-- Eliminar usuarios duplicados (mantener el más antiguo)
-- DESCOMENTAR DESPUÉS DE REVISAR LOS DATOS:
/*
WITH duplicados AS (
    SELECT 
        u.id as usuario_id,
        u.persona_id,
        ROW_NUMBER() OVER (
            PARTITION BY p.nombre, p.apellido_paterno, p.apellido_materno 
            ORDER BY u.created_at ASC
        ) as rn
    FROM usuario u
    JOIN persona p ON p.id = u.persona_id
    WHERE (p.nombre, p.apellido_paterno, p.apellido_materno) IN (
        SELECT nombre, apellido_paterno, apellido_materno
        FROM persona
        WHERE tipo = 'Empleado'
        GROUP BY nombre, apellido_paterno, apellido_materno
        HAVING COUNT(*) > 1
    )
)
-- Eliminar usuario_rol primero
DELETE FROM usuario_rol 
WHERE usuario_id IN (SELECT usuario_id FROM duplicados WHERE rn > 1);

-- Eliminar usuario
DELETE FROM usuario 
WHERE id IN (SELECT usuario_id FROM duplicados WHERE rn > 1);

-- Eliminar persona duplicada (sin contrato ni otros vínculos)
DELETE FROM persona
WHERE id IN (
    SELECT p.id
    FROM persona p
    WHERE p.tipo = 'Empleado'
    AND NOT EXISTS (SELECT 1 FROM contrato WHERE persona_id = p.id)
    AND NOT EXISTS (SELECT 1 FROM usuario WHERE persona_id = p.id)
    AND (p.nombre, p.apellido_paterno, p.apellido_materno) IN (
        SELECT nombre, apellido_paterno, apellido_materno
        FROM persona
        WHERE tipo = 'Empleado'
        GROUP BY nombre, apellido_paterno, apellido_materno
        HAVING COUNT(*) > 1
    )
);
*/
