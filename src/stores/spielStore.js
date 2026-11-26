import { defineStore } from 'pinia'
import { ref } from 'vue'

// Mischt ein Array (Fisher-Yates) und gibt eine neue Kopie zurück
function mischen(liste) {
  const kopie = [...liste]
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[kopie[i], kopie[j]] = [kopie[j], kopie[i]]
  }
  return kopie
}

export const useSpielStore = defineStore('spiel', () => {
  // --- Zustand der aktuellen Runde ---
  const kategorie = ref(null) // { id, titel, einheit, ... }
  const alleItems = ref([]) // alle Items der Kategorie
  const stapel = ref([]) // Items, die noch kommen
  const links = ref(null) // Item mit bekanntem Wert
  const rechts = ref(null) // Item, das geraten wird
  const punkte = ref(0)
  const verlauf = ref([]) // alle Items, die man in dieser Runde gesehen hat

  // --- Highscores bleiben im LocalStorage gespeichert ---
  const gespeichert = localStorage.getItem('highscores')
  const highscores = ref(gespeichert ? JSON.parse(gespeichert) : {})

  function starten(neueKategorie, items) {
    kategorie.value = neueKategorie
    alleItems.value = items
    stapel.value = mischen(items)
    links.value = stapel.value.pop()
    rechts.value = stapel.value.pop()
    punkte.value = 0
    verlauf.value = [links.value]
  }

  // tipp ist 'mehr' oder 'weniger'. Gleich viel zählt immer als richtig.
  function istRichtig(tipp) {
    const a = links.value.wert
    const b = rechts.value.wert
    if (a === b) return true
    return tipp === 'mehr' ? b > a : b < a
  }

  function weiter() {
    punkte.value++
    verlauf.value.push(rechts.value)

    const vorher = links.value
    links.value = rechts.value

    // Stapel leer? -> neu mischen (ohne die zwei Items, die gerade sichtbar sind)
    if (stapel.value.length === 0) {
      stapel.value = mischen(
        alleItems.value.filter((i) => i.id !== links.value.id && i.id !== vorher.id)
      )
    }
    rechts.value = stapel.value.pop()
  }

  // speichert den Highscore und gibt zurück, ob es ein neuer Rekord ist
  function speichereErgebnis() {
    const id = kategorie.value.id
    const alterRekord = highscores.value[id] || 0
    if (punkte.value <= alterRekord) return false

    highscores.value[id] = punkte.value
    localStorage.setItem('highscores', JSON.stringify(highscores.value))
    return true
  }

  return {
    kategorie,
    links,
    rechts,
    punkte,
    verlauf,
    highscores,
    starten,
    istRichtig,
    weiter,
    speichereErgebnis
  }
})
