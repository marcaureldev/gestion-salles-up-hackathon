<template>
  <div class="bg-white shadow-xl rounded-lg overflow-hidden">
    <div class="p-4 border-b">
      <h2 class="text-xl font-semibold text-gray-800">
        Statistiques et rapports
      </h2>
    </div>
    <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Taux d'occupation des salles
          </h3>
          <div
            class="h-64 bg-gray-100 rounded-lg flex items-center justify-center"
          >
            <!-- Implement chart component here -->

            <p class="text-gray-500">Graphique d'occupation</p>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Réservations par jour
          </h3>
          <div
            class="h-64 bg-gray-100 rounded-lg flex items-center justify-center"
          >
            <!-- Implement chart component here -->
            <p class="text-gray-500">Graphique de réservations</p>
          </div>
        </div>
      </div>
      <div class="mt-6">
        <button
          @click="$emit('generate-report')"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          Générer un rapport
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(["generate-report"]);
</script>
