<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ladeKategorien, ladeItems } from '@/services/api'
import { useSpielStore } from '@/stores/spielStore'
import SpielKarte from '@/components/SpielKarte.vue'

const route = useRoute()
const router = useRouter()
const store = useSpielStore()

const isLoading = ref(true)
const errorMessage = ref('')
const aufgedeckt = ref(false)

onMounted(async () => {
  try {
    const kategorien = await ladeKategorien()
    const kategorie = kategorien.find((k) => k.id === route.params.kategorie)
    const items = await ladeItems(kategorie.id)
    console.log('geladen', items)
    store.starten(kategorie, items)
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    errorMessage.value = 'Die Spieldaten konnten nicht geladen werden.'
  } finally {
    isLoading.value = false
  }
})

function raten(tipp) {
  if (aufgedeckt.value) return
  aufgedeckt.value = true
  const richtig = store.istRichtig(tipp)

  setTimeout(() => {
    if (richtig) {
      store.weiter()
      aufgedeckt.value = false
    } else {
      router.push({ name: 'ergebnis', params: { kategorie: store.kategorie.id } })
    }
  }, 1500)
}
// Steuerung mit den Pfeiltasten
function tasteGedrueckt(event) {
  if (event.key === 'ArrowUp') raten('mehr')
  if (event.key === 'ArrowDown') raten('weniger')
}

onMounted(() => window.addEventListener('keydown', tasteGedrueckt))
onUnmounted(() => window.removeEventListener('keydown', tasteGedrueckt))
</script>

<template>
  <main class="spiel">
    <header class="hud">
      <RouterLink to="/">← Zurück</RouterLink>
      <span>Punkte: {{ store.punkte }}</span>
    </header>

    <div v-if="isLoading" class="status"><div class="spinner"></div></div>
    <p v-else-if="errorMessage" class="status">{{ errorMessage }}</p>

    <div v-else class="buehne">
      <SpielKarte
        :item="store.links"
        :kategorie="store.kategorie"
        rolle="links"
      />
      <div class="vs">VS</div>
      <SpielKarte
        :item="store.rechts"
        :kategorie="store.kategorie"
        rolle="rechts"
        :vergleich="store.links.name"
        :aufgedeckt="aufgedeckt"
        @raten="raten"
      />
    </div>
  </main>
</template>

<style scoped>
.spiel {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.hud {
  display: flex;
  justify-content: space-between;
  padding: 12px 20px;
  background: #000;
}

.hud a {
  color: inherit;
}

.status {
  flex: 1;
  display: grid;
  place-items: center;
}

.buehne {
  position: relative;
  flex: 1;
  display: flex;
}

.vs {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #fff;
  color: #000;
  font-weight: 800;
}
</style>
