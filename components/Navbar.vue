<template>
  <div class="sticky z-30 top-0 bg-white border-b-2">
    <div class="flex justify-between items-center max-w-screen-xl mx-auto xl:max-w-full p-3 md:px-8 md:py-3">
      <div class="flex space-x-2 items-center">
        <h1 class="text-xl bg-custom-gradient font-bold text-center bg-clip-text text-transparent">Unispace</h1>
      </div>
      <NuxtLink to="">
        <div class="flex space-x-2 items-center bg-gray-lighter p-3 rounded-2xl">
          <AvatarUserIcon class="size-6 text-gradient1" />
          <p class="text-sm hidden md:block">Username</p>
        </div>
      </NuxtLink>
    </div>

    <div
      class="lg:hidden lg:stactic absolute w-full md:w-1/2 p-5 border-2 h-screen bg-white left-0 z-30 duration-500 lg:duration-0 ease-in-out"
      :class="[open ? 'left-0' : 'left-[-100%]']">
      <AsideBarMenu />
      <!-- <img v-if="open" src="/icons/close-icon.svg" alt="Close Icon"
        class="absolute z-50 top-6 size-5 cursor-pointer right-4" @click="menuOpen" /> -->
    </div>
  </div>
</template>

<script setup>
const open = ref(false);

const menuOpen = () => {
  open.value = !open.value;
};
</script>

<style></style>
