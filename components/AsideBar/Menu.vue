<template>
  <div class="space-y-3">
    <div class="px-4 grow space-y-5">
      <div class="grid gap-5">
        <NuxtLink v-for="(item, index) in items" :key="index" :to="item.path" :class="[
          'flex items-center gap-2 pr-6 p-2  mr-2 transition rounded-md cursor-pointer w-48 lg:w-full',
          $route.path === item.path
            ? 'bg-custom-gradient text-white'
            : 'text-black',
        ]">
          <img :src="$route.path === item.path ? item.iconWhite : item.icon" alt="" class="w-6" />
          <span>{{ item.title }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const items = ref([
  {
    title: "Filières",
    path: "/filiere",
  },
  {
    title: "Attributions",
    path: "/user-attributions",
  },
  {
    title: "Profile",
    path: "",
  },
]);
</script>

<style scoped></style>
