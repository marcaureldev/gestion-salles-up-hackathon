<template>
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeModal">
        <div class="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
            <form class="mt-4" @submit.prevent="addFiliere">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="filiere" class="text-sm font-medium text-gray-700">
                            Filière
                        </label>
                        <input id="filiere"
                            class="w-full px-6 py-3 rounded-lg font-medium border border-gray-200 placeholder-gray-500 focus:outline-none focus:bg-white"
                            type="text" placeholder="Quelles sont les filières de votre entité?" v-model="filiere"
                            @keydown.enter.prevent="addFiliere" />
                    </div>
                </div>
            </form>
            <div class="mt-4">
                <h3 class="text-lg font-semibold mb-2">Filières ajoutées :</h3>
                <ul class=" flex flex-wrap gap-2 items-center">
                    <li class="bg-custom-gradient text-white py-1 px-2 rounded-md" v-for="(fil, index) in filieres" :key="index">{{ fil }}</li>
                </ul>
            </div>
            <div class="flex justify-end mt-4">
                <button class="px-6 py-3 text-white bg-custom-gradient rounded-lg" type="button"
                    @click="confirmAndClose">
                    Confirmer
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: 'Ajouter des filières'
    }
});

const emit = defineEmits(['update:modelValue', 'filieres-confirmed']);

const filiere = ref('');
const filieres = ref([]);

const closeModal = () => {
    emit('update:modelValue', false);
};

const addFiliere = () => {
    if (filiere.value.trim()) {
        filieres.value.push(filiere.value.trim());
        filiere.value = '';
    }
};

const confirmAndClose = () => {
    emit('filieres-confirmed', filieres.value);
    closeModal();
};

const handleKeydown = (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
        addFiliere();
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
});
</script>