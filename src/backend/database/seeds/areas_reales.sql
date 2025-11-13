-- ============================================
-- SEED: Áreas Reales del Sistema
-- ============================================
-- Reemplaza las áreas incorrectas con las 5 áreas/módulos correctos del sistema de RH
-- Ejecutar desde psql conectado a la base de datos

-- Eliminar datos incorrectos existentes
DELETE FROM area WHERE codigo IN ('RH', 'FIN', 'TI', 'PROD', 'VEN', 'MANT', 'AR');

-- Insertar las 5 áreas correctas del sistema con códigos cortos (sin acentos para evitar problemas de encoding)
INSERT INTO area (nombre, codigo, area_padre_id) VALUES
  ('Areas', 'AR', NULL),
  ('Contratos', 'CT', NULL),
  ('Asistencias', 'AS', NULL),
  ('Vacaciones', 'VC', NULL),
  ('Incidencias', 'IC', NULL);

-- Verificar inserción
SELECT id, nombre, codigo FROM area ORDER BY nombre;
