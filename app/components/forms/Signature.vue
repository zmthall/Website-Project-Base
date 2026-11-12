<script setup lang="ts">
// TODO [FORMS-02]: If signatures become functional, define authenticated document binding, version/evidence retention and accessible alternatives; this preview alone is not an e-signature service. See docs/integration-audit.md.

const model = defineModel<string>({ default: '' });
const mode = ref<'type' | 'draw'>('type');
const typed = ref('');
const canvas = ref<HTMLCanvasElement>();
let drawing = false;
function point(event: PointerEvent) {
  const rect = canvas.value!.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * 800) / rect.width,
    y: ((event.clientY - rect.top) * 240) / rect.height,
  };
}
function start(event: PointerEvent) {
  if (!canvas.value) return;
  drawing = true;
  canvas.value.setPointerCapture(event.pointerId);
  const context = canvas.value.getContext('2d')!;
  const p = point(event);
  context.beginPath();
  context.moveTo(p.x, p.y);
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.strokeStyle = '#202923';
}
function move(event: PointerEvent) {
  if (!drawing) return;
  const p = point(event);
  const context = canvas.value!.getContext('2d')!;
  context.lineTo(p.x, p.y);
  context.stroke();
}
function finish() {
  if (!drawing) return;
  drawing = false;
  model.value = canvas.value!.toDataURL('image/png');
}
function clear() {
  canvas.value?.getContext('2d')?.clearRect(0, 0, 800, 240);
  model.value = '';
  typed.value = '';
}
watch(mode, clear);
watch(typed, (value) => {
  if (mode.value === 'type') model.value = value;
});
</script>
<template>
  <fieldset class="stack">
    <legend class="label">Signature</legend>
    <label class="field">
      Signature method
      <select v-model="mode" class="input">
        <option value="type">Type your name (keyboard accessible)</option>
        <option value="draw">Draw with a mouse or touch</option>
      </select>
    </label>
    <label v-if="mode === 'type'" class="field">
      Full name
      <input v-model="typed" class="input" autocomplete="name" />
    </label>
    <div v-else>
      <p class="help">Draw below, or choose “Type your name” above.</p>
      <canvas
        ref="canvas"
        width="800"
        height="240"
        style="
          width: 100%;
          height: 10rem;
          background: white;
          border: 1px solid var(--line);
          touch-action: none;
        "
        aria-label="Signature drawing area. A typed alternative is available above."
        @pointerdown="start"
        @pointermove="move"
        @pointerup="finish"
        @pointercancel="finish"
      />
    </div>
    <div
      v-if="model && mode === 'type'"
      class="card"
      style="font-family: var(--font-editorial); font-style: italic; font-size: 2rem"
      aria-label="Signature preview"
    >
      {{ model }}
    </div>
    <BaseButton variant="outline" :disabled="!model" @click="clear">Clear signature</BaseButton>
    <p class="help">
      Signature preview only. No data is stored or submitted. This control does not determine legal
      validity.
    </p>
  </fieldset>
</template>
