<script setup lang="ts">
import { websiteUI } from '../../theme/config';
import { themes, buttonPacks, navigationPacks, footerPacks } from '../../theme/registry';
const config = useWebsiteUI();
const message = ref('');
const paletteLabels = {
  primary: 'Primary',
  secondary: 'Secondary',
  contrast: 'Contrast',
  complementary: 'Complementary',
};
function reset() {
  config.value = structuredClone(websiteUI);
  message.value = 'Preview reset.';
}
async function exportConfig() {
  const text = JSON.stringify(config.value, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    message.value = 'Configuration copied. Paste it into app/theme/config.ts.';
  } catch {
    message.value = 'Copy the JSON from the panel below.';
  }
}
</script>
<template>
  <div class="stack">
    <div class="grid grid-2">
      <label class="field">
        Theme
        <select v-model="config.theme" class="input">
          <option v-for="(theme, id) in themes" :key="id" :value="id">{{ theme.label }}</option>
        </select>
      </label>
      <label class="field">
        Color mode policy
        <select v-model="config.mode" class="input">
          <option value="light">Light only</option>
          <option value="dark">Dark only</option>
          <option value="user">Visitor controlled</option>
        </select>
      </label>
    </div>
    <fieldset>
      <legend class="label" style="margin-bottom: 1rem">Four-color brand palette</legend>
      <div class="swatches">
        <label v-for="(label, key) in paletteLabels" :key="key" class="field">
          {{ label }}
          <input v-model="config.palette[key]" type="color" :aria-label="`${label} color`" />
          <span class="help">{{ config.palette[key] }}</span>
        </label>
      </div>
    </fieldset>
    <div class="grid grid-3">
      <label class="field">
        Button pack
        <select v-model="config.packs.buttons.variant" class="input">
          <option v-for="pack in buttonPacks" :key="pack">{{ pack }}</option>
        </select>
      </label>
      <label class="field">
        Button shape
        <select v-model="config.packs.buttons.shape" class="input">
          <option value="square">Square</option>
          <option value="soft">Medium rounded</option>
          <option value="round">Rounded</option>
        </select>
      </label>
      <label class="field">
        Navigation pack
        <select v-model="config.packs.navigation" class="input">
          <option v-for="pack in navigationPacks" :key="pack">{{ pack }}</option>
        </select>
      </label>
      <label class="field">
        Footer pack
        <select v-model="config.packs.footer" class="input">
          <option v-for="pack in footerPacks" :key="pack">{{ pack }}</option>
        </select>
      </label>
      <label class="field">
        Heading font
        <select v-model="config.fonts.headings" class="input">
          <option value="sans">Sans serif</option>
          <option value="serif">Serif</option>
        </select>
      </label>
      <label class="field">
        Sans serif font
        <select v-model="config.fonts.sans.family" class="input">
          <option>Arial, Helvetica, sans-serif</option>
          <option>Verdana, Geneva, sans-serif</option>
          <option>Trebuchet MS, sans-serif</option>
        </select>
      </label>
    </div>
    <div class="cluster">
      <FormsSwitch v-model="config.packs.buttons.beveled" label="Beveled buttons" />
      <FormsSwitch v-model="config.motion" label="Animated page transitions" />
    </div>
    <div class="cluster">
      <BaseButton @click="exportConfig">
        Copy configuration
        <BaseIcon name="download" />
      </BaseButton>
      <BaseButton variant="outline" @click="reset">Reset preview</BaseButton>
    </div>
    <p class="help">
      Preview changes apply across this browsing session. They do not update the configuration file
      or other visitors.
    </p>
    <p role="status" class="help">{{ message }}</p>
    <details>
      <summary>Configuration JSON</summary>
      <pre style="max-height: 24rem; overflow: auto; font-size: 0.8rem">{{
        JSON.stringify(config, null, 2)
      }}</pre>
    </details>
  </div>
</template>
