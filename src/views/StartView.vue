<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ladeKategorien } from '@/services/api'

const router = useRouter()

const kategorien = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    kategorien.value = await ladeKategorien()
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    errorMessage.value = 'Die Kategorien konnten nicht geladen werden.'
  } finally {
    isLoading.value = false
  }
})

function spielen(kategorie) {
  router.push({ name: 'spiel', params: { kategorie: kategorie.id } })
}
</script>

<template>
  <main class="start">
    <h1>Higher or Lower</h1>
    <p>Wähle eine Kategorie:</p>

    <div v-if="isLoading" class="spinner"></div>
    <p v-else-if="errorMessage" class="fehler">{{ errorMessage }}</p>

    <!-- TODO: schöner machen, Bilder dazu -->
    <ul v-else class="liste">
      <li v-for="kategorie in kategorien" :key="kategorie.id">
        <button @click="spielen(kategorie)">
          <strong>{{ kategorie.titel }}</strong>
          <span>{{ kategorie.beschreibung }}</span>
        </button>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.start {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 16px;
  text-align: center;
}

h1 {
  font-size: 3rem;
}

.liste {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 12px;
}

.liste button {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border: 1px solid #333;
  border-radius: 12px;
  background: #1c1c26;
  color: inherit;
}

.liste button:hover {
  border-color: #ffd23f;
}

.liste span {
  color: #aaa;
}

.fehler {
  color: #ff5470;
}
</style>
