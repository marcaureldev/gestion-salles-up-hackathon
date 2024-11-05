<template>
  <div class="">
    <div class="max-w-7xl mx-auto bg-white rounded-lg overflow-hidden">
      <div class="p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Calendrier des emplois du temps - {{ fil }}</h1>
        <div class="flex space-x-4 mb-6">
          <button v-for="view in views" :key="view.value" @click="currentView = view.value"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
            :class="currentView === view.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
            {{ view.label }}
          </button>
        </div>
        <ClientOnly >
          <FullCalendar ref="fullCalendar" :options="calendarOptions" class="reservation-calendar" />
        </ClientOnly>
      </div>
    </div>
    <ReservationModal v-if="showModal" :event="selectedEvent" :start="selectedStart" :end="selectedEnd"
      @close="closeModal" @save="saveReservation" @delete="deleteReservation" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRoute } from 'vue-router';  // Pour accéder au paramètre de la route

const route = useRoute();
const fil = ref(route.params.calendar);

const fullCalendar = ref(null)
const currentView = ref('timeGridWeek')
const views = [
  { value: 'dayGridMonth', label: 'Mois' },
  { value: 'timeGridWeek', label: 'Semaine' },
  { value: 'timeGridDay', label: 'Jour' }
]
const showModal = ref(false)
const selectedEvent = ref(null)
const selectedStart = ref(null)
const selectedEnd = ref(null)
const events = ref([])

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: currentView.value,
  headerToolbar: false,
  events: events.value,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  allDaySlot: false,
  expandRows: true,
  slotMinTime: "07:00",
  slotMaxTime: "20:00",
  hiddenDays: [0],
  slotDuration: "01:00",
  locale: "fr",
  slotLabelFormat: {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: false,
    meridiem: 'short',
  },
  dayHeaderFormat: { weekday: "long" },
  timeZone: 'local',
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  eventContent: renderEventContent,
}))

function handleDateSelect(selectInfo) {
  selectedStart.value = selectInfo.start
  selectedEnd.value = selectInfo.end
  showModal.value = true
}

function handleEventClick(clickInfo) {
  selectedEvent.value = clickInfo.event
  selectedStart.value = clickInfo.event.start
  selectedEnd.value = clickInfo.event.end
  showModal.value = true
}

function handleEventDrop(dropInfo) {
  updateReservation(dropInfo.event)
}

function handleEventResize(resizeInfo) {
  updateReservation(resizeInfo.event)
}

function renderEventContent(eventInfo) {
  const eventType = eventInfo.event.extendedProps.eventType
  const courseNameLabel = getCourseLabelByEventType(eventType)

  return {
    html: `
         <div class="p-2 ${getEventColor(eventInfo.event.extendedProps.eventType)}">
           <div class="font-bold">${eventInfo.event.title}</div>
           <div>${eventInfo.event.extendedProps.eventType} - ${eventInfo.event.extendedProps.courseName}</div>
          <div>${formatTime(eventInfo.event.start)} - ${formatTime(eventInfo.event.end)}</div>
        </div>
     `  }
}

function getCourseLabelByEventType(eventType) {
  switch (eventType) {
    case 'colloques': return 'Nom du colloque'
    case 'examens': return 'Nom de l\'examen'
    case 'soutenances': return 'Thème de la soutenance'
    case 'cours':
    default: return 'Nom du cours'
  }
}

function getEventColor(eventType) {
  switch (eventType) {
    case 'colloques': return 'bg-blue-200 text-blue-800'
    case 'examens': return 'bg-red-200 text-red-800'
    case 'cours': return 'bg-green-200 text-green-800'
    case 'soutenances': return 'bg-yellow-200 text-yellow-800'
    default: return 'bg-gray-200 text-gray-800'
  }
}

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function saveReservation(reservationData) {
  if (selectedEvent.value) {
    // Update existing event
    const index = events.value.findIndex(e => e.id === selectedEvent.value.id)
    if (index !== -1) {
      events.value[index] = {
        ...events.value[index],
        ...reservationData,
        extendedProps: {
          ...events.value[index].extendedProps,
          eventType: reservationData.eventType,
          courseName: reservationData.courseName
        }
      }
    }
  } else {
    // Create new event
    events.value.push({
      id: Date.now(),
      ...reservationData,
      extendedProps: {
        eventType: reservationData.eventType,
        courseName: reservationData.courseName
      }
    })
  }
  closeModal()
  if (fullCalendar.value) {
    fullCalendar.value.getApi().refetchEvents()
  }
}

function deleteReservation() {
  if (selectedEvent.value && confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
    events.value = events.value.filter(e => e.id !== selectedEvent.value.id)
    closeModal()
    if (fullCalendar.value) {
      fullCalendar.value.getApi().refetchEvents()
    }
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
    if (fullCalendar.value) {
      fullCalendar.value.getApi().refetchEvents()
    }
  }
}

function closeModal() {
  showModal.value = false
  selectedEvent.value = null
  selectedStart.value = null
  selectedEnd.value = null
}

onMounted(() => {
  // Aucun événement de test n'est ajouté ici
})
</script>

<style scoped>
.reservation-calendar {
  height: 800px;
}
</style>