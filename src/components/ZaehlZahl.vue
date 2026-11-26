<script setup>
import { ref, onMounted } from 'vue'
import { formatiereZahl } from '@/utils/format'

// Zählt beim Erscheinen von 0 bis "wert" hoch
const props = defineProps({
  wert: { type: Number, required: true },
  dauer: { type: Number, default: 900 }
})

const anzeige = ref(0)

onMounted(() => {
  const start = performance.now()

  function schritt(jetzt) {
    const fortschritt = Math.min((jetzt - start) / props.dauer, 1)
    const weich = 1 - Math.pow(1 - fortschritt, 3) // langsam auslaufen lassen
    anzeige.value = props.wert * weich
    if (fortschritt < 1) requestAnimationFrame(schritt)
  }
  requestAnimationFrame(schritt)
})
</script>

<template>
  <span>{{ formatiereZahl(anzeige, wert) }}</span>
</template>
