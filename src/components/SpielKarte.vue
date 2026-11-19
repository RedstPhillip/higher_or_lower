<script setup>
defineProps({
  item: { type: Object, required: true },
  kategorie: { type: Object, required: true },
  rolle: { type: String, required: true }, // 'links' oder 'rechts'
  vergleich: { type: String, default: '' },
  aufgedeckt: { type: Boolean, default: false }
})

const emit = defineEmits(['raten'])
</script>

<template>
  <article class="karte" :style="{ backgroundImage: `url(${item.bild})` }">
    <div class="inhalt">
      <h2>{{ item.name }}</h2>

      <template v-if="rolle === 'links' || aufgedeckt">
        <p>{{ kategorie.verb }}</p>
        <p class="wert">{{ item.wert }}</p>
        <p>{{ kategorie.einheit }}</p>
      </template>

      <template v-else>
        <p>{{ kategorie.frageVor }}</p>
        <button @click="emit('raten', 'mehr')">{{ kategorie.mehr }}</button>
        <button @click="emit('raten', 'weniger')">{{ kategorie.weniger }}</button>
        <p>{{ kategorie.frageNach }} {{ vergleich }}</p>
      </template>
    </div>
  </article>
</template>

<style scoped>
.karte {
  flex: 1;
  display: grid;
  place-items: center;
  background-size: cover;
  background-position: center;
}

.inhalt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.6);
  text-align: center;
}

h2 {
  margin: 0;
  font-size: 2.2rem;
}

p {
  margin: 0;
}

.wert {
  font-size: 3rem;
  font-weight: 800;
  color: #ffd23f;
}

button {
  min-width: 160px;
  padding: 10px 20px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: transparent;
  color: #fff;
}

button:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
