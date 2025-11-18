import { ref } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toast-notification';
import { useAuth } from '@/composables/useAuth';

export function useUserRegistration() {
  const toast = useToast();
  const { userRole } = useAuth();
  const isRegistering = ref(false);
  const showRegisterModal = ref(false);
  
  const newUser = ref({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    sexo: '',
    email: '',
    password: '',
    rol: ''
  });

  const resetForm = () => {
    newUser.value = {
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      sexo: '',
      email: '',
      password: '',
      rol: ''
    };
  };

  const handleRegisterUser = async () => {
    if (isRegistering.value) return;
    
    try {
      isRegistering.value = true;
      console.log('Registrando usuario:', newUser.value);
      
      // Validar campos requeridos
      if (!newUser.value.nombre || !newUser.value.email || !newUser.value.password) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }

      // Convertir sexo de texto a código
      const sexoCodigo = newUser.value.sexo === 'Mujer' ? 'F' : 'M';

      // Obtener el área del usuario autenticado si es Jefe de Área
      const esJefeArea = ['JEFE_AREA', 'JEFE_ASISTENCIAS', 'JEFE_CONTRATOS', 'JEFE_VACACIONES', 'JEFE_INCIDENCIAS'].includes(userRole.value);

      // Enviar datos al backend usando la ruta protegida
      const response = await axios.post('http://localhost:5000/api/register-dashboard', {
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
    handleRegisterUser,
    resetForm
  };
}
