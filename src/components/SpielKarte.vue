<script setup>
import { ref } from 'vue'
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

// Bild erst einblenden, wenn es fertig geladen ist
const geladen = ref(false)
</script>

<template>
  <article class="karte" :class="[rolle, rolle === 'rechts' ? ergebnis : null]">
    <img
      :src="item.bild"
      :alt="item.name"
      class="bild"
      :class="{ geladen }"
      @load="geladen = true"
    />

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
  min-height: 0;
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
  opacity: 0;
  transform: scale(1.08);
  transition: opacity 0.6s ease, transform 1.2s ease;
}
.bild.geladen {
  opacity: 1;
  transform: scale(1);
  animation: zoom 18s 1.2s ease-in-out infinite alternate;
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
    radial-gradient(ellipse at center, rgba(5, 5, 10, 0.3), rgba(5, 5, 10, 0.78)),
    linear-gradient(to bottom, rgba(5, 5, 10, 0.55), transparent 30%);
}

/* farbiges Leuchten bei richtig / falsch */
.karte::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.karte.richtig::before {
  opacity: 1;
  background: radial-gradient(circle at center, rgba(46, 229, 157, 0.35), transparent 70%);
  box-shadow: inset 0 0 0 4px rgba(46, 229, 157, 0.6);
}
.karte.falsch::before {
  opacity: 1;
  background: radial-gradient(circle at center, rgba(255, 84, 112, 0.35), transparent 70%);
  box-shadow: inset 0 0 0 4px rgba(255, 84, 112, 0.6);
}

.inhalt {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(4px, 1.3vh, 12px);
  padding: clamp(16px, 3vw, 40px);
  text-align: center;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.6);
}

/* Schriftgrößen wachsen mit Breite UND Höhe des Bildschirms (das Kleinere zählt) */
.name {
  font-size: clamp(1.5rem, min(4.2vw, 7.5vh), 4.4rem);
  font-weight: 800;
  max-width: 14ch;
  text-wrap: balance;
}

.text {
  margin: 0;
  font-size: clamp(0.9rem, min(1.35vw, 2.5vh), 1.35rem);
  color: var(--text-leise);
}

.wert {
  margin: 0.1em 0;
  font-family: var(--schrift-titel);
  font-size: clamp(2rem, min(6.2vw, 11vh), 6.2rem);
  font-weight: 800;
  line-height: 1;
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
  gap: clamp(8px, 1.4vh, 14px);
  margin: clamp(4px, 1vh, 12px) 0;
}

.rate {
  min-width: clamp(150px, 16vw, 250px);
  font-size: clamp(0.95rem, min(1.35vw, 2.4vh), 1.3rem);
  padding: 0.85em 1.8em;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.55);
}
.rate span {
  font-size: 0.8em;
}
.rate.mehr:hover {
  border-color: var(--gruen);
  background: rgba(46, 229, 157, 0.18);
  box-shadow: 0 0 30px -6px var(--gruen);
}
.rate.weniger:hover {
  border-color: var(--rot);
  background: rgba(255, 84, 112, 0.18);
  box-shadow: 0 0 30px -6px var(--rot);
}

/* niedrige Bildschirme (Laptop, Handy quer): Knöpfe nebeneinander */
@media (max-height: 560px) {
  .knoepfe {
    flex-direction: row;
  }
  .rate {
    min-width: 0;
  }
}

/* Handy hochkant: jede Karte ist nur halb so hoch -> nach der Höhe skalieren */
@media (max-width: 700px) {
  .name {
    font-size: clamp(1.3rem, 4.4vh, 2.4rem);
  }
  .text {
    font-size: clamp(0.82rem, 1.9vh, 1.05rem);
  }
  .wert {
    font-size: clamp(1.8rem, 6.4vh, 3.4rem);
  }
  .knoepfe {
    flex-direction: row;
  }
  .rate {
    min-width: 0;
    font-size: clamp(0.9rem, 2vh, 1.05rem);
    padding: 0.75em 1.3em;
  }
}
</style>
