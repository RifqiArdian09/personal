<script setup lang="ts">
const { locale } = useI18n()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white font-['Space_Grotesk']">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Portfolio of Rifqi Ardian</h1>
      <p class="text-slate-400 mb-8">Coming Soon</p>
      <UButton to="/admin/login" color="primary">Go to Admin Panel</UButton>
    </div>
  </div>
</template>
