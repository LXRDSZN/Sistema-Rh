-- ============================================
-- INSERT PUESTOS - Títulos de Trabajo
-- ============================================

INSERT INTO puesto (nombre, codigo, descripcion) VALUES
  ('Gerente', 'GER', 'Gestión de departamento o equipo'),
  ('Supervisor', 'SUP', 'Supervisión de personal operativo'),
  ('Coordinador', 'COORD', 'Coordinación de actividades específicas'),
  ('Analista', 'ANA', 'Análisis y procesamiento de información'),
  ('Asistente', 'AST', 'Apoyo administrativo y operativo'),
  ('Desarrollador', 'DEV', 'Desarrollo de software'),
  ('Contador', 'CONT', 'Gestión contable y fiscal'),
  ('Administrador', 'ADM', 'Administración general'),
  ('Operador', 'OPER', 'Operación de procesos'),
  ('Técnico', 'TEC', 'Tareas técnicas especializadas'),
  ('Ejecutivo', 'EJEC', 'Ejecución de tareas especializadas'),
  ('Especialista', 'ESP', 'Experto en área específica')
ON CONFLICT (nombre) DO NOTHING;

-- Verificar
SELECT COUNT(*) as total_puestos FROM puesto;
SELECT nombre FROM puesto ORDER BY nombre;
