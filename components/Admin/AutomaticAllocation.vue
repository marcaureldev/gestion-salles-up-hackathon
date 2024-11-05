<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-gray-100">

    <main>
      <!-- Calendar Overview -->
      <div v-if="activeTab === 'calendar'" class="bg-white rounded-lg shadow-xl overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Calendrier de réservation de salles</h2>
            <div class="flex items-center gap-4">
              <div class="flex items-center space-x-2">
                <button @click="navigateCalendar('prev')" class="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeftIcon class="h-5 w-5" />
                </button>
                <span class="text-lg font-semibold">{{ currentMonthYear }}</span>
                <button @click="navigateCalendar('next')" class="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </div>
              <div class="flex space-x-2">
                <button v-for="view in calendarViews" :key="view.value" @click="currentView = view.value"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                  :class="currentView === view.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
                  {{ view.label }}
                </button>
              </div>
            </div>
          </div>
          <FullCalendar ref="fullCalendar" :options="calendarOptions" class="reservation-calendar" />
        </div>
      </div>
    </main>
  </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const activeTab = ref('calendar')
const allocationResult = ref(null)
const fullCalendar = ref(null)
const currentView = ref('timeGridWeek')
const showModal = ref(false)
const selectedEvent = ref(null)
const selectedStart = ref(null)
const selectedEnd = ref(null)
const events = ref([])

const tabs = [
  { id: 'calendar', name: 'Calendrier', },
  { id: 'reservations', name: 'Réservations', },
  { id: 'allocation', name: 'Allocation Auto', },
  { id: 'stats', name: 'Statistiques', },
]

const calendarViews = [
  { value: 'dayGridMonth', label: 'Mois' },
  { value: 'timeGridWeek', label: 'Semaine' },
  { value: 'timeGridDay', label: 'Jour' }
]

const activeTabTitle = computed(() => {
  const activeTabObj = tabs.find(tab => tab.id === activeTab.value)
  return activeTabObj ? activeTabObj.name : 'Tableau de bord'
})

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: currentView.value,
  headerToolbar: false,
  events: events.value,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: 2,
  moreLinkContent: (args) => {
    return `+ ${args.num} autres`
  },
  moreLinkClick: 'popover',
  views: {
    timeGrid: {
      dayMaxEvents: 2,
      moreLinkText: (n) => `+ ${n} autres`,
    }
  },
  weekends: true,
  slotMinTime: '07:00:00',
  slotMaxTime: '20:00:00',
  allDaySlot: false,
  slotDuration: '01:00:00',
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], // Lundi - Vendredi
    startTime: '07:00',
    endTime: '20:00',
  },
  nowIndicator: true, // Affiche une ligne indiquant l'heure actuelle
  locale: 'fr',
  firstDay: 1, // Commence la semaine le lundi
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  eventContent: renderEventContent,
  eventClassNames: 'rounded-md shadow-sm',
  height: 'auto',
  expandRows: true,
}))

const toggleSidebar = () => {
  // Implement sidebar toggle for mobile view
  console.log('Toggle sidebar')
}

function handleDateSelect(selectInfo) {
  selectedStart.value = selectInfo.start
  selectedEnd.value = selectInfo.end
  showModal.value = true
}

function handleEventClick(clickInfo) {
  const eventsInSameSlot = events.value.filter(e => {
    return e.start === clickInfo.event.start &&
      e.extendedProps.room === clickInfo.event.extendedProps.room
  });

  if (eventsInSameSlot.length > 2) {
    // Afficher une modale ou un popover avec la liste complète
    showEventDetails(eventsInSameSlot);
  } else {
    selectedEvent.value = clickInfo.event;
    showModal.value = true;
  }
}

function handleEventDrop(dropInfo) {
  updateReservation(dropInfo.event)
}

function handleEventResize(resizeInfo) {
  updateReservation(resizeInfo.event)
}

function renderEventContent(eventInfo) {
  // Regrouper les événements par salle
  const eventsInSameSlot = events.value.filter(e => {
    return e.start === eventInfo.event.start &&
      e.extendedProps.room === eventInfo.event.extendedProps.room
  });

  if (eventsInSameSlot.length > 1) {
    // Si plus de 2 événements, afficher un résumé
    return {
      html: `
          <div class="p-1 bg-blue-50 rounded-md">
            <div class="font-medium text-sm">${eventInfo.event.extendedProps.room}</div>
            <div class="text-xs">${eventsInSameSlot[0].title}</div>
            <div class="text-xs">${eventsInSameSlot[1].title}</div>
            <div class="text-xs text-blue-600 cursor-pointer">
              + ${eventsInSameSlot.length - 2} autres...
            </div>
          </div>
        `
    }
  } else {
    // Sinon afficher normalement
    return {
      html: `
          <div class="p-1 ${getEventColor(eventInfo.event.extendedProps.status)} rounded-md">
            <div class="text-xs">${eventInfo.event.title}</div>
          </div>
        `
    }
  }
}

function getEventColor(status) {
  const colors = {
    reserved: 'bg-green-100 text-green-800 border border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    canceled: 'bg-red-100 text-red-800 border border-red-200',
    default: 'bg-blue-100 text-blue-800 border border-blue-200'
  }
  return colors[status] || colors.default
}

function saveReservation(reservationData) {
  if (selectedEvent.value) {
    // Update existing event
    const index = events.value.findIndex(e => e.id === selectedEvent.value.id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...reservationData }
    }
  } else {
    // Create new event
    events.value.push({
      id: Date.now(),
      ...reservationData
    })
  }
  closeModal()
}

function deleteReservation() {
  if (selectedEvent.value && confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
    events.value = events.value.filter(e => e.id !== selectedEvent.value.id)
    closeModal()
  }
}

function updateReservation(event) {
  const index = events.value.findIndex(e => e.id === event.id)
  if (index !== -1) {
    events.value[index] = {
      ...events.value[index],
      start: event.start,
      end: event.end,
    }
  }
}

function closeModal() {
  showModal.value = false
  selectedEvent.value = null
  selectedStart.value = null
  selectedEnd.value = null
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

const editNotification = (notification) => {
  // Implement edit logic here
  console.log('Editing notification:', notification)
}

const deleteNotification = (notification) => {
  // Implement delete logic here
  console.log('Deleting notification:', notification)
}

onMounted(() => {
  // Initialize events from attributionsData
  events.value = attributionsData.value.map((attribution, index) => ({
    id: index + 1,
    title: `${attribution.entite_nom} - ${attribution.filiere_nom}`,
    start: `${attribution.date_attribution.split('T')[0]}T${attribution.heure_debut}`,
    end: `${attribution.date_attribution.split('T')[0]}T${attribution.heure_fin}`,
    extendedProps: {
      room: attribution.salle_nom,
      status: 'reserved'
    }
  }))
})

// Nouvelle fonction pour la navigation du calendrier
const navigateCalendar = (direction) => {
  const calendarApi = fullCalendar.value.getApi()
  direction === 'prev' ? calendarApi.prev() : calendarApi.next()
}

// Nouveau computed pour afficher le mois et l'année en cours
const currentMonthYear = computed(() => {
  if (!fullCalendar.value) return ''
  const calendarApi = fullCalendar.value.getApi()
  return calendarApi.view.title
})
</script>

<style>
  .reservation-calendar {
    height: calc(100vh - 200px);
    min-height: 700px;
  } 
  
  /* Personnalisation du style du calendrier */
  .fc {
    @apply font-sans;
  }
  
  .fc .fc-timegrid-slot {
    @apply h-16;
  }
  
  .fc .fc-timegrid-slot-label {
    @apply text-sm text-gray-600;
  }
  
  .fc .fc-col-header-cell {
    @apply bg-gray-50 py-3;
  }
  
  .fc .fc-col-header-cell-cushion {
    @apply font-semibold text-gray-700;
  }
  
  .fc .fc-timegrid-now-indicator-line {
    @apply border-red-500;
  }
  
  .fc .fc-timegrid-now-indicator-arrow {
    @apply border-red-500;
  }
  
  .fc .fc-event {
    @apply border-0 cursor-pointer transition-transform hover:scale-[1.02];
  }
  
  .fc .fc-highlight {
    @apply bg-blue-100 bg-opacity-50;
  }
  </style>