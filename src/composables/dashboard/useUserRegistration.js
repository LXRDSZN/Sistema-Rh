import { ref, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toast-notification';
import { useAuth } from '@/composables/useAuth';
import { getEmpleadosSinCorreo } from '@/services/dashboardService';

export function useUserRegistration() {
  const toast = useToast();
  const { userRole } = useAuth();
  const isRegistering = ref(false);
  const showRegisterModal = ref(false);
  const empleadosSinCorreo = ref([]);
  const isLoadingEmpleados = ref(false);
  
  const newUser = ref({
    persona_id: '',
    contrato_id: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    sexo: '',
    email: '',
    password: '',
    rol: '',
    area: '',
    puesto: '',
    salario_mensual: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo_contrato: '',
    modalidad: '',
    estado_contrato: '',
    observaciones: ''
  });

  const resetForm = () => {
    newUser.value = {
      persona_id: '',
      contrato_id: '',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      sexo: '',
      email: '',
      password: '',
      rol: '',
      area: '',
      puesto: '',
      salario_mensual: '',
      fecha_inicio: '',
      fecha_fin: '',
      tipo_contrato: '',
      modalidad: '',
      estado_contrato: '',
      observaciones: ''
    };
  };

  // Cargar empleados sin correo cuando se abre el modal
  const loadEmpleadosSinCorreo = async () => {
    isLoadingEmpleados.value = true;
    try {
      const response = await getEmpleadosSinCorreo();
      if (response.success) {
        empleadosSinCorreo.value = response.data;
      }
    } catch (error) {
      console.error('Error al cargar empleados sin correo:', error);
      toast.error('Error al cargar la lista de empleados');
    } finally {
      isLoadingEmpleados.value = false;
    }
  };

  // Cuando se selecciona un empleado, llenar los datos automáticamente
  watch(() => newUser.value.persona_id, (personaId) => {
    if (personaId) {
      const empleado = empleadosSinCorreo.value.find(emp => emp.id === personaId);
      if (empleado) {
        console.log('Empleado seleccionado:', empleado);
        
        // Datos personales
        newUser.value.nombre = empleado.nombre || '';
        newUser.value.apellido_paterno = empleado.apellido_paterno || '';
        newUser.value.apellido_materno = empleado.apellido_materno || '';
        newUser.value.fecha_nacimiento = empleado.fecha_nacimiento || '';
        newUser.value.sexo = empleado.sexo || '';
        
        // Datos del contrato
        newUser.value.contrato_id = empleado.contrato_id || '';
        newUser.value.area = empleado.area || '';
        newUser.value.puesto = empleado.puesto || '';
        newUser.value.salario_mensual = empleado.salario_mensual || '';
        newUser.value.fecha_inicio = empleado.fecha_inicio || '';
        newUser.value.fecha_fin = empleado.fecha_fin || '';
        newUser.value.tipo_contrato = empleado.tipo_contrato || '';
        newUser.value.modalidad = empleado.modalidad || '';
        newUser.value.estado_contrato = empleado.estado_contrato || '';
        newUser.value.observaciones = empleado.observaciones || '';
      } else {
        console.log('No se encontró empleado con ID:', personaId);
        console.log('IDs disponibles:', empleadosSinCorreo.value.map(e => e.id));
      }
    }
  });

  const handleRegisterUser = async () => {
    if (isRegistering.value) {
      console.log('Ya se está procesando un registro, ignorando llamada duplicada');
      return;
    }
    
    try {
      isRegistering.value = true;
      console.log('=== INICIO REGISTRO USUARIO ===');
      console.log('Registrando usuario:', newUser.value);
      
      // Validar campos requeridos
      if (!newUser.value.persona_id || !newUser.value.email || !newUser.value.password) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }

      // Convertir sexo de texto a código
      const sexoCodigo = newUser.value.sexo === 'Mujer' ? 'F' : 'M';

      // Obtener el área del usuario autenticado si es Jefe de Área
      const esJefeArea = ['JEFE_AREA', 'JEFE_ASISTENCIAS', 'JEFE_CONTRATOS', 'JEFE_VACACIONES', 'JEFE_INCIDENCIAS'].includes(userRole.value);

      // Enviar datos al backend usando la ruta protegida
      const response = await axios.post('http://localhost:5000/api/register-dashboard', {
        personaId: newUser.value.persona_id,
        nombre: newUser.value.nombre,
        apellidoPaterno: newUser.value.apellido_paterno,
        apellidoMaterno: newUser.value.apellido_materno || '',
        email: newUser.value.email,
        password: newUser.value.password,
        sexo: sexoCodigo,
        fechaNacimiento: newUser.value.fecha_nacimiento || '1990-01-01',
        rol: newUser.value.rol || 'EMPLEADO',
        esRegistroPorJefeArea: esJefeArea
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(`Usuario ${newUser.value.nombre} ${newUser.value.apellido_paterno} registrado exitosamente`);
        
        resetForm();
        
        // Recargar lista de empleados sin correo
        await loadEmpleadosSinCorreo();
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          showRegisterModal.value = false;
        }, 500);
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error al registrar el usuario';
      toast.error(errorMessage);
    } finally {
      isRegistering.value = false;
    }
  };

  return {
    newUser,
    isRegistering,
    showRegisterModal,
    empleadosSinCorreo,
    isLoadingEmpleados,
    handleRegisterUser,
    resetForm,
    loadEmpleadosSinCorreo
  };
}
