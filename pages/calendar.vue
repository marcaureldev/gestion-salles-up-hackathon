<template>
    <div class="min-h-screen p-4">
        <div class="max-w-7xl mx-auto bg-white rounded-lg overflow-hidden">
            <div class="p-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-6">Calendrier des emplois du temps de chaque filière</h1>
                <div class="flex space-x-4 mb-6">
                    <button v-for="view in views" :key="view.value" @click="currentView = view.value"
                        class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                        :class="currentView === view.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
                        {{ view.label }}
                    </button>
                </div>
                <FullCalendar ref="fullCalendar" :options="calendarOptions" class="reservation-calendar" />
            </div>
        </div>
        <ReservationModal v-if="showModal" :event="selectedEvent" :start="selectedStart" :end="selectedEnd"
            @close="closeModal" @save="saveReservation" @delete="deleteReservation" />
    </div>
</template>

<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

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
    showModal.value = true
}

function handleEventDrop(dropInfo) {
    updateReservation(dropInfo.event)
}

function handleEventResize(resizeInfo) {
    updateReservation(resizeInfo.event)
}

function renderEventContent(eventInfo) {
    return {
        html: `
        <div class="p-2 ${getEventColor(eventInfo.event.extendedProps.status)}">
          <div class="font-bold">${eventInfo.event.name}</div>
          <div>${eventInfo.event.extendedProps.event_type}</div>
        </div>
      `
    }
}

function getEventColor(status) {
    switch (status) {
        case 'reserved': return 'bg-green-200 text-green-800'
        case 'pending': return 'bg-yellow-200 text-yellow-800'
        case 'canceled': return 'bg-red-200 text-red-800'
        default: return 'bg-blue-200 text-blue-800'
    }
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

onMounted(() => {
    // Vous pouvez ajouter ici des événements de test si nécessaire
    events.value = [
        {
            id: 1,
            title: 'Réunion équipe',
            start: new Date(2024, 11, 15, 10, 0),
            end: new Date(2024, 11, 16, 12, 0),
            extendedProps: {
                room: 'Salle A',
                status: 'reserved'
            }
        },
        // Ajoutez d'autres événements de test ici
    ]
})
</script>

<style scoped>
.reservation-calendar {
    height: 800px;
}
</style>