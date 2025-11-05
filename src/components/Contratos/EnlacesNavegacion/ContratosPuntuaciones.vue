<template>
  <div class="puntuaciones-card">
    <div class="valoracion-section">
      <h3 class="section-title">VALORACIÓN GENERAL</h3>
      <div class="general-score">
        <span class="score-percent">91.7%</span>
        <span class="score-label">APTO</span>
      </div>
    </div>

    <div class="skills-section">
      <h4 class="skills-title">Hard Skills</h4>
      <div class="skill-list">
        <div v-for="skill in hardSkills" :key="skill.name" class="skill-item">
          <div class="skill-name">{{ skill.name }}</div>
          <div class="skill-bar-container">
            <div class="skill-bar" :style="{ width: skill.percent + '%', backgroundColor: skill.color }"></div>
          </div>
          <div class="skill-icons">
            <span class="icon">👍</span>
            <span class="icon">👎</span>
          </div>
          <div class="skill-result">
            <div class="percent">{{ skill.percent }}%</div>
            <div class="apto">APTO</div>
          </div>
        </div>
      </div>

      <h4 class="skills-title">Soft Skills</h4>
      <div class="skill-list">
        <div v-for="skill in softSkills" :key="skill.name" class="skill-item">
          <div class="skill-name">{{ skill.name }}</div>
          <div class="skill-bar-container">
            <div class="skill-bar" :style="{ width: skill.percent + '%', backgroundColor: skill.color }"></div>
          </div>
          <div class="skill-icons">
            <span class="icon">👍</span>
            <span class="icon">👎</span>
          </div>
          <div class="skill-result">
            <div class="percent">{{ skill.percent }}%</div>
            <div class="apto">APTO</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const hardSkills = [
  { name: 'Llamada fría', percent: 75, color: '#06B6D4' },
  { name: 'Investigación', percent: 87.5, color: '#10B981' },
  { name: 'Experiencia en ventas', percent: 62.5, color: '#06B6D4' },
  { name: 'Inglés', percent: 62.5, color: '#10B981' },
  { name: 'Venta al público', percent: 100, color: '#06B6D4' },
  { name: 'CRM', percent: 87.5, color: '#10B981' }
]

const softSkills = [
  { name: 'Emprendedor', percent: 75, color: '#06B6D4' },
  { name: 'Habilidades para escuchar', percent: 87.5, color: '#10B981' },
  { name: 'Trabajo en equipo', percent: 84, color: '#06B6D4' }
]
</script>

<style scoped>
.puntuaciones-card { background: white; border-radius: 12px; padding: 24px; }

.valoracion-section { margin-bottom: 32px; }
.section-title { color: #06B6D4; font-weight: 800; font-size: 0.95rem; margin: 0 0 12px 0; }
.general-score { display: flex; align-items: baseline; gap: 12px; }
.score-percent { font-size: 2rem; font-weight: 800; color: #111827; }
.score-label { font-size: 0.9rem; font-weight: 700; color: #6B7280; }

.skills-title { font-weight: 700; font-size: 0.95rem; margin: 0 0 16px 0; color: #111827; }
.skill-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }

.skill-item { display: grid; grid-template-columns: 180px 1fr 60px 80px; align-items: center; gap: 16px; padding: 12px 8px; background: #F9FAFB; border-radius: 6px; }
.skill-name { font-weight: 600; color: #374151; font-size: 0.9rem; }
.skill-bar-container { height: 12px; background: #E5E7EB; border-radius: 8px; overflow: hidden; }
.skill-bar { height: 100%; border-radius: 8px; transition: width 0.3s ease; }
.skill-icons { display: flex; gap: 8px; justify-content: center; }
.icon { font-size: 18px; cursor: pointer; }
.skill-result { text-align: right; }
.percent { font-weight: 800; font-size: 0.95rem; color: #111827; }
.apto { font-size: 0.75rem; font-weight: 700; color: #6B7280; }
</style>
