<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ladeKategorien } from '@/services/api'
import { useSpielStore } from '@/stores/spielStore'

const router = useRouter()
const store = useSpielStore()

const kategorien = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

async function laden() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    kategorien.value = await ladeKategorien()
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    errorMessage.value = 'Die Kategorien konnten nicht geladen werden.'
  } finally {
    isLoading.value = false
  }
}

onMounted(laden)

function spielen(kategorie) {
  router.push({ name: 'spiel', params: { kategorie: kategorie.id } })
}
</script>

<template>
  <main class="start">
    <div class="blob blob-gruen"></div>
    <div class="blob blob-rot"></div>

    <header class="hero">
      <p class="label">SWP · 4BWHII</p>
      <h1 class="titel">
        <span class="wort">Higher <span class="pfeil hoch">▲</span></span>
        <span class="wort leise">or</span>
        <span class="wort">Lower <span class="pfeil runter">▼</span></span>
      </h1>
      <p class="untertitel">
        Zwei Dinge, eine Frage: <strong>mehr oder weniger?</strong><br />
        Wähle eine Kategorie und schau, wie lange du durchhältst.
      </p>
    </header>

    <section class="kategorien">
      <div v-if="isLoading" class="status"><div class="spinner"></div></div>

      <div v-else-if="errorMessage" class="status">
        <p>{{ errorMessage }}</p>
        <button class="btn" @click="laden">Nochmal versuchen</button>
      </div>

      <template v-else>
        <button
          v-for="(kategorie, index) in kategorien"
          :key="kategorie.id"
          class="karte"
          :style="{ '--farbe': kategorie.farbe, '--verzoegerung': index * 80 + 'ms' }"
          @click="spielen(kategorie)"
        >
          <img :src="kategorie.cover" :alt="kategorie.titel" />
          <div class="karte-inhalt">
            <span v-if="store.highscores[kategorie.id]" class="rekord">
              🏆 {{ store.highscores[kategorie.id] }}
            </span>
            <h2>{{ kategorie.titel }}</h2>
            <p>{{ kategorie.beschreibung }}</p>
            <span class="los">Spielen →</span>
          </div>
        </button>
      </template>
    </section>

    <section class="anleitung">
      <div><span>1</span> Links siehst du den Wert.</div>
      <div><span>2</span> Rate, ob rechts <strong>mehr</strong> oder <strong>weniger</strong> ist.</div>
      <div><span>3</span> Ein Fehler und die Runde ist vorbei.</div>
    </section>

    <footer>
      Tipp: Im Spiel geht's auch mit <kbd>↑</kbd> und <kbd>↓</kbd> · Zahlen sind Mock-Daten ·
      Bilder: Wikimedia Commons
    </footer>
  </main>
</template>

<style scoped>
.start {
  position: relative;
  min-height: 100vh;
  padding: 64px 24px 40px;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

/* weiche Farbflecken im Hintergrund */
.blob {
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.22;
  z-index: -1;
  animation: schweben 14s ease-in-out infinite alternate;
}
.blob-gruen {
  background: var(--gruen);
  top: -200px;
  left: -160px;
}
.blob-rot {
  background: var(--rot);
  top: 120px;
  right: -220px;
  animation-delay: -7s;
}
@keyframes schweben {
  to {
    transform: translate(80px, 60px) scale(1.15);
  }
}

.hero {
  text-align: center;
  margin-bottom: 56px;
}

.label {
  display: inline-block;
  margin: 0 0 20px;
  padding: 6px 14px;
  border: 1px solid var(--linie);
  border-radius: 999px;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-leise);
}

.titel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 0 0.3em;
  font-size: clamp(3rem, 10vw, 7.5rem);
  font-weight: 800;
}

.wort {
  display: inline-flex;
  align-items: center;
  gap: 0.12em;
}

.leise {
  font-weight: 500;
  font-style: italic;
  color: var(--text-leise);
  font-size: 0.6em;
}

.pfeil {
  font-size: 0.45em;
  display: inline-block;
}
.hoch {
  color: var(--gruen);
  animation: hoch 1.6s ease-in-out infinite;
}
.runter {
  color: var(--rot);
  animation: runter 1.6s ease-in-out infinite;
}
@keyframes hoch {
  50% {
    transform: translateY(-14px);
  }
}
@keyframes runter {
  50% {
    transform: translateY(14px);
  }
}

.untertitel {
  margin: 24px auto 0;
  max-width: 520px;
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--text-leise);
}
.untertitel strong {
  color: var(--text);
}

/* Kategorie-Karten */
.kategorien {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.status {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  color: var(--text-leise);
}

.karte {
  position: relative;
  aspect-ratio: 3 / 4;
  padding: 0;
  border: none;
  border-radius: 24px;
  overflow: hidden;
  background: var(--bg-hell);
  text-align: left;
  box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.8);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: auftauchen 0.6s var(--verzoegerung) both cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes auftauchen {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
}

.karte::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.karte:hover,
.karte:focus-visible {
  transform: translateY(-8px) rotate(-0.6deg);
  box-shadow: 0 30px 60px -20px var(--farbe);
  outline: none;
}
.karte:hover::after,
.karte:focus-visible::after {
  border-color: var(--farbe);
}

.karte img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.karte:hover img {
  transform: scale(1.08);
}

.karte-inhalt {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 22px;
  background: linear-gradient(to top, rgba(8, 8, 14, 0.95) 10%, rgba(8, 8, 14, 0.1) 60%);
}

.karte h2 {
  font-size: 2rem;
  font-weight: 800;
}

.karte p {
  margin: 8px 0 14px;
  color: var(--text-leise);
  line-height: 1.4;
}

.los {
  font-weight: 700;
  color: var(--farbe);
}

.rekord {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  font-weight: 700;
  font-size: 0.9rem;
}

.anleitung {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 48px;
}
.anleitung div {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--linie);
  border-radius: 18px;
  background: var(--glas);
  color: var(--text-leise);
}
.anleitung strong {
  color: var(--text);
}
.anleitung span {
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--text);
  color: var(--bg);
  font-family: var(--schrift-titel);
  font-weight: 800;
}

footer {
  margin-top: 48px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-leise);
}

kbd {
  padding: 2px 7px;
  border: 1px solid var(--linie);
  border-radius: 6px;
  background: var(--glas);
  font-family: inherit;
}

@media (max-width: 600px) {
  .start {
    padding: 40px 16px 32px;
  }
  .karte {
    aspect-ratio: 16 / 10;
  }
}
</style>
