<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <main class="w-full p-6 scrollbar-hide">
      <!-- Section du bouton de lancement -->
      <div class="mb-8">
        <div class="text-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            Allocation Automatique des Salles
          </h2>
          <p class="text-gray-600 mb-2">
            Cliquez sur le bouton ci-dessous pour lancer l'algorithme
            d'allocation automatique
          </p>
          <p class="text-sm text-gray-500">
            Cette opération peut prendre quelques instants
          </p>
        </div>

        <div class="flex justify-center">
          <button
            @click="runAllocationAlgorithm"
            :disabled="isLoading"
            class="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-300"
          >
            <span v-if="isLoading" class="mr-2">
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{
              isLoading
                ? "Allocation en cours..."
                : "Lancer l'allocation automatique"
            }}
          </button>
        </div>

        <div
          v-if="allocationResult"
          class="mt-4 p-4 rounded-lg text-center"
          :class="
            allocationResult.includes('Erreur')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          "
        >
          {{ allocationResult }}
        </div>
      </div>

      <!-- Ajouter juste après l'ouverture de la balise main -->
      <div
        v-if="showToast"
        class="fixed top-4 right-4 bg-green-50 text-green-800 px-4 py-3 rounded-lg shadow-lg border border-green-200 flex items-center transition-opacity duration-300"
        :class="{ 'opacity-0': isToastFading }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        Un rapport a été envoyé à chaque entité
      </div>

      <!-- Tableau des salles -->
      <div
        v-if="hasAllocations"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  class="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Salle (Capacité)
                </th>
                <th
                  class="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Matin (07:00-13:00)
                </th>
                <th
                  class="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Soir (15:00-19:00)
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="salle in sallesWithAttributions"
                :key="salle.nom"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ salle.nom }}
                  </div>
                  <div class="text-sm text-gray-500">
                    Capacité: {{ salle.capacite_max }}
                  </div>
                </td>
                <td
                  v-for="periode in ['matin', 'soir']"
                  :key="periode"
                  class="px-6 py-4"
                >
                  <div
                    v-if="getAttribution(salle.nom, periode)"
                    class="p-3 rounded-md bg-gray-50 border border-gray-200"
                  >
                    <p class="font-medium text-gray-900">
                      {{ getAttribution(salle.nom, periode).entite_nom }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ getAttribution(salle.nom, periode).filiere_nom }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{
                        formatTime(
                          getAttribution(salle.nom, periode).heure_debut
                        )
                      }}
                      -
                      {{
                        formatTime(getAttribution(salle.nom, periode).heure_fin)
                      }}
                    </p>
                  </div>
                  <div v-else class="text-sm text-gray-400 italic">
                    Non attribué
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ajouter le bouton de génération de rapport après le message de résultat -->
      <div class="flex justify-end mt-4" v-if="hasAllocations">
        <button
          @click="generateReport"
          class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
              clip-rule="evenodd"
            />
          </svg>
          Générer le rapport
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
// Garder tous les imports existants
import { ref, computed, onMounted } from "vue";
import {
  CalendarIcon,
  BookOpenIcon,
  CogIcon,
  ChartBarIcon,
  MenuIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/outline";

// Ajouter les nouvelles refs pour les salles
const salles = ref([]);
const hasAllocations = ref(false);
const isLoading = ref(false);
const allocationResult = ref(null);
const events = ref([]);

// Ajouter les nouvelles refs pour le toast
const showToast = ref(false);
const isToastFading = ref(false);

// Ajouter le computed pour filtrer les salles
const sallesWithAttributions = computed(() => {
  if (!salles.value.length || !events.value.length) return [];

  return salles.value.filter((salle) => {
    return events.value.some((event) => event.salle_nom === salle.nom);
  });
});

// Garder les constantes existantes
const STORAGE_KEYS = {
  ALLOCATIONS: "automatic_allocations",
  ALGORITHM_STATE: "algorithm_executed",
};

// Nouvelle fonction pour récupérer la liste des salles
const fetchSalles = async () => {
  try {
    const response = await fetch(
      "https://api-gestion-salle.onrender.com/gestion/list-salle"
    );
    if (!response.ok)
      throw new Error("Erreur lors de la récupération des salles");
    salles.value = await response.json();
  } catch (error) {
    console.error("Erreur:", error);
  }
};

// Fonction pour formater l'heure
const formatTime = (time) => {
  return time.slice(0, 5);
};

// Fonction pour obtenir l'attribution d'une salle
const getAttribution = (salle, periode) => {
  if (!events.value.length) return null;

  const heures = {
    matin: { debut: "07:00", fin: "13:00" },
    soir: { debut: "15:00", fin: "19:00" },
  };

  return events.value.find(
    (event) =>
      event.salle_nom === salle &&
      event.heure_debut.startsWith(heures[periode].debut) &&
      event.heure_fin.startsWith(heures[periode].fin)
  );
};

// Modifier la fonction fetchAndUpdateEvents existante
const fetchAndUpdateEvents = async () => {
  try {
    const response = await fetch(
      "https://api-gestion-salle.onrender.com/gestion/attribution"
    );
    if (!response.ok)
      throw new Error("Erreur lors de la récupération des événements");

    const newAttributions = await response.json();
    localStorage.setItem(
      STORAGE_KEYS.ALLOCATIONS,
      JSON.stringify(newAttributions)
    );
    events.value = newAttributions;
    hasAllocations.value = true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du calendrier:", error);
  }
};

// Modifier onMounted pour inclure le chargement des salles
onMounted(async () => {
  await fetchSalles();
  const savedAllocations = localStorage.getItem(STORAGE_KEYS.ALLOCATIONS);
  if (savedAllocations) {
    events.value = JSON.parse(savedAllocations);
    hasAllocations.value = true;
  }
});

// Garder la fonction runAllocationAlgorithm existante
const runAllocationAlgorithm = async () => {
  try {
    isLoading.value = true;
    allocationResult.value = "Allocation en cours...";

    const response = await fetch(
      "https://api-gestion-salle.onrender.com/gestion/lancer-algo/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    allocationResult.value =
      data.message || "Allocation automatique terminée avec succès.";

    await fetchAndUpdateEvents();
  } catch (error) {
    console.error("Erreur lors du lancement de l'algorithme:", error);
    allocationResult.value =
      "Erreur lors de l'allocation automatique. Veuillez réessayer.";
  } finally {
    isLoading.value = false;
  }
};

// Fonction pour gérer le toast
const showToastMessage = () => {
  showToast.value = true;
  isToastFading.value = false;

  // Commencer à faire disparaître le toast après 2.5 secondes
  setTimeout(() => {
    isToastFading.value = true;
  }, 2500);

  // Cacher complètement le toast après l'animation de fade
  setTimeout(() => {
    showToast.value = false;
    isToastFading.value = false;
  }, 2800);
};

// Fonction de génération de rapport
const generateReport = async () => {
  try {
    // Simulation d'envoi de rapport (à remplacer par votre véritable API)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    showToastMessage();
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
  }
};
</script>

<style scoped>
.opacity-0 {
  opacity: 0;
}

.transition-opacity {
  transition: opacity 0.3s ease-in-out;
}

.scrollbar-hide {
  -ms-overflow-style: none; /* Pour Internet Explorer */
  scrollbar-width: none; /* Pour Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Pour Chrome, Safari */
}
</style>
