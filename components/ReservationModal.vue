<template>
    <div class="overlay bg-black/30 fixed inset-0 z-4"></div>
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="my-modal"  @click="$emit('close')">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
            <div class="mt-3 text-center">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {{ modalTitle }}
                </h3>
                <form @submit.prevent="handleSubmit" class="mt-2 text-left">
                    <div class="mb-4">
                        <label for="event_type" class="block text-sm font-medium text-gray-700">Type d'évènement</label>
                        <select id="event_type" v-model="form.event_type" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="course">Cours</option>
                            <option value="exam">Examen</option>
                            <option value="thesis">Soutenance</option>
                            <option value="colloc">Collocs Scientifiques</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-medium text-gray-700">Nom de la matière</label>
                        <input type="text" id="name" v-model="form.name" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div class="mb-4">
                        <label for="start" class="block text-sm font-medium text-gray-700">Date et heure de
                            début</label>
                        <input type="datetime-local" id="start" v-model="form.start" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div class="mb-4">
                        <label for="end" class="block text-sm font-medium text-gray-700">Date et heure de fin</label>
                        <input type="datetime-local" id="end" v-model="form.end" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <!-- <div class="mb-4">
                        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" v-model="form.description" rows="3"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div> -->
                    <!-- <div class="mb-4">
                        <label for="status" class="block text-sm font-medium text-gray-700">Statut</label>
                        <select id="status" v-model="form.status" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="reserved">Réservé</option>
                            <option value="pending">En attente</option>
                            <option value="canceled">Annulé</option>
                        </select>
                    </div> -->
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
    event_type: "",
    name: "",
    start: "",
    end: "",
});

const modalTitle = computed(() =>
    props.event ? "Modifier la réservation" : "Créer une réservation"
);

watch(
    () => props.event,
    (newEvent) => {
        if (newEvent) {
            form.value = {
                event_type: newEvent.extendedProps.events,
                name: newEvent.name,
                start: formatDate(newEvent.start),
                end: formatDate(newEvent.end),
            };
        } else {
            form.value = {
                event_type: "course",
                name: "",
                start: formatDate(props.start),
                end: formatDate(props.end),
            };
        }
    },
    { immediate: true }
);

function formatDate(date) {
    return date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : "";
}

function handleSubmit() {
    emit("save", {
        ...form.value,
        start: new Date(form.value.start),
        end: new Date(form.value.end),
    });
}
</script>