// 2005760 -> "2.005.760", 4.5 -> "4,5"
// "vorlage" bestimmt die Nachkommastellen (wichtig beim Hochzählen)
export function formatiereZahl(zahl, vorlage = zahl) {
  const stellen = Number.isInteger(vorlage) ? 0 : 1
  return zahl.toLocaleString('de-DE', {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen
  })
}
