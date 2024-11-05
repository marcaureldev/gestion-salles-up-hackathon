<template>
  <div class="bg-white shadow-xl rounded-lg overflow-hidden">
    <div class="p-4 border-b">
      <h2 class="text-xl font-semibold text-gray-800">
        Notifications des réservations
      </h2>
    </div>
    <div class="p-4">
      <div class="mb-4">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher une notification..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div v-if="loading" class="text-center py-4">
        <p>Chargement des données...</p>
      </div>
      <div v-if="error" class="text-red-600 text-center py-4">
        {{ error }}
      </div>
      <div class="space-y-4">
        <div
          v-for="filiere in filieres"
          :key="filiere.nom"
          class="p-4 border rounded-lg hover:bg-gray-50"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-900">{{ filiere.nom }} - {{ filiere.filiere }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                Créneau : {{ filiere.heure_debut }} - {{ filiere.heure_fin }}
              </p>
              <p class="text-sm text-gray-600">
                Effectif : {{ filiere.effectif }} | Année : {{ filiere.anne_etude }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["edit", "delete"]);
const searchTerm = ref("");

const filteredNotifications = computed(() => {
  return props.notifications.filter((notification) =>
    notification.filiere_nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    notification.entite_nom.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

const filieres = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchFilieres = async () => {
  loading.value = true;
  try {
    const response = await fetch('https://api-gestion-salle.onrender.com/gestion/list-filiere');
    if (!response.ok) {
      throw new Error('Erreur réseau');
    }
    const data = await response.json();
    filieres.value = data;
  } catch (err) {
    error.value = "Erreur lors du chargement des filières";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchFilieres();
});
</script>
