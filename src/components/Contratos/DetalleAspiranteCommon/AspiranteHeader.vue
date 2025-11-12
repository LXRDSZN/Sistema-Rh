<template>
    <div class="header">
        <button class="btn-back" @click="$emit('cerrar')">
            <span class="material-symbols-rounded">arrow_back</span>
        </button>
        <h1>Contratos/Aspirante</h1>
    </div>
</template>

<script setup>
defineEmits(['cerrar']);
</script>

<style scoped>
.header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background-color: transparent;
}

.btn-back {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background-color 0.3s ease;
}

.btn-back:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.btn-back .material-symbols-rounded {
    font-size: 24px;
    color: #333;
}

.header h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #333;
    margin: 0;
}
</style>
