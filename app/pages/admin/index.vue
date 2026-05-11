<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const supabase = useSupabaseClient<any>()
const loading = ref(false)

const stats = ref([
  { label: 'Total Projects', value: '0', icon: 'i-heroicons-briefcase', color: 'teal' },
  { label: 'Blog Posts', value: '0', icon: 'i-heroicons-document-text', color: 'blue' },
  { label: 'Certificates', value: '0', icon: 'i-heroicons-academic-cap', color: 'orange' },
  { label: 'Tech Stack', value: '0', icon: 'i-heroicons-cpu-chip', color: 'purple' }
])

const recentProjects = ref<any[]>([])
const recentPosts = ref<any[]>([])

const fetchStats = async () => {
  try {
    loading.value = true
    
    // Total Projects
    const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
    stats.value[0]!.value = String(projectCount || 0)

    // Blog Posts
    const { count: postCount } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true })
    stats.value[1]!.value = String(postCount || 0)

    // Certificates
    const { count: certCount } = await supabase.from('certificates').select('*', { count: 'exact', head: true })
    stats.value[2]!.value = String(certCount || 0)

    // Tech Stack
    const { count: techCount } = await supabase.from('tech_stack').select('*', { count: 'exact', head: true })
    stats.value[3]!.value = String(techCount || 0)

    // Recent data
    const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(3)
    recentProjects.value = projects || []

    const { data: blogPosts } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(3)
    recentPosts.value = blogPosts || []

  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Welcome Header -->
    <div class="bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-400 rounded-2xl p-8 text-white shadow-2xl shadow-teal-500/30 relative overflow-hidden">
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p class="text-teal-100/80 text-sm font-medium uppercase tracking-widest mb-1">Portfolio CMS</p>
          <h1 class="text-3xl font-bold">Good Day, Administrator! 👋</h1>
          <p class="mt-2 text-teal-50/70 max-w-lg text-sm leading-relaxed">
            Welcome back to your dashboard. Manage your portfolio content from one place.
          </p>
        </div>
        <div class="flex gap-3 flex-wrap">
          <UButton to="/admin/projects/new" variant="outline" color="neutral" size="sm" icon="i-heroicons-plus" class="rounded-xl backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20">New Project</UButton>
          <UButton to="/admin/blog/new" variant="outline" color="neutral" size="sm" icon="i-heroicons-pencil-square" class="rounded-xl backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20">New Post</UButton>
        </div>
      </div>
      <!-- Decorative elements -->
      <div class="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl"></div>
      <div class="absolute left-1/2 bottom-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl"></div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard 
        v-for="stat in stats" 
        :key="stat.label"
        :ui="{ body: 'p-5' }"
        class="border-slate-200 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative group"
      >
        <div class="flex items-center gap-3">
          <div :class="`shrink-0 p-2.5 bg-${stat.color}-500/10 rounded-xl group-hover:scale-110 transition-transform duration-200`">
            <UIcon :name="stat.icon" :class="`w-5 h-5 text-${stat.color}-500`" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{{ stat.value }}</p>
          </div>
        </div>
        <!-- Bottom accent bar -->
        <div :class="`absolute bottom-0 left-0 right-0 h-0.5 bg-${stat.color}-500/40 opacity-0 group-hover:opacity-100 transition-opacity`"></div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Projects -->
      <UCard :ui="{ body: 'p-0' }" class="rounded-2xl border-slate-200 dark:border-slate-800 overflow-hidden">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-briefcase" class="text-teal-500" />
              Recent Projects
            </h3>
            <UButton to="/admin/projects" variant="link" color="primary" size="sm">View All</UButton>
          </div>
        </template>
        
        <div v-if="loading" class="p-6 space-y-4">
          <USkeleton v-for="i in 3" :key="i" class="h-16 w-full" />
        </div>
        <div v-else-if="recentProjects.length > 0" class="divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="proj in recentProjects" :key="proj.id" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-center gap-4">
            <img :src="proj.thumbnail_url || 'https://via.placeholder.com/100'" class="w-12 h-12 rounded-lg object-cover bg-slate-100" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ proj.title }}</p>
              <p class="text-xs text-slate-500 truncate">{{ proj.date }}</p>
            </div>
            <UButton :to="`/admin/projects/${proj.id}`" variant="ghost" icon="i-heroicons-pencil-square" color="neutral" size="sm" />
          </div>
        </div>
        <div v-else class="text-center py-12 text-slate-500">
          <UIcon name="i-heroicons-folder-open" class="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No projects yet.</p>
          <UButton to="/admin/projects/new" variant="link" color="primary" class="mt-2">Add your first project</UButton>
        </div>
      </UCard>

      <!-- Recent Blog Posts -->
      <UCard :ui="{ body: 'p-0' }" class="rounded-2xl border-slate-200 dark:border-slate-800 overflow-hidden">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-document-text" class="text-blue-500" />
              Recent Articles
            </h3>
            <UButton to="/admin/blog" variant="link" color="info" size="sm">View All</UButton>
          </div>
        </template>

        <div v-if="loading" class="p-6 space-y-4">
          <USkeleton v-for="i in 3" :key="i" class="h-16 w-full" />
        </div>
        <div v-else-if="recentPosts.length > 0" class="divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="post in recentPosts" :key="post.id" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <UIcon name="i-heroicons-document" class="text-blue-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ post.title }}</p>
              <div class="flex items-center gap-2 mt-1">
                <UBadge :color="post.published ? 'primary' : 'neutral'" size="xs" variant="soft">{{ post.published ? 'Published' : 'Draft' }}</UBadge>
                <span class="text-[10px] text-slate-500">{{ new Date(post.created_at).toLocaleDateString() }}</span>
              </div>
            </div>
            <UButton :to="`/admin/blog/${post.id}`" variant="ghost" icon="i-heroicons-pencil-square" color="neutral" size="sm" />
          </div>
        </div>
        <div v-else class="text-center py-12 text-slate-500">
          <UIcon name="i-heroicons-document-minus" class="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No articles yet.</p>
          <UButton to="/admin/blog/new" variant="link" color="info" class="mt-2">Write your first post</UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
