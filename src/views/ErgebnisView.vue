<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useSpielStore } from '@/stores/spielStore'
import ZaehlZahl from '@/components/ZaehlZahl.vue'
import { formatiereZahl } from '@/utils/format'

const router = useRouter()
const store = useSpielStore()

// wurde vom SpielView über den History State mitgeschickt
const neuerRekord = history.state?.neuerRekord === true

const rekord = computed(() => store.highscores[store.kategorie?.id] || 0)

// Rang je nach Punkten
const raenge = [
  { ab: 0, emoji: '🥔', titel: 'Kartoffel' },
  { ab: 1, emoji: '🐣', titel: 'Küken' },
  { ab: 3, emoji: '🧭', titel: 'Entdecker:in' },
  { ab: 6, emoji: '🎓', titel: 'Profi' },
  { ab: 10, emoji: '🧠', titel: 'Genie' },
  { ab: 15, emoji: '👑', titel: 'Legende' }
]
const rang = computed(() => raenge.filter((r) => store.punkte >= r.ab).at(-1))

// wie weit ist man vom Rekord entfernt? (0 bis 100 %)
const fortschritt = computed(() =>
  rekord.value === 0 ? 100 : Math.min((store.punkte / rekord.value) * 100, 100)
)

const spruch = computed(() => {
  const p = store.punkte
  if (p === 0) return 'Autsch – gleich die erste daneben.'
  if (p < 3) return 'Aller Anfang ist schwer.'
  if (p < 6) return 'Nicht schlecht, da geht noch mehr!'
  if (p < 10) return 'Stark! Du kennst dich aus.'
  return 'Legendär. Bist du ein Lexikon?'
})

// ein paar Konfetti-Stücke für einen neuen Rekord
const farben = ['#2ee59d', '#ff5470', '#ffd23f', '#7cc4ff', '#ff7ab6']
const konfetti = Array.from({ length: 40 }, (_, i) => ({
  left: Math.random() * 100 + '%',
  background: farben[i % farben.length],
  animationDelay: Math.random() * 0.8 + 's',
  animationDuration: 2.2 + Math.random() * 1.6 + 's'
}))

function nochmal() {
  router.push({ name: 'spiel', params: { kategorie: store.kategorie.id } })
}

function tasteGedrueckt(event) {
  if (event.key === 'Enter') nochmal()
}

onMounted(() => {
  // Seite neu geladen? Dann gibt es keine Runde im Store -> zurück zum Start
  if (!store.kategorie) {
    router.replace({ name: 'start' })
    return
  }
  window.addEventListener('keydown', tasteGedrueckt)
})

onUnmounted(() => window.removeEventListener('keydown', tasteGedrueckt))
</script>

<template>
  <main v-if="store.kategorie" class="ergebnis">
    <img :src="store.rechts.bild" alt="" class="hintergrund" />

    <div v-if="neuerRekord" class="konfetti" aria-hidden="true">
      <i v-for="(stil, i) in konfetti" :key="i" :style="stil"></i>
    </div>

    <section class="panel">
      <p class="label">Game over · {{ store.kategorie.titel }}</p>

      <h1 class="punkte"><ZaehlZahl :wert="store.punkte" :dauer="1200" /></h1>
      <p class="punkte-text">{{ store.punkte === 1 ? 'Punkt' : 'Punkte' }}</p>

      <p v-if="neuerRekord" class="badge rekord-neu">🏆 Neuer Rekord!</p>
      <div v-else class="balken-box">
        <div class="balken"><div :style="{ width: fortschritt + '%' }"></div></div>
        <small>{{ store.punkte }} / {{ rekord }} · Rekord</small>
      </div>

      <p class="rang">
        <span>{{ rang.emoji }}</span> Rang: <strong>{{ rang.titel }}</strong>
      </p>
      <p class="spruch">{{ spruch }}</p>

      <!-- woran ist man gescheitert? -->
      <div class="fehler">
        <div>
          <strong>{{ store.rechts.name }}</strong>
          <span>{{ formatiereZahl(store.rechts.wert) }} {{ store.kategorie.einheit }}</span>
        </div>
        <span class="gegen">vs</span>
        <div>
          <strong>{{ store.links.name }}</strong>
          <span>{{ formatiereZahl(store.links.wert) }} {{ store.kategorie.einheit }}</span>
        </div>
      </div>

      <div class="aktionen">
        <button class="btn btn-primaer" @click="nochmal">↻ Nochmal spielen</button>
        <RouterLink to="/" class="btn">Andere Kategorie</RouterLink>
      </div>
    </section>

    <section v-if="store.verlauf.length > 1" class="lauf">
      <h2>Dein Lauf</h2>
      <ol>
        <li v-for="(item, index) in store.verlauf" :key="item.id">
          <img :src="item.bild" :alt="item.name" />
          <span class="nr">{{ index + 1 }}</span>
          <div>
            <strong>{{ item.name }}</strong>
            <small>{{ formatiereZahl(item.wert) }}</small>
          </div>
        </li>
      </ol>
    </section>
  </main>
</template>

<style scoped>
.ergebnis {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 48px 16px;
  overflow: hidden;
  isolation: isolate; /* damit das Hintergrundbild (z-index: -1) sichtbar bleibt */
}

.hintergrund {
  position: fixed;
  inset: -40px;
  width: calc(100% + 80px);
  height: calc(100% + 80px);
  object-fit: cover;
  filter: blur(28px) brightness(0.35) saturate(1.3);
  z-index: -1;
}

.panel {
  width: min(560px, 100%);
  padding: clamp(28px, 5vh, 48px) clamp(20px, 4vw, 40px);
  border: 1px solid var(--linie);
  border-radius: 32px;
  background: rgba(11, 11, 18, 0.6);
  backdrop-filter: blur(20px);
  text-align: center;
  box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.8);
  animation: rein 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes rein {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.96);
  }
}

.label {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-leise);
}

.punkte {
  margin-top: 12px;
  font-size: clamp(4.5rem, min(22vw, 16vh), 9rem);
  font-weight: 800;
  background: linear-gradient(180deg, #fff 30%, var(--gelb));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.punkte-text {
  margin: 0 0 16px;
  color: var(--text-leise);
  font-size: 1.1rem;
}

.badge {
  display: inline-block;
  margin: 0;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--glas);
  border: 1px solid var(--linie);
  font-weight: 700;
}
.rekord-neu {
  background: var(--gelb);
  color: var(--bg);
  border-color: var(--gelb);
  animation: glitzern 1.2s ease-in-out infinite alternate;
}
@keyframes glitzern {
  to {
    box-shadow: 0 0 30px var(--gelb);
  }
}

/* Balken: wie nah am Rekord */
.balken-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.balken {
  width: min(260px, 80%);
  height: 8px;
  border-radius: 999px;
  background: var(--glas);
  overflow: hidden;
}
.balken div {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--gruen), var(--gelb));
  animation: fuellen 1.2s 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes fuellen {
  from {
    width: 0;
  }
}
.balken-box small {
  color: var(--text-leise);
}

.rang {
  margin: 22px 0 0;
  font-size: 1.1rem;
  color: var(--text-leise);
}
.rang strong {
  color: var(--text);
}
.rang span {
  display: inline-block;
  font-size: 1.6rem;
  vertical-align: middle;
  animation: huepfen 1s 1.2s ease both;
}
@keyframes huepfen {
  from {
    transform: scale(0);
  }
  60% {
    transform: scale(1.4);
  }
}

.spruch {
  margin: 8px 0 28px;
  font-size: 1.15rem;
}

.fehler {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 28px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 84, 112, 0.1);
  border: 1px solid rgba(255, 84, 112, 0.3);
}
.fehler div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.fehler span {
  font-size: 0.85rem;
  color: var(--text-leise);
}
.fehler .gegen {
  flex: none;
  font-family: var(--schrift-titel);
  font-weight: 800;
  color: var(--rot);
}

.aktionen {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

/* --- Verlauf der Runde --- */
.lauf {
  width: min(900px, 100%);
}
.lauf h2 {
  margin-bottom: 14px;
  font-size: 1.2rem;
  text-align: center;
}
.lauf ol {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 4px 4px 12px;
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.lauf li {
  position: relative;
  flex: none;
  width: 140px;
  height: 170px;
  border-radius: 18px;
  overflow: hidden;
  scroll-snap-align: start;
  animation: rein 0.5s both;
}
.lauf img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lauf li div {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  flex-direction: column;
  padding: 30px 12px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  font-size: 0.9rem;
}
.lauf small {
  color: var(--gelb);
  font-weight: 700;
}
.nr {
  position: absolute;
  top: 8px;
  left: 8px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  font-size: 0.8rem;
  font-weight: 700;
}

/* --- Konfetti --- */
.konfetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}
.konfetti i {
  position: absolute;
  top: -20px;
  width: 9px;
  height: 14px;
  border-radius: 2px;
  animation: fallen linear forwards;
}
@keyframes fallen {
  to {
    transform: translateY(110vh) rotate(720deg);
  }
}

@media (max-width: 600px) {
  .fehler {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
