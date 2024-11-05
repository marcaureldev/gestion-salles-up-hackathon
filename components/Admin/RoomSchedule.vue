<template>
  <div class="bg-white shadow-sm rounded-lg overflow-hidden">
    <div class="p-4 border-b flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800">Attribution des Salles</h2>
      <div class="flex gap-2">
        <select v-model="selectedSection" class="rounded-md border-gray-300 text-sm">
          <option value="all">Toutes les sections</option>
          <option value="section1">Section 1</option>
          <option value="section2">Section 2</option>
        </select>
      </div>
    </div>

    <div class="p-4">
      <!-- Filtres -->
      <div class="flex flex-wrap gap-4 mb-4">
        <select v-model="selectedFilters.salle" class="rounded-md border-gray-300">
          <option value="">Toutes les salles</option>
          <option v-for="salle in uniqueSalles" :key="salle" :value="salle">
            {{ salle }}
          </option>
        </select>
        <select v-model="selectedFilters.entite" class="rounded-md border-gray-300">
          <option value="">Toutes les entités</option>
          <option v-for="entite in uniqueEntites" :key="entite" :value="entite">
            {{ entite }}
          </option>
        </select>
      </div>

      <!-- Tableau des attributions -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salle (Capacité)
                </th>
                <th class="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matin (07:00-13:00)
                </th>
                <th class="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Soir (15:00-19:00)
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="salle in filteredSalles" :key="salle" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ salle }}</div>
                  <div class="text-sm text-gray-500">
                    Capacité: {{ getSalleCapacite(salle) }}
                  </div>
                </td>
                <td v-for="periode in ['matin', 'soir']" :key="periode" class="px-6 py-4">
                  <div 
                    v-if="getAttribution(salle, periode)" 
                    class="p-3 rounded-md bg-gray-50 border border-gray-200"
                    :class="getAttributionClass(getAttribution(salle, periode).entite_nom)"
                  >
                    <p class="font-medium text-gray-900">
                      {{ getAttribution(salle, periode).entite_nom }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ getAttribution(salle, periode).filiere_nom }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ getAttribution(salle, periode).heure_debut.slice(0, 5) }} - 
                      {{ getAttribution(salle, periode).heure_fin.slice(0, 5) }}
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const STORAGE_KEYS = {
  ALLOCATIONS: 'automatic_allocations'
}

// État local
const attributions = ref([])
const salles = ref([])
const selectedFilters = ref({
  salle: '',
  entite: ''
})

// Charger les données initiales
const loadInitialData = async () => {
  try {
    // Charger les salles depuis l'API avec fetch
    const response = await fetch(
      "https://api-gestion-salle.onrender.com/gestion/list-salle"
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des salles");
    }
    salles.value = await response.json()

    // Vérifier le localStorage
    const savedAllocations = localStorage.getItem(STORAGE_KEYS.ALLOCATIONS)
    console.log(savedAllocations);
    if (savedAllocations) {
      attributions.value = JSON.parse(savedAllocations)
    } else {
      // Initialiser avec des salles vides
      attributions.value = []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
}

// Surveiller les changements dans le localStorage
const watchStorageChanges = (e) => {
  if (e.key === STORAGE_KEYS.ALLOCATIONS) {
    attributions.value = JSON.parse(e.newValue || '[]')
  }
}

// Computed properties
const uniqueSalles = computed(() => 
  [...new Set(salles.value.map(s => s.nom))]
)

const uniqueEntites = computed(() => {
  const allAttributions = attributions.value || []
  return [...new Set(allAttributions.map(attr => attr.entite_nom))]
})

const filteredSalles = computed(() => {
  let result = uniqueSalles.value
  if (selectedFilters.value.salle) {
    result = result.filter(s => s === selectedFilters.value.salle)
  }
  return result
})

// Fonction pour obtenir l'attribution d'une salle
const getAttribution = (salle, periode) => {
  return attributions.value?.find(attr => {
    const estMemeCreneauHoraire = 
      (periode === 'matin' && attr.heure_debut === '07:00:00' && attr.heure_fin === '13:00:00') ||
      (periode === 'soir' && attr.heure_debut === '15:00:00' && attr.heure_fin === '19:00:00')
    
    return attr.salle_nom === salle && 
           estMemeCreneauHoraire &&
           (!selectedFilters.value.entite || attr.entite_nom === selectedFilters.value.entite)
  })
}

const getAttributionClass = (entite) => {
  const colors = {
    'ISGA': 'bg-blue-50 border-blue-200',
    'ISIAM': 'bg-green-50 border-green-200',
    'HEM': 'bg-yellow-50 border-yellow-200'
  }
  return colors[entite] || 'bg-gray-50 border-gray-200'
}

const getSalleCapacite = (salleName) => {
  const salle = salles.value.find(s => s.nom === salleName)
  return salle ? salle.capacite_max : 'N/A'
}

// Lifecycle hooks
onMounted(() => {
  loadInitialData()
  window.addEventListener('storage', watchStorageChanges)
})

onUnmounted(() => {
  window.removeEventListener('storage', watchStorageChanges)
})
</script>

<style scoped>
.attribution-cell {
  min-height: 100px;
}

.scrollbar-hide {
  -ms-overflow-style: none
}
</style>