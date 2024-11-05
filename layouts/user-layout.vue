<template>
    <div class="font-inter">
        <Navbar />
        <div class="max-w-screen-xl xl:max-w-full mx-auto grid lg:ml-64 lg:flex items-start">
            <div>
                <AsideBar />
            </div>
            <div class="w-full overflow-hidden">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup>
useHead({
    title: "Unispace",
});
</script>

<style></style>