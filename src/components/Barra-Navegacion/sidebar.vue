<template>
  <!-- Overlay para cerrar el sidebar al hacer clic fuera -->
  <div 
    v-if="isOpen" 
    class="sidebar-overlay" 
    @click="closeSidebar"
  ></div>
  
  <div class="sidebar">
    <div class="sidebar-content ">
      <!-- Logo/Header: Hexágono (SVG como antes) -->
      <div
        class="menu-row logo-row desplegar "
        @click="toggleSidebar"
        :aria-label="isOpen ? 'Cerrar menú' : 'Abrir menú'"
        tabindex="0"
        title="Recursos Humanos"
      >
        <span class="menu-icon logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path stroke="#fff" stroke-width="2" d="M12 3.5 3.5 8.75v6.5L12 20.5l8.5-5.25v-6.5L12 3.5Z"/>
            <circle cx="12" cy="12" r="2" fill="none" stroke="#fff" stroke-width="2"/>
          </svg>
        </span>
        <div v-if="isOpen" class="logo-txts">
          <div class="sidebar-title">Recursos</div>
          <div class="sidebar-title">Humanos</div>
        </div>
      </div>
      <div
        class="menu-row"
        :class="{active: isActive('/Dashboard')}"
      >
        <RouterLink to="/Dashboard" class="menu-link">
          <span class="menu-icon"><span class="material-symbols-rounded">dashboard</span></span>
          <span v-if="isOpen" class="menu-text">Dashboard</span>
          <span v-if="isOpen" class="arrow">&gt;</span>
        </RouterLink>
      </div>
      <div
        class="menu-row"
        :class="{active: isActive('/Configuracion')}"
      >
        <RouterLink to="/Configuracion" class="menu-link">
          <span class="menu-icon"><span class="material-symbols-rounded">settings</span></span>
          <span v-if="isOpen" class="menu-text">Configuración</span>
          <span v-if="isOpen" class="arrow">&gt;</span>
        </RouterLink>
      </div>
      <div class="icons-separator" v-if="isOpen"></div>
      <div
        class="menu-row"
        :class="{active: isActive('/Asistencias')}"
      >
        <RouterLink to="/Asistencias" class="menu-link">
          <span class="menu-icon"><span class="material-symbols-rounded">event_note</span></span>
          <span v-if="isOpen" class="menu-text">Asistencias</span>
          <span v-if="isOpen" class="arrow">&gt;</span>
        </RouterLink>
      </div>
      <div
        class="menu-row"
        :class="{active: isActive('/Documentacion')}"
      >
        <RouterLink to="/Documentacion" class="menu-link">
          <span class="menu-icon"><span class="material-symbols-rounded">description</span></span>
          <span v-if="isOpen" class="menu-text">Documentación</span>
          <span v-if="isOpen" class="arrow">&gt;</span>
        </RouterLink>
      </div>
      <div
        class="menu-row"
        :class="{active: isActive('/Vacaciones')}"
      >
        <RouterLink to="/Vacaciones" class="menu-link">
          <span class="menu-icon"><span class="material-symbols-rounded">wb_sunny</span></span>
          <span v-if="isOpen" class="menu-text">Vacaciones</span>
          <span v-if="isOpen" class="arrow">&gt;</span>
        </RouterLink>
      </div>
      <div
        class="menu-row"
        :class="{active: isActive('/Incidencias')}"
      >
        <RouterLink to="/Incidencias" class="menu-link">
          <span class="menu-icon"><span class="material-symbols-rounded">info</span></span>
          <span v-if="isOpen" class="menu-text">Incidencias</span>
          <span v-if="isOpen" class="arrow">&gt;</span>
        </RouterLink>
      </div>
      <div
        class="menu-row"
        :class="{active: isActive('/Areas')}"
      >
        <RouterLink to="/Areas" class="menu-link">
          <span class="menu-icon"><span class="material-symbols-rounded">apartment</span></span>
          <span v-if="isOpen" class="menu-text">Áreas</span>
          <span v-if="isOpen" class="arrow">&gt;</span>
        </RouterLink>
      </div>
      <!-- Usuario abajo con menú desplegable -->
      <div class="menu-row sidebar-user-mini" @click="toggleUserMenu">
        <span class="menu-icon"><span class="material-symbols-rounded">group</span></span>
        <div v-if="isOpen" class="user-info">
          <div class="sidebar-user-name">{{ userName }}</div>
          <div class="sidebar-user-role">{{ formattedRole }}</div>
          <span class="material-symbols-rounded dropdown-icon" :class="{ rotated: isUserMenuOpen }">
            expand_more
          </span>
        </div>
      </div>

      <!-- Menú desplegable de usuario -->
      <transition name="dropdown">
        <div v-if="isUserMenuOpen && isOpen" class="user-dropdown-menu">
          <button @click.stop="handleLogout" class="dropdown-item logout-item">
            <span class="material-symbols-rounded">logout</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const isOpen = ref(false);
const isUserMenuOpen = ref(false);
const router = useRouter();
const route = useRoute();
const { userName, userRole, logout } = useAuth();

// Formatear el nombre del rol para mostrarlo de manera legible
const formattedRole = computed(() => {
  const roleMap = {
    'ADMIN': 'Administrador',
    'JEFE_RH': 'Jefe de Recursos Humanos',
    'JEFE_AREA': 'Jefe de Área',
    'EMPLEADO': 'Empleado'
  };
  return roleMap[userRole.value] || userRole.value;
});

function toggleSidebar() { isOpen.value = !isOpen.value }
function closeSidebar() { 
  isOpen.value = false;
  isUserMenuOpen.value = false;
}
function isActive(path) { return route.path === path }
function toggleUserMenu() {
  if (isOpen.value) {
    isUserMenuOpen.value = !isUserMenuOpen.value;
  } else {
    toggleSidebar();
  }
}
async function handleLogout() { 
  isUserMenuOpen.value = false;
  await logout();
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

/* Reset global para todos los enlaces */
a, a:link, a:visited, a:hover, a:active {
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
}

.material-symbols-rounded {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-family: 'Material Symbols Rounded', sans-serif;
  font-size: 22px;
  color: #d4d9e6;
  display: block;
  line-height: 1;
  user-select: none;
}

.menu-row.active .material-symbols-rounded,
.menu-row:hover .material-symbols-rounded {
  color: #fff;
}

/* Overlay para cerrar sidebar */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 199;
  cursor: pointer;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sidebar {
  display: flex;
  height: 100vh;
  background: #232327;
  position: fixed;
  top: 0; left: 0;
  z-index: 200;
  transition: width .3s;
}
.sidebar-content {
  width: auto;
  min-width: 60px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 20px;
  height: 100vh;
  background: #232327;
  position: relative;
}
.menu-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7em;
  border-radius: 10px;
  min-height: 46px;
  margin: 2px 7px;
  padding: 0;
  transition: background 0.18s;
  cursor: pointer;
  position: relative;
}
.menu-row.active,
.menu-row:hover {
  background: #845EF7;
}
.menu-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.7em;
  color: #fff;
  text-decoration: none;
  width: 100%;
  height: 100%;
  padding: 11px 12px;
  outline: none !important;
  border: none;
  box-shadow: none !important;
  -webkit-tap-highlight-color: transparent;
}
.menu-link:focus,
.menu-link:active,
.menu-link:hover {
  outline: none !important;
  box-shadow: none !important;
  text-decoration: none;
}
.menu-link:focus-visible {
  outline: 2px solid #845EF7 !important;
  outline-offset: -2px;
  border-radius: 8px;
}
.menu-text {
  font-size: 1.18rem;
  font-weight: 400;
  color: #fff;
  user-select: none;
}
.menu-row .arrow {
  margin-left: auto;
  color: #fff8;
  font-size: 1.21em;
  font-weight: 700;
  user-select: none;
}
.menu-icon {
  width: 22px;
  height: 22px;
  min-width: 22px;
  min-height: 22px;
  max-width: 22px;
  max-height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}
.menu-icon .material-symbols-rounded {
  width: 22px;
  height: 22px;
}
.logo-row {
  margin-bottom: 14px;
  margin-top: 0;
  padding: 11px 12px;
}
.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-icon svg {
  display: block;
}
.logo-txts {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.sidebar-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  line-height: 1.1;
  user-select: none;
}
.icons-separator {
  height: 1px;
  background: #fff3;
  margin: 10px 0 10px 7px;
  width: 80%;
  align-self: flex-start;
  border-radius: 1px;
}
.sidebar-user-mini {
  margin-top: auto;
  margin-bottom: 24px;
  padding: 11px 12px;
  background: #232327;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.7em;
  outline: none;
  transition: background 0.18s;
}
.sidebar-user-mini:hover {
  background: #845EF7;
}
.sidebar-user-mini:focus {
  outline: none;
}
.sidebar-user-mini:focus-visible {
  outline: 2px solid #845EF7;
  outline-offset: -2px;
}
.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  user-select: none;
  flex: 1;
  position: relative;
}
.sidebar-user-name {
  font-weight: 700;
}
.sidebar-user-role {
  font-size: 0.92em;
  color: #a7a7b3;
}
.dropdown-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px !important;
  transition: transform 0.3s ease;
  color: #a7a7b3;
}
.dropdown-icon.rotated {
  transform: translateY(-50%) rotate(180deg);
}
.user-dropdown-menu {
  background: #1a1a1e;
  border-radius: 8px;
  margin: 0 12px 12px 12px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #2d2d31;
}
.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s ease;
  text-align: left;
}
.dropdown-item:hover {
  background: #845EF7;
}
.dropdown-item .material-symbols-rounded {
  font-size: 20px;
  color: #d4d9e6;
}
.dropdown-item:hover .material-symbols-rounded {
  color: #fff;
}
.logout-item {
  color: #ff6b6b;
}
.logout-item .material-symbols-rounded {
  color: #ff6b6b;
}
.logout-item:hover {
  background: #ff6b6b;
  color: #fff;
}
.logout-item:hover .material-symbols-rounded {
  color: #fff;
}

/* Animación del dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  transform-origin: top;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.desplegar {
  cursor: pointer;
  border: 2px solid transparent;
  transition: border .1s;
}
.desplegar:focus, .desplegar:active {
  border: 2px solid #845EF7;
}
</style>