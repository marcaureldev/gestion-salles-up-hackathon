<script setup lang="ts">
definePageMeta({
    layout: "form-layout",
});
</script>

<template>
    <div class="flex flex-col justify-center items-center h-[90vh]">
        <h1 class="text-center text-xl font-bold bg-custom-gradient bg-clip-text text-transparent">
            Créer un compte
        </h1>
        <form action="" class="p-5 text-sm">
            <div class="max-w-md mx-auto">
                <input
                    class="w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 focus:outline-none focus:bg-white"
                    type="text" placeholder="Entité Universitaire" />
                <input
                    class="w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 focus:outline-none focus:bg-white mt-5"
                    type="email" placeholder="Adresse Email" />

                <input
                    class="w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 focus:outline-none focus:bg-white mt-5"
                    type="password" placeholder="Mot de passe" />

                <input
                    class="w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 focus:outline-none focus:bg-white mt-5"
                    type="password" placeholder="Confirmer le mot de passe" />


                <NuxtLink to="/filiere">
                    <button
                        class="mt-5 font-semibold bg-custom-gradient text-white w-full py-3 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 -ml-1" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <path d="M20 8v6M23 11h-6" />
                        </svg>
                        <span class="ml-3">Inscrivez-vous</span>
                    </button>
                </NuxtLink>
            </div>
        </form>
    </div>
</template>
