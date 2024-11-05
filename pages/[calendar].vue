<template>
  <div class="">
    <div class="mx-auto bg-white rounded-lg overflow-hidden">
      <div class="p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Calendrier des emplois du temps - {{ fil }}</h1>
        <div class="flex space-x-4 mb-6">
          <!-- <button v-for="view in views" :key="view.value" @click="currentView = view.value"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
            :class="currentView === view.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
            {{ view.label }}
          </button> -->
          <button 
            @click="sendScheduleRequest"
            class="px-6 py-2 rounded-md text-sm font-semibold text-white bg-custom-gradient hover:opacity-90 transition-opacity duration-150 ml-auto">
            Envoyer la demande
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

definePageMeta({
    layout: 'user-layout',
})


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
  const effectif = eventInfo.event.extendedProps.effectif || 30

  return {
    html: `
         <div class="p-2 rounded-r-lg shadow-sm ${getEventColor(eventInfo.event.extendedProps.eventType)}">
           <div class="font-bold text-xs">${eventInfo.event.title}</div>
           <div class="text-xs">Effectif: ${effectif}</div>
           <div class="text-xs">${formatTime(eventInfo.event.start)} - ${formatTime(eventInfo.event.end)}</div>
        </div>
     `
  }
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
    case 'colloque':
      return 'bg-indigo-100 text-indigo-800 border-l-4 border-indigo-500'; // Violet pour les colloques
    case 'examen':
      return 'bg-rose-100 text-rose-800 border-l-4 border-rose-500';      // Rouge rosé pour les examens
    case 'soutenance':
      return 'bg-amber-100 text-amber-800 border-l-4 border-amber-500';   // Ambre pour les soutenances
    case 'cours':
      return 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500'; // Vert émeraude pour les cours
    default:
      return 'bg-slate-100 text-slate-800 border-l-4 border-slate-500';   // Gris pour les autres
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
        title: reservationData.courseName,
        start: reservationData.start,
        end: reservationData.end,
        extendedProps: {
          eventType: reservationData.eventType,
          courseName: reservationData.courseName,
          effectif: reservationData.effectif
        }
      }
    }
  } else {
    // Create new event
    events.value.push({
      id: Date.now(),
      title: reservationData.courseName,
      start: reservationData.start,
      end: reservationData.end,
      extendedProps: {
        eventType: reservationData.eventType,
        courseName: reservationData.courseName,
        effectif: reservationData.effectif
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

function getPriority(eventType) {
  switch (eventType) {
    case 'colloques':
      return 1; // Priorité la plus haute
    case 'examens':
      return 2;
    case 'soutenances':
      return 3;
    case 'cours':
      return 4; // Priorité la plus basse
    default:
      return 5; // Pour tout autre type d'événement
  }
}

async function sendScheduleRequest() {
  try {
    if (events.value.length === 0) {
      alert('Veuillez d\'abord ajouter des événements au calendrier');
      return;
    }

    for (const event of events.value) {
      const startTime = event.start.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const endTime = event.end.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const requestData = {
        nom: event.extendedProps.courseName,
        effectif: event.extendedProps.effectif || 30,
        anne_etude: "2023-2024",
        filiere: fil.value,
        heure_debut: startTime,
        heure_fin: endTime,
        priorite: getPriority(event.extendedProps.eventType)
      };

      console.log('Données envoyées:', requestData); // Pour le débogage

      const response = await fetch('https://api-gestion-salle.onrender.com/gestion/add-filiere', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur lors de l'envoi: ${JSON.stringify(errorData)}`);
      }
    }
    alert('Demande envoyée avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error);
    alert(`Une erreur est survenue lors de l'envoi de la demande: ${error.message}`);
  }
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