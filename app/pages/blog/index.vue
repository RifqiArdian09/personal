<script setup lang="ts">
const supabase = useSupabaseClient()

const { data: blogs, pending } = await useAsyncData('public-blogs', async () => {
  const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  return data || []
})

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('scroll-visible')
    })
  }, { threshold: 0.08 })
  document.querySelectorAll('.scroll-hidden, .reveal-card, .reveal-scale').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 min-h-screen">
    <div class="mb-16 text-center scroll-hidden">
      <span class="manga-badge mb-4 inline-block">// blog</span>
      <h1 class="section-heading text-4xl md:text-5xl mt-4 mb-4">Blog</h1>
      <div class="w-16 h-1.5 bg-accent rounded-full mx-auto mb-6"></div>
      <p class="text-text-secondary text-lg max-w-[600px] mx-auto">
        Thoughts, tutorials, and insights about web development and technology.
      </p>
    </div>

    <div v-if="pending" class="grid lg:grid-cols-3 gap-8">
      <div v-for="i in 6" :key="i" class="manga-card p-5 space-y-4">
        <USkeleton class="aspect-video w-full rounded-lg" />
        <USkeleton class="h-4 w-1/3" />
        <USkeleton class="h-6 w-2/3" />
        <USkeleton class="h-16 w-full" />
      </div>
    </div>
    
    <div v-else-if="blogs && blogs.length > 0" class="grid lg:grid-cols-3 gap-8">
      <NuxtLink
        v-for="(post, idx) in blogs"
        :key="post.id"
        :to="`/blog/${post.slug}`"
        class="manga-card overflow-hidden group flex flex-col reveal-card"
        :class="`reveal-delay-${(idx % 6) + 1}`"
      >
        <div class="relative aspect-video overflow-hidden bg-surface-alt border-b-[3px] border-manga-border">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img
            v-if="post.cover_url"
            :src="post.cover_url"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div v-else class="w-full h-full flex items-center justify-center img-shimmer">
            <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-text-secondary opacity-30" />
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col space-y-3">
          <p class="text-xs font-mono text-accent font-semibold flex items-center gap-1">
            <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
            {{ new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </p>
          <h3 class="font-display font-bold text-lg group-hover:text-accent transition-colors duration-300 line-clamp-2">{{ post.title }}</h3>
          <p class="text-text-secondary text-sm line-clamp-3 flex-1">{{ post.excerpt }}</p>
          <div class="flex items-center gap-2 text-accent text-sm font-semibold font-display group-hover:gap-3 transition-[gap] pt-3 border-t border-divider mt-auto">
            Read Article <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="manga-card p-16 text-center reveal-scale">
      <UIcon name="i-heroicons-document-text" class="w-16 h-16 mx-auto text-text-secondary opacity-30 mb-4" />
      <h3 class="font-display font-bold text-xl mb-2">No Posts Yet</h3>
      <p class="text-text-secondary">Check back later for updates.</p>
    </div>
  </div>
</template>
