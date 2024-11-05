9<template>
    <div class="flex flex-col justify-center items-center h-[90vh]">
        <h1 class="text-center text-xl font-bold bg-custom-gradient bg-clip-text text-transparent">
            Se connecter
        </h1>
        <form action="" class="p-5 text-sm">
            <div class="max-w-md mx-auto">
                <input
                    class="w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 focus:outline-none focus:bg-white"
                    type="text" placeholder="Votre adresse email" />

                <input
                    class="w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 focus:outline-none focus:bg-white mt-5"
                    type="password" placeholder="Mot de passe" />

                <button
                    class="mt-5 font-semibold bg-custom-gradient text-white w-full py-3 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M9 2h9c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2v-2h2v2h9V4H9v2H7V4c0-1.1.9-2 2-2" />
                        <path fill="currentColor" d="M10.09 15.59L11.5 17l5-5l-5-5l-1.41 1.41L12.67 11H3v2h9.67z" />
                    </svg>
                    <span class="ml-3">Connectez-vous</span>
                </button>
            </div>
            <div class="pt-4">
                <div class=" pt-3 text-xs  bg-custom-gradient bg-clip-text text-transparent ">
                    <a href="#" class="hover:underline">Forgot Password?</a>
                </div>

                    <div class="flex gap-4  ">
                        <p class=" pt-3 text-xs">vous n'avez pas  de compte ?</p>
                        <div class=" pt-3 text-xs  bg-custom-gradient bg-clip-text text-transparent">
                         <a href="#" class="hover:underline">Inscrivez-vous</a>
                        </div>
                    </div>
            </div>

        </form>

    </div>
</template>

<script setup>
definePageMeta({
    layout: 'form-layout'
})
</script>