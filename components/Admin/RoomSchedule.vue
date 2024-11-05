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
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salle</th>
              <th class="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matin (07:00-13:00)</th>
              <th class="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soir (15:00-19:00)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="salle in filteredSalles" :key="salle" class="hover:bg-gray-50">
              <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ salle }}
              </td>
              <td v-for="periode in ['matin', 'soir']" :key="periode" class="px-4 py-4 border">
                <div 
                  v-if="getAttribution(salle, periode)" 
                  :class="getAttributionClass(getAttribution(salle, periode).entite_nom)"
                  class="p-2 rounded"
                >
                  <p class="font-semibold">{{ getAttribution(salle, periode).entite_nom }}</p>
                  <p class="text-xs">{{ getAttribution(salle, periode).filiere_nom }}</p>
                  <p class="text-xs opacity-75">
                    {{ getAttribution(salle, periode).heure_debut.slice(0, 5) }} - 
                    {{ getAttribution(salle, periode).heure_fin.slice(0, 5) }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Définition des props
const props = defineProps({
  rooms: {
    type: Array,
    required: true
  },
  attributions: {
    type: Array,
    required: true
  },
  entiteColors: {
    type: Object,
    required: true
  }
})

const selectedSection = ref('all')
const selectedFilters = ref({
  salle: '',
  entite: ''
})

// Remplacer attributionsData par props.attributions dans toutes les fonctions
// Remplacer entiteColors par props.entiteColors dans la fonction getAttributionClass

const getAttributionClass = (entite) => {
  return props.entiteColors[entite] || 'bg-gray-100'
}

// Modifier les computed properties pour utiliser props.attributions
const uniqueSalles = computed(() => 
  [...new Set(props.attributions.map(a => a.salle_nom))]
)

const uniqueEntites = computed(() => 
  [...new Set(props.attributions.map(a => a.entite_nom))]
)

const filteredSalles = computed(() => {
  let salles = uniqueSalles.value
  if (selectedFilters.value.salle) {
    salles = salles.filter(s => s === selectedFilters.value.salle)
  }
  return salles
})

// Fonction pour obtenir l'attribution d'une salle pour une période donnée
const getAttribution = (salle, periode) => {
  return props.attributions.find(a => {
    const estMemeCreneauHoraire = 
      (periode === 'matin' && a.heure_debut === '07:00:00' && a.heure_fin === '13:00:00') ||
      (periode === 'soir' && a.heure_debut === '15:00:00' && a.heure_fin === '19:00:00')
    
    return a.salle_nom === salle && 
           estMemeCreneauHoraire &&
           (!selectedFilters.value.entite || a.entite_nom === selectedFilters.value.entite)
  })
}
</script>

<style scoped>
.attribution-cell {
  min-height: 100px;
}
</style>