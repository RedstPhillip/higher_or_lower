// Alle Daten kommen (noch) aus Mock-Dateien in /public/data.
// Später können hier einfach die URLs auf eine echte API umgestellt werden.

const BASIS = import.meta.env.BASE_URL

// kleine Pause, damit man den Lade-Zustand auch bei Mock-Daten sieht
const warte = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function ladeJson(pfad) {
  await warte(350)
  const response = await fetch(BASIS + pfad)

  if (!response.ok) {
    throw new Error(`Server-Fehler: ${response.status}`)
  }
  return response.json()
}

// Bildpfade vollständig machen (z. B. "bilder/tiere/orca.webp" -> "/bilder/tiere/orca.webp")
const mitBild = (objekt, feld) => ({ ...objekt, [feld]: BASIS + objekt[feld] })

export async function ladeKategorien() {
  const kategorien = await ladeJson('data/kategorien.json')
  return kategorien.map((k) => mitBild(k, 'cover'))
}

export async function ladeItems(kategorieId) {
  const items = await ladeJson(`data/${kategorieId}.json`)
  return items.map((item) => mitBild(item, 'bild'))
}
