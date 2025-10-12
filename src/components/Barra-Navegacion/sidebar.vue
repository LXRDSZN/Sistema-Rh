<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- Logo/Header: Hexágono (SVG como antes) -->
      <div
        class="menu-row logo-row desplegar"
        @click="toggleSidebar"
        :aria-label="isOpen ? 'Cerrar menú' : 'Abrir menú'"
        tabindex="0"
        title="Recursos Humanos"
      >
        <span class="menu-icon">
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
      <!-- Usuario abajo -->
      <div class="menu-row sidebar-user-mini" @click="logout">
        <span class="menu-icon"><span class="material-symbols-rounded">group</span></span>
        <div v-if="isOpen" class="user-info">
          <div class="sidebar-user-name">Guest</div>
          <div class="sidebar-user-role">Gerente General/Admin</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
const isOpen = ref(false);
const router = useRouter();
const route = useRoute();
function toggleSidebar() { isOpen.value = !isOpen.value }
function isActive(path) { return route.path === path }
function logout() { /* tu lógica de logout */ }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.material-symbols-rounded {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-family: 'Material Symbols Rounded', sans-serif;
  font-size: 22px;
  color: #d4d9e6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-row.active .material-symbols-rounded,
.menu-row:hover .material-symbols-rounded {
  color: #fff;
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
  gap: 0.7em;
  border-radius: 10px;
  min-height: 46px;
  margin: 2px 7px;
  padding: 0 7px;
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
  gap: 0.7em;
  color: inherit;
  text-decoration: none;
  width: 100%;
  height: 100%;
  padding: 10px 0;
}
.menu-text {
  font-size: 1.18rem;
  font-weight: 400;
  color: #fff;
}
.menu-row .arrow {
  margin-left: auto;
  color: #fff8;
  font-size: 1.21em;
  font-weight: 700;
}
.menu-icon {
  min-width: 22px;
  min-height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.logo-row {
  margin-bottom: 14px;
  margin-top: 0;
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
  padding: 8px 7px;
  background: #232327;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  align-items: center;
  gap: 0.7em;
}
.sidebar-user-mini:hover {
  background: #845EF7;
}
.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.sidebar-user-name {
  font-weight: 700;
}
.sidebar-user-role {
  font-size: 0.92em;
  color: #a7a7b3;
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