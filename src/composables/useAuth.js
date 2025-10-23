import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Estado global de autenticación
const user = ref(null);
const isAuthenticated = ref(false);
const isLoading = ref(false);

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
      await axios.post(
        'http://localhost:5000/api/logout',
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      user.value = null;
      isAuthenticated.value = false;
      router.push('/');
    }
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
        return true;
      }
    } catch (error) {
      user.value = null;
      isAuthenticated.value = false;
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
    return user.value.rol === roleName;
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
