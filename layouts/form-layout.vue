<template>
    <div class="flex justify-between h-screen">
        <div class="bg-formPicture bg-left-top bg-no-repeat picture-size w-1/2 p-5">
            <h1 class="text-xl bg-custom-gradient font-bold bg-clip-text text-transparent">Unispace</h1>

            <slot></slot>
        </div>

        <div class="bg-custom-gradient w-1/2 p-5 flex justify-center items-center">
            <h2 class="text-xl text-white font-medium leading-relaxed text-justify w-[20em]">
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