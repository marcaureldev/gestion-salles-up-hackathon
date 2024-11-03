<script setup>
const isModalOpen = ref(false);  // Définir la réactivité de la modale

onMounted(() => {
    isModalOpen.value = true;  // Ouvrir la modale quand le composant est monté
});
</script>

<template>
    <div>
        <Dashboard></Dashboard>
    </div>
</template>