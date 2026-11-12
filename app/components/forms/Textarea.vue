<script setup lang="ts">
const model = defineModel<string>({ default: '' });
const element = ref<HTMLTextAreaElement>();
defineExpose({ element });
</script>
<template><textarea ref="element" v-model="model" class="input" /></template>
