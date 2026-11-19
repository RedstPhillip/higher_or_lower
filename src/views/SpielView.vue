<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <h2>Spiel: {{ route.params.kategorie }}</h2>
</template>
