<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ladeKategorien, ladeItems } from '@/services/api'
import { useSpielStore } from '@/stores/spielStore'
import SpielKarte from '@/components/SpielKarte.vue'

const route = useRoute()
const router = useRouter()
const store = useSpielStore()

const isLoading = ref(true)
const errorMessage = ref('')
const aufgedeckt = ref(false) // ist der rechte Wert schon sichtbar?
const ergebnis = ref(null) // null, 'richtig' oder 'falsch'
let timer = null

// die zwei sichtbaren Karten
const karten = computed(() => [store.links, store.rechts])
const rekord = computed(() =>
  Math.max(store.highscores[route.params.kategorie] || 0, store.punkte)
)

async function laden() {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // Kategorie aus dem Route Param (/spiel/:kategorie) suchen
    const kategorien = await ladeKategorien()
    const kategorie = kategorien.find((k) => k.id === route.params.kategorie)
    if (!kategorie) {
      router.replace({ name: 'start' })
      return
    }

    const items = await ladeItems(kategorie.id)
    items.forEach((item) => (new Image().src = item.bild)) // Bilder vorladen
    store.starten(kategorie, items)
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    errorMessage.value = 'Die Spieldaten konnten nicht geladen werden.'
  } finally {
    isLoading.value = false
  }
}

function raten(tipp) {
  if (aufgedeckt.value) return
  aufgedeckt.value = true
  const richtig = store.istRichtig(tipp)

  // 1. Zahl zählt hoch  2. Ergebnis zeigen  3. weiter oder Ende
  timer = setTimeout(() => {
    ergebnis.value = richtig ? 'richtig' : 'falsch'
    timer = setTimeout(richtig ? naechsteRunde : spielEnde, 900)
  }, 1000)
}

function naechsteRunde() {
  store.weiter()
  aufgedeckt.value = false
  ergebnis.value = null
}

function spielEnde() {
  const neuerRekord = store.speichereErgebnis()
  // neuerRekord wird unsichtbar über den History State mitgegeben
  router.push({
    name: 'ergebnis',
    params: { kategorie: store.kategorie.id },
    state: { neuerRekord }
  })
}

// Steuerung mit den Pfeiltasten
function tasteGedrueckt(event) {
  if (isLoading.value || errorMessage.value) return
  if (event.key === 'ArrowUp') raten('mehr')
  if (event.key === 'ArrowDown') raten('weniger')
}

onMounted(() => {
  laden()
  window.addEventListener('keydown', tasteGedrueckt)
})

onUnmounted(() => {
  clearTimeout(timer)
  window.removeEventListener('keydown', tasteGedrueckt)
})
</script>

<template>
  <main class="spiel">
    <header class="hud">
      <RouterLink to="/" class="btn zurueck">← <span>Kategorien</span></RouterLink>
      <span
        v-if="store.kategorie && !isLoading"
        class="kategorie"
        :style="{ '--farbe': store.kategorie.farbe }"
      >
        {{ store.kategorie.titel }}
      </span>
      <div class="stand">
        <div>
          <small>Punkte</small>
          <strong :key="store.punkte" class="pop">{{ store.punkte }}</strong>
          <span v-if="store.punkte > 0" :key="'plus' + store.punkte" class="plus-eins">+1</span>
        </div>
        <div>
          <small>Rekord</small>
          <strong>{{ rekord }}</strong>
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="status">
      <div class="spinner"></div>
      <p>Lade Spieldaten…</p>
    </div>

    <div v-else-if="errorMessage" class="status">
      <p>{{ errorMessage }}</p>
      <button class="btn" @click="laden">Nochmal versuchen</button>
    </div>

    <div v-else class="buehne-rahmen">
      <TransitionGroup name="karte" tag="div" class="buehne">
        <SpielKarte
          v-for="(item, index) in karten"
          :key="item.id"
          :item="item"
          :kategorie="store.kategorie"
          :rolle="index === 0 ? 'links' : 'rechts'"
          :vergleich="store.links.name"
          :aufgedeckt="aufgedeckt"
          :ergebnis="ergebnis"
          @raten="raten"
        />
      </TransitionGroup>

      <div class="vs" :class="ergebnis">
        <Transition name="symbol" mode="out-in">
          <span v-if="ergebnis === 'richtig'" key="r">✓</span>
          <span v-else-if="ergebnis === 'falsch'" key="f">✕</span>
          <span v-else key="vs">VS</span>
        </Transition>
      </div>
    </div>
  </main>
</template>

<style scoped>
.spiel {
  position: relative;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

/* --- Kopfzeile über dem Spielfeld --- */
.hud {
  position: absolute;
  inset: 0 0 auto;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: clamp(12px, 2vh, 24px) clamp(12px, 2vw, 32px);
  pointer-events: none;
}
.hud > * {
  pointer-events: auto;
}

.zurueck {
  padding: 0.6em 1.1em;
  font-size: 0.95rem;
}

.kategorie {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8rem;
}
.kategorie::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--farbe);
  box-shadow: 0 0 10px var(--farbe);
}

.stand {
  display: flex;
  gap: 8px;
}
.stand div {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 74px;
  padding: 6px 14px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
}
.stand small {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-leise);
}
.stand strong {
  font-family: var(--schrift-titel);
  font-size: 1.5rem;
}
.pop {
  animation: pop 0.4s ease;
}
@keyframes pop {
  50% {
    transform: scale(1.4);
    color: var(--gruen);
  }
}

/* kleines "+1", das nach unten wegschwebt */
.plus-eins {
  position: absolute;
  top: 100%;
  left: 50%;
  font-family: var(--schrift-titel);
  font-weight: 800;
  color: var(--gruen);
  pointer-events: none;
  animation: schweben 1s ease-out forwards;
}
@keyframes schweben {
  from {
    opacity: 1;
    transform: translate(-50%, -6px) scale(0.8);
  }
  to {
    opacity: 0;
    transform: translate(-50%, 22px) scale(1.3);
  }
}

.status {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-leise);
}

/* --- Spielfeld --- */
.buehne-rahmen,
.buehne {
  position: relative;
  height: 100%;
}
.buehne {
  display: flex;
}

/* feine leuchtende Trennlinie zwischen den Karten */
.buehne-rahmen::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  z-index: 4;
  width: 2px;
  translate: -50% 0;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.5), transparent);
  pointer-events: none;
}

/* Karten-Wechsel: links raus, rechts rückt nach, neue kommt rein */
.karte-move,
.karte-enter-active,
.karte-leave-active {
  transition: transform 0.7s cubic-bezier(0.7, 0, 0.2, 1);
}
.karte-enter-from {
  transform: translateX(100%);
}
.karte-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
}
.karte-leave-to {
  transform: translateX(-100%);
}

/* --- VS-Kreis in der Mitte --- */
.vs {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 5;
  display: grid;
  place-items: center;
  width: clamp(60px, min(7vw, 12vh), 108px);
  aspect-ratio: 1;
  border-radius: 50%;
  translate: -50% -50%;
  background: var(--text);
  color: var(--bg);
  font-family: var(--schrift-titel);
  font-size: clamp(1.1rem, min(1.8vw, 3vh), 1.9rem);
  font-weight: 800;
  box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.15), 0 10px 40px rgba(0, 0, 0, 0.5);
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}
.vs.richtig {
  background: var(--gruen);
  box-shadow: 0 0 0 10px rgba(46, 229, 157, 0.25), 0 0 60px var(--gruen);
  animation: puls 0.5s ease;
}
.vs.falsch {
  background: var(--rot);
  color: var(--text);
  box-shadow: 0 0 0 10px rgba(255, 84, 112, 0.25), 0 0 60px var(--rot);
  animation: wackeln 0.45s ease;
}
.vs.richtig,
.vs.falsch {
  font-size: clamp(1.6rem, min(2.6vw, 4.4vh), 2.8rem);
}

@keyframes puls {
  50% {
    scale: 1.25;
  }
}
@keyframes wackeln {
  20%,
  60% {
    rotate: -12deg;
  }
  40%,
  80% {
    rotate: 12deg;
  }
}

.symbol-enter-active,
.symbol-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.symbol-enter-from,
.symbol-leave-to {
  transform: scale(0.3);
  opacity: 0;
}

/* --- Handy: Karten untereinander --- */
@media (max-width: 700px) {
  .hud {
    padding: 12px;
  }
  .zurueck span {
    display: none;
  }
  .kategorie {
    display: none;
  }
  .stand div {
    min-width: 60px;
    padding: 4px 10px;
  }
  .stand strong {
    font-size: 1.2rem;
  }

  .buehne {
    flex-direction: column;
  }
  .karte-enter-from {
    transform: translateY(100%);
  }
  .karte-leave-active {
    width: 100%;
    height: 50%;
  }
  .karte-leave-to {
    transform: translateY(-100%);
  }
  .buehne-rahmen::after {
    top: 50%;
    bottom: auto;
    left: 0;
    right: 0;
    width: auto;
    height: 2px;
    translate: 0 -50%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  }
  .vs {
    width: clamp(56px, 8vh, 72px);
    font-size: 1.2rem;
  }
  .vs.richtig,
  .vs.falsch {
    font-size: 1.8rem;
  }
}
</style>
