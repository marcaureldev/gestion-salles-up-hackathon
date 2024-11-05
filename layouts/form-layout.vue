<template>
    <div class="flex justify-between h-screen">
        <div class="bg-formPicture bg-left-top bg-no-repeat picture-size w-1/2 p-5">
            <NuxtLink to="/">
                <h1 class="text-3xl bg-custom-gradient font-bold bg-clip-text text-transparent">Unispace</h1>
            </NuxtLink>
            <slot></slot>
        </div>

        <div class="bg-custom-gradient w-1/2 p-5 flex justify-center items-center">
            <h2 class="text-4xl text-center font-semibold text-white leading-relaxed w-[20em]">
                Bienvenue sur Unispace !
                La solution qui facilite vos activités académiques avec une gestion optimisée des salles de cours.
            </h2>
        </div>
    </div>
</template>

<style>
.picture-size {
    background-size: 50%;
}
</style>