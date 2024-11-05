<template>
    <div class="p-5">
        <button class="bg-custom-gradient p-2 rounded-md mb-4 text-white" @click="showModal = true">Ajouter des filières</button>
        <div class="space-y-3" v-if="confirmedFilieres.length > 0">
            <h2>Filières confirmées :</h2>
            <ul class="grid grid-cols-3 2xl:grid-cols-4 gap-5 items-center rounded-md cursor-pointer">
                <li class="bg-custom-gradient text-white max-w-80 h-52 p-2 rounded-md flex items-center justify-center"
                    v-for="(filiere, index) in confirmedFilieres" :key="index" @click.prevent="goToCalendar(filiere)">
                    {{ filiere }}
                </li>
            </ul>
        </div>
        <div class="h-80 bg-custom-gradient bg-clip-text text-transparent flex justify-center items-center text-2xl" v-else>
            Aucune filière de votre entité n'a été enregistrée pour le moment! Veuillez ajouter une filière.
        </div>

        <Modal v-model="showModal" title="Ajouter des filières" @filieres-confirmed="handleFilieresConfirmed" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
    layout: 'user-layout',
})

const router = useRouter();
const showModal = ref(false);
const confirmedFilieres = ref([]);

// Charger les données au démarrage
onMounted(() => {
    const storedFilieres = localStorage.getItem('confirmedFilieres');
    if (storedFilieres) {
        confirmedFilieres.value = JSON.parse(storedFilieres);
    }
});

// Sauvegarder les données à chaque changement
watch(confirmedFilieres, (newValue) => {
    localStorage.setItem('confirmedFilieres', JSON.stringify(newValue));
}, { deep: true });

// Méthode pour rediriger vers la page du calendrier avec le nom de la filière
const goToCalendar = (filiere) => {
    if (filiere) {
        router.push(`/${filiere}`);
    } else {
        console.error('Filière invalide:', filiere);
    }
};

const handleFilieresConfirmed = (filieres) => {
    confirmedFilieres.value = filieres;
};
</script>