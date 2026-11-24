import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  css: [fileURLToPath(new URL('./app/assets/css/careers.css', import.meta.url))],
});
