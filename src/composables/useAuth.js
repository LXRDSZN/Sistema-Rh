import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Estado global de autenticación
const user = ref(null);
const isAuthenticated = ref(false);
const isLoading = ref(false);

// Estado del temporizador de inactividad
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

export function useAuth() {
  const router = useRouter();

  /**
   * Login - Autenticar usuario
   */
  const login = async (email, password) => {
    isLoading.value = true;
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/login',
        { 
          usuario: email, 
          contrasena: password 
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        user.value = response.data.user;
        isAuthenticated.value = true;
        resetInactivityTimer(); // Iniciar temporizador al hacer login
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      return { success: false, message };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Logout - Cerrar sesión
   */
  const logout = async () => {
    try {
      // Primero limpiamos el estado local
      stopInactivityTimer();
      user.value = null;
      isAuthenticated.value = false;
      
      // Llamar al backend para cerrar la sesión
      await axios.post(
        'http://localhost:5000/api/logout',
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Asegurar que siempre redirigimos al login
      await router.push('/');
      // Forzar recarga para limpiar cualquier estado residual
      window.location.href = '/';
    }
  };

  /**
   * Reiniciar temporizador de inactividad
   */
  const resetInactivityTimer = () => {
    // Limpiar temporizador existente
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    // Solo crear nuevo temporizador si el usuario está autenticado
    if (isAuthenticated.value) {
      inactivityTimer = setTimeout(() => {
        console.log('⏱️ Sesión cerrada por inactividad (5 minutos)');
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  /**
   * Detener temporizador de inactividad
   */
  const stopInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  };

  /**
   * Iniciar monitoreo de actividad del usuario
   */
  const startActivityMonitoring = () => {
    // Eventos que resetean el temporizador
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (isAuthenticated.value) {
        resetInactivityTimer();
      }
    };

    // Agregar listeners a todos los eventos
    events.forEach(event => {
      window.addEventListener(event, handleActivity, true);
    });

    // Iniciar temporizador por primera vez
    resetInactivityTimer();

    // Retornar función para limpiar listeners
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity, true);
      });
      stopInactivityTimer();
    };
  };

  /**
   * Verificar sesión actual
   */
  const verifySession = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/verify',
        { withCredentials: true }
      );

      if (response.data.success) {
        user.value = response.data.user;
        isAuthenticated.value = true;
        resetInactivityTimer(); // Reiniciar temporizador al verificar sesión
        return true;
      }
    } catch (error) {
      user.value = null;
      isAuthenticated.value = false;
      stopInactivityTimer();
    }
    return false;
  };

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  const hasPermission = (permissionCode) => {
    if (!user.value || !user.value.permisos) return false;
    return user.value.permisos.includes(permissionCode);
  };

  /**
   * Verificar si el usuario tiene TODOS los permisos especificados
   */
  const hasAllPermissions = (permissionCodes) => {
    if (!user.value || !user.value.permisos) return false;
    return permissionCodes.every(code => user.value.permisos.includes(code));
  };

  /**
   * Verificar si el usuario tiene AL MENOS UNO de los permisos especificados
   */
  const hasAnyPermission = (permissionCodes) => {
    if (!user.value || !user.value.permisos) return false;
    return permissionCodes.some(code => user.value.permisos.includes(code));
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (roleName) => {
    if (!user.value) return false;
    return user.value.rol?.toLowerCase() === roleName.toLowerCase();
  };

  /**
   * Verificar si el usuario es admin
   */
  const isAdmin = computed(() => {
    return user.value?.rol === 'ADMIN';
  });

  /**
   * Verificar si el usuario es jefe de RH
   */
  const isJefeRH = computed(() => {
    return user.value?.rol === 'JEFE_RH';
  });

  /**
   * Verificar si el usuario es jefe de área
   */
  const isJefeArea = computed(() => {
    return user.value?.rol === 'JEFE_AREA';
  });

  /**
   * Verificar si el usuario es empleado
   */
  const isEmpleado = computed(() => {
    return user.value?.rol === 'EMPLEADO';
  });

  /**
   * Obtener nombre del usuario actual
   */
  const userName = computed(() => {
    return user.value?.nombre || 'Usuario';
  });

  /**
   * Obtener email del usuario actual
   */
  const userEmail = computed(() => {
    return user.value?.email || '';
  });

  /**
   * Obtener rol del usuario actual
   */
  const userRole = computed(() => {
    return user.value?.rol || '';
  });

  /**
   * Obtener total de permisos del usuario
   */
  const totalPermissions = computed(() => {
    return Array.isArray(user.value?.permisos) ? user.value.permisos.length : 0;
  });

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    
    // Acciones
    login,
    logout,
    verifySession,
    
    // Monitoreo de inactividad
    startActivityMonitoring,
    resetInactivityTimer,
    stopInactivityTimer,
    
    // Verificación de permisos
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    
    // Computed properties
    isAdmin,
    isJefeRH,
    isJefeArea,
    isEmpleado,
    userName,
    userEmail,
    userRole,
    totalPermissions
  };
}
