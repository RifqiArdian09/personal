<script setup lang="ts">
useHead({
  titleTemplate: '%s | Rifqi.dev',
  htmlAttrs: { lang: 'id' },
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'shortcut icon', href: '/favicon.png' },
    { rel: 'apple-touch-icon', href: '/favicon.png' },
  ],
})

useSeoMeta({
  title: 'Rifqi Ardian — Fullstack Developer',
  description: 'Portfolio Rifqi Ardian, seorang Fullstack Developer yang membangun pengalaman web modern, interaktif, dan bermakna.',
  ogTitle: 'Rifqi Ardian — Fullstack Developer',
  ogDescription: 'Portfolio Rifqi Ardian, seorang Fullstack Developer yang membangun pengalaman web modern, interaktif, dan bermakna.',
  ogImage: '/favicon.png',
  ogUrl: 'https://rifqi.my.id',
  ogType: 'website',
  ogSiteName: 'Rifqi.dev',
  twitterCard: 'summary',
  twitterTitle: 'Rifqi Ardian — Fullstack Developer',
  twitterDescription: 'Portfolio Rifqi Ardian, seorang Fullstack Developer.',
  twitterImage: '/favicon.png',
})
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#14b8a6" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UToaster />
  </div>
</template>

<style>
/* Global smooth transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
