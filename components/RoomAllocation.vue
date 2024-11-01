<script setup>
import { ref, onMounted } from 'vue'
import GLPK from 'glpk.js'

// Données de test pour les salles
const mockRooms = [
  { id: 1, name: 'Salle A101', capacity: 30 },
  { id: 2, name: 'Salle B201', capacity: 50 },
  { id: 3, name: 'Amphithéâtre C1', capacity: 150 },
  { id: 4, name: 'Salle D102', capacity: 25 },
  { id: 5, name: 'Salle E201', capacity: 24 }
]

// Données de test pour les demandes
const mockRequests = [
  { id: 1, entityId: 101, eventType: 'course', studentCount: 25, timeSlot: '8h-10h', priority: 1 },
  { id: 2, entityId: 102, eventType: 'exam', studentCount: 30, timeSlot: '8h-10h', priority: 2 },
  { id: 3, entityId: 103, eventType: 'defense', studentCount: 15, timeSlot: '10h-12h', priority: 3 },
  { id: 4, entityId: 104, eventType: 'conference', studentCount: 120, timeSlot: '14h-16h', priority: 4 },
  { id: 5, entityId: 105, eventType: 'course', studentCount: 35, timeSlot: '14h-16h', priority: 1 },
  { id: 6, entityId: 106, eventType: 'course', studentCount: 27, timeSlot: '8h-10h', priority: 1 },
  { id: 7, entityId: 107, eventType: 'course', studentCount: 27, timeSlot: '8h-10h', priority: 1 }
]

const rooms = ref([])
const requests = ref([])
const glpkInstance = ref(null)
const result = ref(null)
const allocations = ref([])
const isLoading = ref(false)
const error = ref(null)

onMounted(async () => {
  try {
    glpkInstance.value = await GLPK()
    rooms.value = mockRooms
    requests.value = mockRequests
    await handleAllocation()
  } catch (err) {
    error.value = "Erreur lors de l'initialisation"
    console.error(err)
  }
})

const handleAllocation = async () => {
  isLoading.value = true
  error.value = null
  try {
    const result = await solveAllocation()
    processResults(result)
  } catch (err) {
    error.value = "Erreur lors de l'allocation des salles"
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const processResults = (result) => {
  allocations.value = []
  if (result && result.vars) {
    Object.entries(result.vars).forEach(([key, value]) => {
      if (value === 1) {
        const [_, requestIndex, roomIndex, timeSlot] = key.split('_')
        allocations.value.push({
          requestId: requests.value[Number(requestIndex)].id,
          roomId: rooms.value[Number(roomIndex)].id,
          timeSlot: timeSlot
        })
      }
    })
  }
}

const getEventTypeClass = (type) => {
  switch (type) {
    case 'conference': return 'bg-purple-100 text-purple-800'
    case 'defense': return 'bg-green-100 text-green-800'
    case 'exam': return 'bg-red-100 text-red-800'
    case 'course': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPriority = (eventType) => {
  switch (eventType) {
    case 'conference': return 4
    case 'defense': return 3
    case 'exam': return 2
    case 'course': return 1
    default: return 0
  }
}

const solveAllocation = async () => {
  if (!glpkInstance.value) {
    throw new Error('GLPK n\'est pas encore initialisé')
  }

  // Structure principale du problème d'optimisation linéaire
  // On cherche à maximiser l'objectif tout en respectant les contraintes
  const problem = {
    name: 'Room Allocation',
    objective: {
      direction: glpkInstance.value.GLP_MAX,  // On maximise la fonction objectif
      name: 'obj',
      vars: []
    },
    subjectTo: [],  // Contiendra toutes nos contraintes
    binaries: []    // Variables binaires (0 ou 1)
  }

  // Variables de décision xijk
  // i: index de la demande
  // j: index de la salle
  // k: créneau horaire
  // Si xijk = 1, alors la demande i est affectée à la salle j pendant le créneau k
  // Si xijk = 0, pas d'affectation
  requests.value.forEach((request, i) => {
    rooms.value.forEach((room, j) => {
      const varName = `x_${i}_${j}_${request.timeSlot}`
      problem.binaries.push({ name: varName })
      
      // La fonction objectif prend en compte :
      // 1. La priorité de l'événement (conference > defense > exam > course)
      // 2. La capacité de la salle (coefficient = 0 si la salle est trop petite)
      problem.objective.vars.push({
        name: varName,
        coef: getPriority(request.eventType) * (room.capacity >= request.studentCount ? 1 : 0)
      })
    })
  })

  // Contrainte 1: Une demande doit être affectée à exactement une salle
  // Σj xijk = 1 pour chaque demande i et son créneau k
  requests.value.forEach((request, i) => {
    const constraint = {
      name: `one_room_${i}`,
      vars: [],
      bnds: { type: glpkInstance.value.GLP_FX, ub: 1.0, lb: 1.0 }  // Égal à 1 exactement
    }
    
    rooms.value.forEach((room, j) => {
      constraint.vars.push({
        name: `x_${i}_${j}_${request.timeSlot}`,
        coef: 1.0
      })
    })
    
    problem.subjectTo.push(constraint)
  })

  // Contrainte 2: Une salle ne peut accueillir qu'un seul événement par créneau
  // Σi xijk ≤ 1 pour chaque salle j et créneau k
  rooms.value.forEach((room, j) => {
    // On récupère la liste unique des créneaux horaires
    const timeSlots = [...new Set(requests.value.map(r => r.timeSlot))]
    
    timeSlots.forEach(timeSlot => {
      const constraint = {
        name: `room_capacity_${j}_${timeSlot}`,
        vars: [],
        bnds: { type: glpkInstance.value.GLP_UP, ub: 1.0, lb: 0.0 }  // Inférieur ou égal à 1
      }
      
      // On ajoute les variables correspondant aux demandes sur ce créneau
      requests.value.forEach((request, i) => {
        if (request.timeSlot === timeSlot) {
          constraint.vars.push({
            name: `x_${i}_${j}_${timeSlot}`,
            coef: 1.0
          })
        }
      })
      
      problem.subjectTo.push(constraint)
    })
  })

  try {
    const result = await glpkInstance.value.solve(problem)
    console.log('Solution trouvée:', result)
    result.value = result
    return result
  } catch (error) {
    console.error('Erreur lors de la résolution:', error)
    throw error
  }
}

const translateEventType = (type) => {
  switch (type) {
    case 'conference': return 'Conférence'
    case 'defense': return 'Soutenance'
    case 'exam': return 'Examen'
    case 'course': return 'Cours'
    default: return 'Inconnu'
  }
}

const calculateOccupancy = (allocation) => {
  const request = requests.value.find(r => r.id === allocation.requestId)
  const room = rooms.value.find(r => r.id === allocation.roomId)
  if (!request || !room) return 0
  return Math.round((request.studentCount / room.capacity) * 100)
}

// Fonction d'interprétation des résultats bruts
const interpretResults = (vars) => {
  // Structure pour stocker les allocations par créneau
  const interpretations = {}

  // Analyse chaque variable de décision
  Object.entries(vars).forEach(([key, value]) => {
    if (value === 1) {
      // Décomposition de la clé x_requestIndex_roomIndex_timeSlot
      const [_, requestIndex, roomIndex, timeSlot] = key.split('_')
      
      const request = requests.value[Number(requestIndex)]
      const room = rooms.value[Number(roomIndex)]

      if (!interpretations[timeSlot]) {
        interpretations[timeSlot] = []
      }

      interpretations[timeSlot].push({
        timeSlot,
        requestDetails: {
          id: request.id,
          type: request.eventType,
          students: request.studentCount
        },
        roomDetails: {
          id: room.id,
          name: room.name,
          capacity: room.capacity
        }
      })
    }
  })

  return interpretations
}
</script>

<template>
  <div class="room-allocation p-6">
    <h2 class="text-2xl font-bold mb-6">Attribution des Salles</h2>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <div class="grid gap-6">
      <!-- Tableau des créneaux horaires -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-6 py-3 border-b text-left">Créneau</th>
              <th class="px-6 py-3 border-b text-left">Salle</th>
              <th class="px-6 py-3 border-b text-left">Type d'événement</th>
              <th class="px-6 py-3 border-b text-left">Nombre d'étudiants</th>
              <th class="px-6 py-3 border-b text-left">Taux d'occupation</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="allocation in allocations" :key="`${allocation.roomId}-${allocation.timeSlot}`">
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 border-b">{{ allocation.timeSlot }}</td>
                <td class="px-6 py-4 border-b">
                  {{ rooms.find(r => r.id === allocation.roomId)?.name }}
                </td>
                <td class="px-6 py-4 border-b">
                  <span 
                    class="px-2 py-1 rounded-full text-sm"
                    :class="getEventTypeClass(requests.find(r => r.id === allocation.requestId)?.eventType || '')"
                  >
                    {{ translateEventType(requests.find(r => r.id === allocation.requestId)?.eventType) }}
                  </span>
                </td>
                <td class="px-6 py-4 border-b">
                  {{ requests.find(r => r.id === allocation.requestId)?.studentCount }}
                  <span class="text-sm text-gray-500">
                    / {{ rooms.find(r => r.id === allocation.roomId)?.capacity }}
                  </span>
                </td>
                <td class="px-6 py-4 border-b">
                  {{ calculateOccupancy(allocation) }}%
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="eventType in ['conference', 'defense', 'exam', 'course']" 
             :key="eventType"
             class="p-4 rounded-lg shadow"
             :class="getEventTypeClass(eventType)">
          <h3 class="font-semibold capitalize">{{ eventType }}</h3>
          <p class="text-2xl font-bold">
            {{ requests.filter(r => r.eventType === eventType).length }}
          </p>
        </div>
      </div>
    </div>

    <button 
      @click="handleAllocation"
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      :disabled="isLoading"
    >
      Réaffecter les salles
    </button>
  </div>


  <div>
    <pre>{{ result }}</pre>
  </div>
</template> 
