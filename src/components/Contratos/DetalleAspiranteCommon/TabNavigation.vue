<template>
    <div class="tabs-navigation">
        <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-button', { active: modelValue === tab.id }]"
            @click="$emit('update:modelValue', tab.id)"
        >
            {{ tab.label }}
        </button>
    </div>
</template>

<script setup>
defineProps({
    modelValue: {
        type: String,
        required: true
    },
    tabs: {
        type: Array,
        required: true
    }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.tabs-navigation {
    display: flex;
    gap: 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 1.5rem;
}

.tab-button {
    flex: 1;
    padding: 1rem;
    background-color: white;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.tab-button:hover {
    background-color: #f5f5f5;
    color: #333;
}

.tab-button.active {
    color: #7c4dff;
    border-bottom-color: #7c4dff;
    background-color: #faf9ff;
}

@media (max-width: 768px) {
    .tabs-navigation {
        overflow-x: auto;
        scrollbar-width: thin;
    }

    .tab-button {
        font-size: 0.8rem;
        padding: 0.8rem;
    }
}
</style>
