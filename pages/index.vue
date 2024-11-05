<template>
    <div class="bg-upbj bg-center bg-no-repeat bg-cover h-screen">
        <div class="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-white">
            <h1 class="text-5xl mb-8">Bienvenue sur Unispace !</h1>
            <div class="space-x-4">
                <NuxtLink to="/sign-up"
                    class="px-6 py-2 border border-white text-white rounded hover:bg-white hover:text-black transition duration-300">
                    S'inscrire
                </NuxtLink>
                <NuxtLink to="/login"
                    class="px-6 py-2 border border-white text-white rounded hover:bg-white hover:text-black transition duration-300">
                    Se connecter
                </NuxtLink>
            </div>
        </div>
    </div>
</template>