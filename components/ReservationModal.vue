<template>
  <div class="overlay bg-black/30 fixed inset-0 z-4"></div>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="my-modal" @click="$emit('close')">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ modalTitle }}
        </h3>
        <form @submit.prevent="handleSubmit" class="mt-2 text-left">
          <div class="mb-4">
            <label for="eventType" class="block text-sm font-medium text-gray-700">Type d'événement</label>
            <select id="eventType" v-model="form.eventType" required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="cours">Cours</option>
              <option value="examen">Examens</option>
              <option value="soutenance">Soutenances</option>
              <option value="colloque">Colloques scientifiques</option>
            </select>
          </div>
          <div class="mb-4">
            <label :for="courseNameId" class="block text-sm font-medium text-gray-700">{{ courseNameLabel }}</label>
            <input type="text" :id="courseNameId" v-model="form.courseName" required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div class="mb-4">
            <label for="start" class="block text-sm font-medium text-gray-700">Date et heure de début</label>
            <input type="datetime-local" id="start" v-model="form.start" required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div class="mb-4">
            <label for="end" class="block text-sm font-medium text-gray-700">Date et heure de fin</label>
            <input type="datetime-local" id="end" v-model="form.end" required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="$emit('close')"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              Annuler
            </button>
            <button type="submit"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {{ event ? "Mettre à jour" : "Créer" }}
            </button>
            <button v-if="event" type="button" @click="$emit('delete')"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Supprimer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  event: Object,
  start: Date,
  end: Date,
});

const emit = defineEmits(["close", "save", "delete"]);

const form = ref({
  eventType: "",
  courseName: "",
  title: "",
  start: "",
  end: "",
});

const modalTitle = computed(() =>
  props.event ? "Modifier l'emploi du temps" : "Créer l'emploi du temps"
);

const courseNameLabel = computed(() => {
  switch (form.value.eventType) {
    case 'colloque': return 'Nom du colloque'
    case 'examen': return 'Nom de l\'examen'
    case 'soutenance': return 'Thème de la soutenance'
    case 'cours':
    default: return 'Nom du cours'
  }
});

const courseNameId = computed(() => {
  return form.value.eventType + 'Name'
});

watch(
  () => props.event,
  (newEvent) => {
    if (newEvent) {
      form.value = {
        eventType: newEvent.extendedProps.eventType,
        courseName: newEvent.extendedProps.courseName,
        start: formatDate(newEvent.start),
        end: formatDate(newEvent.end),
      };
    } else {
      form.value = {
        eventType: "cours",
        courseName: "",
        start: formatDate(props.start),
        end: formatDate(props.end),
      };
    }
  },
  { immediate: true }
);

function formatDate(date) {
  return date ? new Date(date).toISOString().slice(0, 16) : "";
}

function handleSubmit() {
  emit("save", {
    ...form.value,
    start: new Date(form.value.start),
    end: new Date(form.value.end),
  });
}
</script>