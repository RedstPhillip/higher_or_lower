import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'
import SpielView from '../views/SpielView.vue'
import ErgebnisView from '../views/ErgebnisView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'start', component: StartView },
    // :kategorie ist ein Route Param, z. B. /spiel/staedte
    { path: '/spiel/:kategorie', name: 'spiel', component: SpielView },
    { path: '/ergebnis/:kategorie', name: 'ergebnis', component: ErgebnisView },
    // unbekannte Adressen -> zurück zum Start
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})
