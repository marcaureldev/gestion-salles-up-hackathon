<template>
    <div class="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-full md:w-64 bg-white shadow-md md:h-screen">
        <div class="p-4 border-b">
          <h1 class="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
        </div>
        <nav class="mt-4">
          <a v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="['flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors duration-200', { 'bg-gray-200': activeTab === tab.id }]" href="#">
            <component :is="tab.icon" class="w-5 h-5 mr-2" />
            {{ tab.name }}
          </a>
        </nav>
      </aside>
  
      <!-- Main Content -->
      <div class="flex-1 overflow-hidden">
        <header class="bg-white shadow">
          <div class="mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900">{{ activeTabTitle }}</h1>
            <button @click="toggleSidebar" class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <MenuIcon class="h-6 w-6" />
            </button>
          </div>
        </header>
  
        <main class="w-full mx-auto py-6 sm:px-6 lg:px-8 overflow-y-auto" style="height: calc(100vh - 64px);">
          <!-- Calendar Overview -->
          <AdminRoomSchedule 
            v-if="activeTab === 'calendar'" 
            :rooms="rooms" 
            :attributions="attributionsData" 
            :entite-colors="entiteColors"
          />
  
          <!-- Reservations Management -->
          <AdminReservationManagement 
            v-if="activeTab === 'reservations'" 
            :notifications="attributionsData" 
            @edit="editNotification" 
            @delete="deleteNotification" 
          />
  
          <!-- Automatic Allocation -->
          <AdminAutomaticAllocation v-if="activeTab === 'allocation'" @run="runAllocationAlgorithm" :result="allocationResult" />
  
          <!-- Statistics and Reports -->
          <AdminStatistics v-if="activeTab === 'stats'" @generate-report="generateReport" />
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  const activeTab = ref('calendar')
  const allocationResult = ref(null)
  
  const tabs = [
    { id: 'calendar', name: 'Calendrier',},
    { id: 'reservations', name: 'Réservations', },
    { id: 'allocation', name: 'Allocation Auto',},
    { id: 'stats', name: 'Statistiques',},
  ]
  
  const rooms = ref([
    { id: 1, name: 'Salle A101', capacity: 30 },
    { id: 2, name: 'Salle B202', capacity: 50 },
    { id: 3, name: 'Salle C303', capacity: 20 },
    // Add more rooms as needed
  ])
  
  const reservations = ref([
    { id: 1, roomId: 1, date: '2023-05-15', startTime: '09:00', endTime: '11:00', event: 'Cours de mathématiques', status: 'confirmé' },
    { id: 2, roomId: 2, date: '2023-05-16', startTime: '14:00', endTime: '16:00', event: 'Séminaire de physique', status: 'en attente' },
    { id: 3, roomId: 3, date: '2023-05-17', startTime: '10:00', endTime: '12:00', event: 'Réunion du département', status: 'annulé' },
    // Add more reservations here
  ])
  
  const activeTabTitle = computed(() => {
    const activeTabObj = tabs.find(tab => tab.id === activeTab.value)
    return activeTabObj ? activeTabObj.name : 'Tableau de bord'
  })
  
  const toggleSidebar = () => {
    // Implement sidebar toggle for mobile view
    console.log('Toggle sidebar')
  }
  
  const editReservation = (reservation) => {
    // Implement edit logic here
    console.log('Editing reservation:', reservation)
  }
  
  const deleteReservation = (reservation) => {
    // Implement delete logic here
    console.log('Deleting reservation:', reservation)
  }
  
  const runAllocationAlgorithm = () => {
    // Simulate algorithm execution
    setTimeout(() => {
      allocationResult.value = "Allocation automatique terminée. 15 salles attribuées avec succès."
    }, 2000)
  }
  
  const generateReport = () => {
    // Implement report generation logic here
    console.log('Generating report')
  }
  
  // Ajout des données d'attribution
  const attributionsData = ref([
    {
      "salle_nom": "Amphi 1000",
      "entite_nom": "Faseg",
      "filiere_nom": "economie",
      "heure_debut": "07:00:00",
      "heure_fin": "13:00:00",
      "date_attribution": "2024-11-04T00:36:39.903317Z"
    },
    {
      "salle_nom": "Salle 12",
      "entite_nom": "IUT",
      "filiere_nom": "IG",
      "heure_debut": "07:00:00",
      "heure_fin": "13:00:00",
      "date_attribution": "2024-11-04T00:36:40.029523Z"
    },
    {
      "salle_nom": "amphi Uemoa",
      "entite_nom": "Ifsio",
      "filiere_nom": "Sage femme",
      "heure_debut": "07:00:00",
      "heure_fin": "13:00:00",
      "date_attribution": "2024-11-04T00:36:40.145953Z"
    },
    {
      "salle_nom": "Salle 12",
      "entite_nom": "FM",
      "filiere_nom": "Medecine",
      "heure_debut": "15:00:00",
      "heure_fin": "19:00:00",
      "date_attribution": "2024-11-04T00:36:40.370509Z"
    },
    {
      "salle_nom": "RDC Solidarité",
      "entite_nom": "FA",
      "filiere_nom": "AGRO",
      "heure_debut": "15:00:00",
      "heure_fin": "19:00:00",
      "date_attribution": "2024-11-04T00:36:40.612223Z"
    }
  ])
  
  // Mapping des entités vers des couleurs
  const entiteColors = {
    'Faseg': 'bg-blue-100',
    'IUT': 'bg-green-100',
    'Ifsio': 'bg-yellow-100',
    'FM': 'bg-red-100',
    'FA': 'bg-purple-100',
    'Enatse': 'bg-indigo-100',
    'Fadspe': 'bg-pink-100',
    'Socio': 'bg-orange-100'
  }
  
  const editNotification = (notification) => {
    // Implement edit logic here
    console.log('Editing notification:', notification)
  }
  
  const deleteNotification = (notification) => {
    // Implement delete logic here
    console.log('Deleting notification:', notification)
  }
  </script>
  
  <style>
  @import 'tailwindcss/base';
  @import 'tailwindcss/components';
  @import 'tailwindcss/utilities';
  </style>