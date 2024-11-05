<template>
  <div class="bg-white shadow-xl rounded-lg overflow-hidden">
    <div class="p-4 border-b">
      <h2 class="text-xl font-semibold text-gray-800">
        Statistiques des attributions
      </h2>
    </div>

    <!-- Vue d'ensemble -->
    <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h4 class="text-sm text-blue-600 font-medium">Total Attributions</h4>
        <p class="text-2xl font-bold text-blue-800">{{ statsOverview.totalAttributions }}</p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <h4 class="text-sm text-green-600 font-medium">Salles Utilisées</h4>
        <p class="text-2xl font-bold text-green-800">{{ statsOverview.sallesUniques }}</p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <h4 class="text-sm text-purple-600 font-medium">Entités</h4>
        <p class="text-2xl font-bold text-purple-800">{{ statsOverview.entitesUniques }}</p>
      </div>
      <div class="bg-orange-50 p-4 rounded-lg">
        <h4 class="text-sm text-orange-600 font-medium">Filières</h4>
        <p class="text-2xl font-bold text-orange-800">{{ statsOverview.filieresUniques }}</p>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Utilisation des salles
          </h3>
          <div v-if="occupancyData.datasets[0].data.length > 0" class="h-64">
            <Bar :data="occupancyData" :options="chartOptions" />
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            Aucune donnée disponible
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Répartition par entité
          </h3>
          <div v-if="entitesData.datasets[0].data.length > 0" class="h-64">
            <Doughnut :data="entitesData" :options="donutOptions" />
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            Aucune donnée disponible
          </div>
        </div>
      </div>

      <!-- Graphique supplémentaire -->
      <div class="mt-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Répartition horaire
          </h3>
          <div v-if="horaireData.datasets[0].data.some(v => v > 0)" class="h-64">
            <Bar :data="horaireData" :options="chartOptions" />
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-500">
            Aucune donnée disponible
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Line, Doughnut, Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement)

// Données réactives pour les statistiques
const statsOverview = ref({
  totalAttributions: 0,
  sallesUniques: 0,
  entitesUniques: 0,
  filieresUniques: 0
})

const occupancyData = ref({
  labels: [],
  datasets: [{
    label: 'Nombre d\'attributions',
    data: [],
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4
  }]
})

const chicColors = [
  '#E8C4C4', // rose poudré
  '#B4E4FF', // bleu ciel doux
  '#95BDFF', // bleu lavande
  '#DFFFD8', // vert menthe
  '#F7C8E0', // rose dragée
  '#B4CDE6', // bleu glacier
  '#FFE5F1', // rose pâle
  '#DBDFEA', // gris perle
]

const entitesData = ref({
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: chicColors,
    borderColor: '#ffffff',
    borderWidth: 2,
    hoverBorderWidth: 0,
    hoverOffset: 5
  }]
})

const horaireData = ref({
  labels: ['Matin (7h-13h)', 'Après-midi (15h-19h)'],
  datasets: [{
    label: 'Répartition horaire',
    data: [0, 0],
    backgroundColor: ['#60A5FA', '#34D399'],
  }]
})

const calculateStats = () => {
  const attributions = JSON.parse(localStorage.getItem('automatic_allocations') || '[]')
  
  if (attributions.length === 0) return

  // Statistiques générales
  const salles = new Set(attributions.map(a => a.salle_nom))
  const entites = new Set(attributions.map(a => a.entite_nom))
  const filieres = new Set(attributions.map(a => a.filiere_nom))

  statsOverview.value = {
    totalAttributions: attributions.length,
    sallesUniques: salles.size,
    entitesUniques: entites.size,
    filieresUniques: filieres.size
  }

  // Occupation par salle
  const salleStats = {}
  attributions.forEach(attr => {
    salleStats[attr.salle_nom] = (salleStats[attr.salle_nom] || 0) + 1
  })
  
  occupancyData.value.labels = Object.keys(salleStats)
  occupancyData.value.datasets[0].data = Object.values(salleStats)

  // Répartition par entité
  const entiteStats = {}
  attributions.forEach(attr => {
    entiteStats[attr.entite_nom] = (entiteStats[attr.entite_nom] || 0) + 1
  })
  
  entitesData.value.labels = Object.keys(entiteStats)
  entitesData.value.datasets[0].data = Object.values(entiteStats)

  // Répartition par horaire
  const horaireStats = [0, 0] // [matin, après-midi]
  attributions.forEach(attr => {
    if (attr.heure_debut === '07:00:00') horaireStats[0]++
    if (attr.heure_debut === '15:00:00') horaireStats[1]++
  })
  
  horaireData.value.datasets[0].data = horaireStats
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  }
}

// Options raffinées pour le donut
const donutOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          family: "'Poppins', sans-serif", // Police plus moderne
          size: 11
        },
        color: '#64748b' // Couleur de texte douce
      }
    }
  },
  cutout: '70%', // Donut encore plus fin pour plus d'élégance
  animation: {
    animateScale: true,
    animateRotate: true
  }
}

// Écouter les changements dans le localStorage
window.addEventListener('storage', () => {
  calculateStats()
})

onMounted(() => {
  calculateStats()
})
</script>
