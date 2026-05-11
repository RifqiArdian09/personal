<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient<any>()

const slug = route.params.slug as string

const { data: post, pending } = await useAsyncData(`blog-${slug}`, async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
})

useSeoMeta({
  title: () => post.value?.title ? `${post.value.title} — Rifqi Ardian` : 'Blog Post',
  description: () => post.value?.excerpt || 'Blog post by Rifqi Ardian',
  ogImage: () => post.value?.cover_url || ''
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
  <div class="min-h-screen pt-36 pb-20">
    <!-- Loading -->
    <div v-if="pending" class="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <USkeleton class="h-10 w-3/4 rounded-lg" />
      <USkeleton class="h-6 w-48 rounded-lg" />
      <USkeleton class="aspect-[21/9] w-full rounded-2xl" />
      <div class="space-y-4 pt-8">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
      </div>
    </div>

    <!-- Post Content -->
    <div v-else-if="post" class="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
      <NuxtLink to="/blog" class="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-8 font-display font-semibold text-sm scroll-hidden">
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        Back to Blog
      </NuxtLink>

      <header class="mb-12 scroll-hidden">
        <h1 class="font-display font-bold text-3xl md:text-5xl tracking-tight leading-tight mb-6">
          {{ post.title }}
        </h1>
        
        <div class="flex items-center gap-5 text-sm font-mono text-text-secondary">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-accent rounded-full"></div>
            {{ new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
          </div>
        </div>
      </header>

      <div v-if="post.cover_url" class="manga-card overflow-hidden mb-14 reveal-scale">
        <img :src="post.cover_url" :alt="post.title" class="w-full aspect-[21/9] object-cover" />
      </div>

      <article
        class="prose prose-lg max-w-none scroll-hidden
          prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:border-2 prose-img:border-divider
          prose-pre:bg-surface-alt prose-pre:border-2 prose-pre:border-divider prose-pre:rounded-xl prose-pre:font-mono
          prose-code:font-mono prose-code:text-accent
          prose-blockquote:border-l-[3px] prose-blockquote:border-accent prose-blockquote:bg-accent-soft prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-4
          dark:prose-invert
        "
        v-html="post.content"
      ></article>

      <!-- Author Footer -->
      <div class="mt-16 pt-8 border-t-[3px] border-manga-border reveal-card">
        <div class="manga-card p-6 flex items-center gap-5">
          <div class="w-14 h-14 bg-accent rounded-xl flex items-center justify-center border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] shrink-0">
            <span class="text-white font-bold font-display text-xl">R</span>
          </div>
          <div>
            <p class="font-display font-bold text-lg">Rifqi Ardian</p>
            <p class="text-text-secondary text-sm font-mono">Fullstack Developer</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="max-w-[800px] mx-auto px-4 text-center py-32">
      <div class="manga-card p-16 inline-block">
        <UIcon name="i-heroicons-exclamation-circle" class="w-20 h-20 text-text-secondary opacity-30 mx-auto mb-6" />
        <h1 class="font-display font-bold text-3xl mb-4">Post Not Found</h1>
        <p class="text-text-secondary mb-8">The blog post you're looking for doesn't exist.</p>
        <NuxtLink to="/blog" class="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] hover:-translate-y-1 transition-all font-display">
          Return to Blog
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
