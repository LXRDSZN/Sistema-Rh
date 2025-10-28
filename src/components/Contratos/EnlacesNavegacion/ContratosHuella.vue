<template>
  <div class="contratos-card">
    <div class="card-inner">
      <div class="top-row">
        <h3 class="section-subtitle">REGISTRO DE HUELLA</h3>
        <div class="huella-actions">
          <button class="btn outline">AGREGAR</button>
          <button class="btn success">ACTIVAR</button>
          <button class="btn danger">DESACTIVAR</button>
        </div>
      </div>

      <div class="huella-placeholder">
        <p class="muted">Status: SIN AGREGAR</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.contratos-card { background: white; border-radius: 0.75rem; padding: 1rem; }
.card-inner { min-height: 420px; }
.top-row{ display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1rem }
.section-subtitle { color: #059669; font-weight:800; margin:0; font-size:1.05rem }
.huella-actions { display:flex; gap:0.75rem }
.btn { padding:0.5rem 0.9rem; border-radius:0.5rem; border:1px solid #D1D5DB; cursor:pointer; background:white; font-weight:600 }
.btn.outline { color:#0ea5a4; border-color:#0ea5a4; background:transparent }
.btn.success { color:#059669; border-color:#059669; background:transparent }
.btn.danger { color:#ef4444; border-color:#ef4444; background:transparent }
.btn:hover{ transform:translateY(-1px) }
.huella-placeholder { border:1px dashed #E6E7EB; border-radius:0.75rem; padding:2.5rem; height:260px; display:flex; align-items:center; justify-content:center; background: #FFFFFF }
.muted { color:#9CA3AF; font-weight:600 }
.huella-placeholder p{ margin:0; font-size:0.95rem }
</style>
