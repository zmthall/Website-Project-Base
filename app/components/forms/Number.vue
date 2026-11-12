<script setup lang="ts">
const model = defineModel<string | number>({ default: '' });
</script>
<template><FormsInput v-model="model" type="number" /></template>
