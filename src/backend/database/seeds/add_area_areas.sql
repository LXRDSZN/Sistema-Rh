-- ============================================
-- SEED: Agregar área "Areas" faltante
-- ============================================

-- Verificar si ya existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM area WHERE nombre = 'Areas') THEN
    INSERT INTO area (nombre, codigo, area_padre_id) 
    VALUES ('Areas', 'AR', NULL);
    RAISE NOTICE 'Área "Areas" creada exitosamente';
  ELSE
    RAISE NOTICE 'Área "Areas" ya existe';
  END IF;
END $$;

-- Verificar resultado
SELECT id, nombre, codigo FROM area ORDER BY nombre;
