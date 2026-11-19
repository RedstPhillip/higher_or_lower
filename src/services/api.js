// Daten kommen aus den Mock-Dateien in /public/data

async function ladeJson(pfad) {
  const response = await fetch(pfad)

  if (!response.ok) {
    throw new Error(`Server-Fehler: ${response.status}`)
  }
  return response.json()
}

export function ladeKategorien() {
  return ladeJson('/data/kategorien.json')
}

export function ladeItems(kategorieId) {
  return ladeJson(`/data/${kategorieId}.json`)
}
