<script setup>
import ZaehlZahl from './ZaehlZahl.vue'
import { formatiereZahl } from '@/utils/format'

defineProps({
  item: { type: Object, required: true },
  kategorie: { type: Object, required: true },
  rolle: { type: String, required: true }, // 'links' (Wert bekannt) oder 'rechts' (wird geraten)
  vergleich: { type: String, default: '' }, // Name des linken Items
  aufgedeckt: { type: Boolean, default: false },
  ergebnis: { type: String, default: null } // null, 'richtig' oder 'falsch'
})

const emit = defineEmits(['raten'])
</script>

<template>
  <article class="karte">
    <img :src="item.bild" :alt="item.name" class="bild" />

    <div class="inhalt">
      <h2 class="name">„{{ item.name }}“</h2>

      <!-- Linke Karte: Wert ist bekannt -->
      <template v-if="rolle === 'links'">
        <p class="text">{{ kategorie.verb }}</p>
        <p class="wert">{{ formatiereZahl(item.wert) }}</p>
        <p class="text">{{ kategorie.einheit }}</p>
      </template>

      <!-- Rechte Karte: Wert wird geraten -->
      <template v-else>
        <p class="text">{{ kategorie.frageVor }}</p>

        <div v-if="!aufgedeckt" class="knoepfe">
          <button class="btn rate mehr" @click="emit('raten', 'mehr')">
            {{ kategorie.mehr }} <span>▲</span>
          </button>
          <button class="btn rate weniger" @click="emit('raten', 'weniger')">
            {{ kategorie.weniger }} <span>▼</span>
          </button>
        </div>

        <p v-else class="wert" :class="ergebnis">
          <ZaehlZahl :wert="item.wert" />
        </p>

        <p class="text">
          <template v-if="aufgedeckt">{{ kategorie.einheit }}</template>
          <template v-else>{{ kategorie.frageNach }} „{{ vergleich }}“</template>
        </p>
      </template>
    </div>
  </article>
</template>

<style scoped>
.karte {
  position: relative;
  flex: 1 1 50%;
  min-width: 0;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: var(--bg-hell);
}

.bild {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: zoom 18s ease-in-out infinite alternate;
}

@keyframes zoom {
  to {
    transform: scale(1.12);
  }
}

/* dunkler Verlauf, damit der Text gut lesbar ist */
.karte::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, rgba(5, 5, 10, 0.35), rgba(5, 5, 10, 0.75)),
    linear-gradient(to bottom, rgba(5, 5, 10, 0.5), transparent 30%);
}

.inhalt {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.6);
}

.name {
  font-size: clamp(2rem, 4.2vw, 3.6rem);
  font-weight: 800;
  max-width: 14ch;
}

.text {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-leise);
}

.wert {
  margin: 4px 0;
  font-family: var(--schrift-titel);
  font-size: clamp(2.6rem, 6vw, 5rem);
  font-weight: 800;
  color: var(--gelb);
  font-variant-numeric: tabular-nums;
  transition: color 0.3s ease, transform 0.3s ease;
}
.wert.richtig {
  color: var(--gruen);
  transform: scale(1.06);
}
.wert.falsch {
  color: var(--rot);
}

.knoepfe {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 10px 0;
}

.rate {
  min-width: 210px;
  font-size: 1.15rem;
  padding: 0.9em 1.8em;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.55);
}
.rate span {
  font-size: 0.8em;
}
.rate.mehr:hover {
  border-color: var(--gruen);
  background: rgba(46, 229, 157, 0.18);
}
.rate.weniger:hover {
  border-color: var(--rot);
  background: rgba(255, 84, 112, 0.18);
}

@media (max-width: 700px) {
  .inhalt {
    gap: 4px;
    padding: 16px;
  }
  .name {
    font-size: 1.8rem;
  }
  .text {
    font-size: 0.95rem;
  }
  .wert {
    font-size: 2.4rem;
  }
  .knoepfe {
    flex-direction: row;
    margin: 6px 0;
  }
  .rate {
    min-width: 0;
    font-size: 1rem;
    padding: 0.75em 1.3em;
  }
}
</style>
