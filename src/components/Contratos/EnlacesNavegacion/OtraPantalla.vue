<template>
  <div class="otra-pantalla-view">
    <!-- Header superior -->
    <div class="page-header">
      <button class="btn-back" @click="volverInicio">
        <span class="material-symbols-rounded">arrow_back</span>
      </button>
      <h1>Contratos</h1>
    </div>

    <!-- Contenedor principal -->
    <div class="main-container">
      <!-- Contenido principal (izquierda) -->
      <div class="content-main">
        <!-- Tarjeta de información del candidato -->
        <div class="candidate-card">
          <div class="candidate-header">
            <div class="candidate-info">
              <img src="https://i.pravatar.cc/80?img=12" alt="Jaecon Dan" class="candidate-avatar" />
              <div class="candidate-details">
                <h2>Jaecon Dan</h2>
                <p class="candidate-role">Fase: Entrevista</p>
                <p class="candidate-account">CUENTA EJECUTIVA</p>
              </div>
            </div>
            <div class="candidate-score">
              <div class="score-box">
                <span class="score-value">95%</span>
                <span class="score-label">POTENCIAL</span>
              </div>
            </div>
            <div class="candidate-actions">
              <button class="btn-action btn-cyan">REVISAR</button>
              <button class="btn-action btn-cyan">MOVER</button>
              <button class="btn-action btn-cyan">PUNTUAR</button>
            </div>
          </div>

          <!-- Tabs de navegación -->
          <div class="tabs-nav">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Contenido de los tabs -->
          <div class="tab-content">
            <ContratosHuella v-if="activeTab === 'huella'" />
            <ContratosPuntuaciones v-else-if="activeTab === 'puntuaciones'" />
            <ContratosHoras v-else-if="activeTab === 'horas'" />
            <ContratosTareas v-else-if="activeTab === 'tareas'" />
            <ContratosActividad v-else-if="activeTab === 'actividad'" />
          </div>
        </div>
      </div>

      <!-- Sidebar derecha -->
      <div class="sidebar-right">
        <!-- Otros candidatos -->
        <div class="sidebar-section">
          <div class="section-header">
            <h3>Otros candidatos</h3>
            <a href="#" class="link-action">VISITAR FASE: TODOS</a>
          </div>
          <div class="candidates-list">
            <div v-for="candidato in otrosCandidatos" :key="candidato.id" class="candidate-item">
              <img :src="candidato.avatar" :alt="candidato.nombre" class="candidate-thumb" />
              <div class="candidate-mini-info">
                <span class="name">{{ candidato.nombre }}</span>
                <span class="phase">{{ candidato.fase }}</span>
              </div>
              <span class="status-badge">{{ candidato.status }}</span>
            </div>
          </div>
        </div>

        <!-- Comentarios -->
        <div class="sidebar-section">
          <div class="section-header">
            <h3>Comentarios</h3>
            <div class="comment-tabs">
              <button :class="['comment-tab', { active: commentTab === 'equipo' }]" @click="commentTab = 'equipo'">EQUIPO</button>
              <button :class="['comment-tab', { active: commentTab === 'privados' }]" @click="commentTab = 'privados'">PRIVADOS</button>
            </div>
          </div>
          <div class="comments-box">
            <textarea placeholder="Escribir un comentario..." class="comment-input"></textarea>
            <button class="btn-comment">COMENTAR</button>
            <div class="comment-item">
              <img src="https://i.pravatar.cc/32?img=8" alt="User" class="comment-avatar" />
              <div class="comment-content">
                <p class="comment-text">Tu comentario sobre Jaecon Dan</p>
                <span class="comment-date">HACE 30 MIN</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Archivos adjuntos -->
        <div class="sidebar-section">
          <div class="section-header">
            <h3>Archivos adjuntos</h3>
            <a href="#" class="link-action">ADJUNTAR ARCHIVOS</a>
          </div>
          <div class="files-list">
            <div class="file-item">
              <span class="file-icon">📄</span>
              <div class="file-info">
                <span class="file-name">Certificado.pdf</span>
                <span class="file-meta">Confidencial • 28/08/2020</span>
              </div>
              <button class="btn-file-action">⋮</button>
            </div>
            <div class="file-item">
              <span class="file-icon">📄</span>
              <div class="file-info">
                <span class="file-name">Jaecon-Dan-CV.pdf</span>
                <span class="file-meta">CV • 28/08/2020</span>
              </div>
              <button class="btn-file-action">⋮</button>
            </div>
          </div>
        </div>

        <!-- Botón Registrar Incidencia -->
        <button class="btn-incidencia">Registrar Incidencia</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import ContratosActividad from './ContratosActividad.vue'
import ContratosHuella from './ContratosHuella.vue'
import ContratosPuntuaciones from './ContratosPuntuaciones.vue'
import ContratosHoras from './ContratosHoras.vue'
import ContratosTareas from './ContratosTareas.vue'

const emit = defineEmits(['volver-inicio'])

const activeTab = ref('huella')
const commentTab = ref('equipo')

const tabs = [
  { id: 'huella', label: 'HUELLA' },
  { id: 'puntuaciones', label: 'PUNTUACIONES' },
  { id: 'horas', label: 'REG HORAS' },
  { id: 'tareas', label: 'TAREAS' },
  { id: 'actividad', label: 'ACTIVIDAD' }
]

const otrosCandidatos = [
  { id: 1, nombre: 'Fernando Martínez', fase: 'Fase:', avatar: 'https://i.pravatar.cc/40?img=1', status: 'Contratación' },
  { id: 2, nombre: 'Marcela Valencia', fase: 'Aplicado', avatar: 'https://i.pravatar.cc/40?img=5', status: '' },
  { id: 3, nombre: 'Diego Lombardi', fase: 'Aplicado', avatar: 'https://i.pravatar.cc/40?img=3', status: '' },
  { id: 4, nombre: 'Beatriz Pinzón', fase: 'Oferta de empleo', avatar: 'https://i.pravatar.cc/40?img=9', status: '' },
  { id: 5, nombre: 'Maria Calderón', fase: 'Contratación', avatar: 'https://i.pravatar.cc/40?img=10', status: '' }
]

const volverInicio = () => {
  emit('volver-inicio')
}
</script>

<style scoped>
.otra-pantalla-view {
  position: fixed;
  top: 0;
  left: 60px;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  background: #E5E7EB;
}

/* Header */
.page-header {
  background: transparent;
  padding: 1.5rem 2rem 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
}

.btn-back:hover {
  background: rgba(0, 0, 0, 0.05);
}

.btn-back .material-symbols-rounded {
  font-size: 24px;
  color: #111827;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

/* Main Container */
.main-container {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  max-width: 100%;
  margin: 0;
  height: calc(100vh - 80px);
}

/* Content Main */
.content-main {
  min-width: 0;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
}

.candidate-card {
  background: white;
  border-radius: 12px;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.candidate-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.candidate-info {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.candidate-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.candidate-details h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.candidate-role {
  margin: 0;
  font-size: 0.875rem;
  color: #6B7280;
}

.candidate-account {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: #06B6D4;
  font-weight: 600;
}

.candidate-score {
  display: flex;
  align-items: center;
}

.score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.score-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
}

.candidate-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action {
  padding: 0.625rem 1.25rem;
  border: 1px solid #06B6D4;
  background: transparent;
  color: #06B6D4;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #E0F7FA;
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem;
  border-bottom: 2px solid #E5E7EB;
}

.tab-btn {
  padding: 0.875rem 1.5rem;
  border: none;
  background: transparent;
  color: #6B7280;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #10B981;
  border-bottom-color: #10B981;
}

.tab-btn:hover {
  color: #111827;
}

.tab-content {
  padding: 1.5rem;
}

/* Sidebar Right */
.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
  padding-bottom: 1rem;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
}

.link-action {
  font-size: 0.75rem;
  color: #06B6D4;
  text-decoration: none;
  font-weight: 600;
}

.link-action:hover {
  text-decoration: underline;
}

/* Candidatos List */
.candidates-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.candidate-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.candidate-item:hover {
  background: #F9FAFB;
}

.candidate-thumb {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.candidate-mini-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.candidate-mini-info .name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #111827;
}

.candidate-mini-info .phase {
  font-size: 0.75rem;
  color: #6B7280;
}

.status-badge {
  font-size: 0.6875rem;
  padding: 0.25rem 0.5rem;
  background: #F3F4F6;
  border-radius: 4px;
  color: #6B7280;
}

/* Comments */
.comment-tabs {
  display: flex;
  gap: 0.5rem;
}

.comment-tab {
  padding: 0.375rem 0.75rem;
  border: none;
  background: transparent;
  color: #6B7280;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
}

.comment-tab.active {
  color: #06B6D4;
  background: #F0F9FF;
}

.comments-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-input {
  width: 100%;
  min-height: 60px;
  padding: 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.comment-input:focus {
  outline: none;
  border-color: #06B6D4;
}

.btn-comment {
  align-self: flex-end;
  padding: 0.5rem 1rem;
  background: #E5E7EB;
  color: #6B7280;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8125rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 6px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.comment-text {
  margin: 0;
  font-size: 0.8125rem;
  color: #111827;
}

.comment-date {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Files */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 6px;
}

.file-icon {
  font-size: 1.5rem;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.file-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #111827;
}

.file-meta {
  font-size: 0.75rem;
  color: #6B7280;
}

.btn-file-action {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
}

/* Botón Incidencia */
.btn-incidencia {
  width: 100%;
  padding: 0.875rem;
  background: #7C3AED;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.btn-incidencia:hover {
  background: #6D28D9;
}

@media (max-width: 1400px) {
  .main-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar-right {
    order: 2;
  }
}
</style>
