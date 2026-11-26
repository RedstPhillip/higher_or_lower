# Higher or Lower

Ein Ratespiel mit Vue 3: Links steht ein Wert, rechts musst du raten, ob der Wert **höher oder niedriger** ist.
Ein falscher Tipp und die Runde ist vorbei. Wie weit kommst du?

SWP-Projekt der 4BWHII.

## Features

- 4 Kategorien: **Städte** (Einwohner), **Berge** (Höhe), **Tiere** (Gewicht), **Suchanfragen** (Google-Suchen pro Monat)
- Echte Bilder zu jedem Eintrag, animiertes Hochzählen der Zahlen, Karten-Animation beim Weiterkommen
- Highscore pro Kategorie (bleibt im Browser gespeichert)
- Ergebnisseite mit Verlauf der Runde und Konfetti bei neuem Rekord
- Steuerung mit Maus, Touch oder Pfeiltasten (↑ / ↓, Enter für „Nochmal“)
- Funktioniert am Handy (Karten untereinander)

## Starten

```bash
npm install
npm run dev
```

Dann <http://localhost:5173> öffnen. Für eine fertige Version: `npm run build`.

## Projektstruktur

```
public/
  data/          Mock-Daten als JSON (kategorien.json + eine Datei pro Kategorie)
  bilder/        Bilder zu den Einträgen
src/
  services/api.js         lädt die Daten mit fetch()
  stores/spielStore.js    Pinia Store: Spiellogik, Punkte, Highscores
  router/index.js         Routen: /, /spiel/:kategorie, /ergebnis/:kategorie
  views/                  StartView, SpielView, ErgebnisView
  components/             SpielKarte (eine Hälfte des Spielfelds), ZaehlZahl (Zahl hochzählen)
  utils/format.js         Zahlen schön formatieren (2.005.760)
```

## Was aus dem Unterricht verwendet wird

| Technik | Wo im Projekt |
| --- | --- |
| Composition API mit `<script setup>`, `ref`, `computed` | überall |
| Mock-Daten | `public/data/*.json` |
| `fetch` mit Lade- und Fehlerstatus, `onMounted` | `services/api.js`, `StartView`, `SpielView` |
| Route Params | `/spiel/:kategorie` → `route.params.kategorie` |
| History State | `neuerRekord` wird unsichtbar an die Ergebnisseite übergeben |
| Pinia Store | `spielStore.js` teilt die laufende Runde zwischen Spiel- und Ergebnisseite |
| LocalStorage | Highscores bleiben auch nach dem Schließen des Browsers |
| Props & Emits | `SpielKarte` bekommt Item und Kategorie, meldet den Tipp mit `emit('raten')` |
| `v-if` / `v-for` / `:class` | Karten, Status-Anzeigen, Ergebnis-Farben |

## Daten

Die Zahlen sind **Mock-Daten** (für Städte, Berge und Tiere ungefähr realistisch, bei den Suchanfragen erfunden).
Später kann in `services/api.js` einfach auf eine echte API umgestellt werden – der Rest der App bleibt gleich.

Bilder: [Wikimedia Commons](https://commons.wikimedia.org) (Link zur Quelle steht bei jedem Eintrag im Feld `quelle`).
