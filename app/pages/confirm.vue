<script setup lang="ts">
const user = useSupabaseUser()
watch(user, () => {
  if (user.value) {
    return navigateTo('/admin')
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white font-['Space_Grotesk']">
    <div class="text-center">
      <p>Confirming your session...</p>
      <ULoadingIcon class="w-8 h-8 mx-auto mt-4" />
    </div>
  </div>
</template>
