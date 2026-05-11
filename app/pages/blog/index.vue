<script setup lang="ts">
const supabase = useSupabaseClient<any>()
const { locale } = useI18n()

const { data: blogs, pending } = await useAsyncData('public-blogs', async () => {
  const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  return data || []
})

const searchQuery = ref('')
const selectedCategory = ref('All')

const categories = computed(() => {
  const cats = new Set(['All'])
  blogs.value?.forEach(post => {
    if (post.category) cats.add(post.category)
  })
  return Array.from(cats)
})

const filteredBlogs = computed(() => {
  if (!blogs.value) return []
  return blogs.value.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         post.excerpt?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'All' || post.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
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
    <div class="mb-20 text-center relative">
      <!-- Decorative Elements -->
      <div class="absolute -top-10 -left-10 w-24 h-24 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-0 right-0 text-accent/10 font-mono text-9xl font-black -z-10 select-none">BLOG</div>
      
      <div class="scroll-hidden">
        <span class="manga-badge mb-4 inline-block">// {{ locale === 'id' ? 'WAWASAN' : 'INSIGHTS' }}</span>
        <h1 class="section-heading text-4xl md:text-6xl mt-4 mb-6">
          {{ locale === 'id' ? 'Tulisan' : 'Latest' }} <span class="text-accent">{{ locale === 'id' ? 'Terbaru' : 'Writings' }}</span>
        </h1>
        <div class="w-24 h-2 bg-accent rounded-full mx-auto mb-8 shadow-[0_4px_12px_rgba(13,148,136,0.3)]"></div>
        <p class="text-text-secondary text-lg max-w-[600px] mx-auto font-medium">
          {{ locale === 'id' ? 'Berbagi pemikiran, tutorial, dan pengalaman seputar dunia pengembangan perangkat lunak.' : 'Thoughts, tutorials, and insights about web development and technology.' }}
        </p>
      </div>

      <!-- Search & Filters -->
      <div class="mt-12 max-w-2xl mx-auto space-y-6 reveal-scale">
        <div class="relative group">
          <UIcon name="i-heroicons-magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />
          <input 
            v-model="searchQuery"
            type="text" 
            :placeholder="locale === 'id' ? 'Cari artikel...' : 'Search articles...'"
            class="w-full pl-12 pr-4 py-4 bg-surface border-2 border-manga-border rounded-2xl shadow-[4px_4px_0px_var(--color-manga-border)] focus:shadow-[6px_6px_0px_var(--color-accent)] focus:border-accent outline-none transition-all font-mono font-bold text-sm"
          />
        </div>
        
        <div class="flex flex-wrap justify-center gap-3">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            class="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all"
            :class="selectedCategory === cat 
              ? 'bg-accent text-white border-manga-border shadow-[3px_3px_0px_#000]' 
              : 'bg-surface text-text-secondary border-divider hover:border-accent hover:text-accent'"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="pending" class="grid lg:grid-cols-3 gap-8">
      <div v-for="i in 6" :key="i" class="manga-card p-5 space-y-4">
        <USkeleton class="aspect-video w-full rounded-lg" />
        <USkeleton class="h-4 w-1/3" />
        <USkeleton class="h-6 w-2/3" />
        <USkeleton class="h-16 w-full" />
      </div>
    </div>
    
    <div v-else-if="filteredBlogs && filteredBlogs.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <NuxtLink
        v-for="(post, idx) in filteredBlogs"
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
            {{ new Date(post.created_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </p>
          <h3 class="font-display font-bold text-lg group-hover:text-accent transition-colors duration-300 line-clamp-2">{{ post.title }}</h3>
          <p class="text-text-secondary text-sm line-clamp-3 flex-1">{{ post.excerpt }}</p>
          <div class="flex items-center gap-2 text-accent text-sm font-semibold font-display group-hover:gap-3 transition-[gap] pt-3 border-t border-divider mt-auto">
            {{ locale === 'id' ? 'Baca Artikel' : 'Read Article' }} <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
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
