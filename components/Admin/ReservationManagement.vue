<template>
  <div class="bg-white shadow-xl rounded-lg overflow-hidden">
    <div class="p-4 border-b">
      <h2 class="text-xl font-semibold text-gray-800">
        Notifications des réservations
      </h2>
    </div>
    <div class="p-4">
      <div class="mb-4">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher une notification..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="space-y-4">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="p-4 border rounded-lg hover:bg-gray-50"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-900">{{ notification.entite_nom }} - {{ notification.filiere_nom }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                Créneau : {{ notification.heure_debut }} - {{ notification.heure_fin }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                Date de réservation : {{ formatDate(notification.date_attribution) }}
              </p>
            </div>
            <!-- <div class="flex space-x-2">
              <button
                @click="$emit('edit', notification)"
                class="text-indigo-600 hover:text-indigo-900 text-sm"
              >
                Modifier
              </button>
              <button
                @click="$emit('delete', notification)"
                class="text-red-600 hover:text-red-900 text-sm"
              >
                Supprimer
              </button>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["edit", "delete"]);
const searchTerm = ref("");

const filteredNotifications = computed(() => {
  return props.notifications.filter((notification) =>
    notification.filiere_nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    notification.entite_nom.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};
</script>
