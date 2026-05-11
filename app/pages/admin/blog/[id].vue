<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<any>()
const toast = useToast()

const id = route.params.id as string
const isNew = id === 'new'
const pageTitle = computed(() => isNew ? 'Create New Post' : 'Edit Post')

const loading = ref(false)
const saving = ref(false)

const post = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  content_json: null as any,
  cover_url: '',
  published: false,
  published_at: null as string | null
})

const fetchPost = async () => {
  if (isNew) return
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    if (data) post.value = { ...(data as any) }
  } catch (e: any) {
    toast.add({ title: 'Error fetching post', description: e.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  try {
    saving.value = true
    
    if (!post.value.slug && post.value.title) {
      post.value.slug = post.value.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    }

    if (post.value.published && !post.value.published_at) {
      post.value.published_at = new Date().toISOString()
    }

    const payload: any = isNew ? { ...post.value } : { ...post.value, id }
    delete payload.content_json


    const { error } = await supabase
      .from('blog_posts')
      .upsert(payload)
    
    if (error) throw error
    toast.add({ title: 'Post saved successfully', color: 'success', icon: 'i-heroicons-check-circle' })
    router.push('/admin/blog')
  } catch (e: any) {
    toast.add({ title: 'Error saving post', description: e.message, color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchPost()
})

const onUpdateJson = (json: any) => {
  post.value.content_json = json
}
</script>

<template>
  <div class="max-w-6xl mx-auto pb-24 space-y-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-4">
        <UButton
          icon="i-heroicons-arrow-left"
          variant="soft"
          color="neutral"
          class="rounded-xl w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
          @click="router.back()"
        />
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-document-text" class="text-blue-500 w-6 h-6" />
            {{ pageTitle }}
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ isNew ? 'Compose a new article for your readers.' : `Editing: ${post.title || 'Untitled'}` }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          label="Cancel"
          class="rounded-xl px-6 hover:bg-slate-100 dark:hover:bg-slate-800"
          @click="router.back()"
        />
        <UButton
          color="primary"
          icon="i-heroicons-check"
          label="Save Post"
          :loading="saving"
          class="rounded-xl px-8 shadow-lg shadow-primary-500/20 transition-transform hover:scale-105"
          @click="handleSave"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-8 space-y-8">
        <UCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-pencil-square" class="text-blue-500 w-5 h-5" />
              Content & Body
            </h3>
          </template>
          
          <div v-if="loading" class="space-y-6">
            <USkeleton class="h-12 w-full" />
            <USkeleton class="h-96 w-full" />
          </div>
          <div v-else class="space-y-8">
            <UFormField label="Post Title" required>
              <UInput class="w-full" v-model="post.title" placeholder="Enter a catchy title..." size="lg" />
            </UFormField>

            <UFormField label="Excerpt / Summary" description="Brief overview displayed on the blog list.">
              <UTextarea class="w-full" v-model="post.excerpt" :rows="5" placeholder="Once upon a time..." />
            </UFormField>

            <UFormField label="Article Body" required>
              <TiptapEditor 
                v-model="post.content" 
                placeholder="Write your thoughts here..." 
                @update:json="onUpdateJson" 
              />
            </UFormField>
          </div>
        </UCard>
      </div>

      <!-- Sidebar Settings -->
      <div class="lg:col-span-4 space-y-8">
        <UCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-cog-6-tooth" class="text-blue-500 w-5 h-5" />
              Publishing Settings
            </h3>
          </template>
          
          <div class="space-y-6">
            <UFormField label="URL Slug" description="Unique identifier for the post URL.">
              <UInput v-model="post.slug" placeholder="my-awesome-post" icon="i-heroicons-link" />
            </UFormField>

            <UFormField label="Cover Image">
              <ImageUpload
                v-model="post.cover_url"
                bucket="projects"
                class="w-full"
              />
            </UFormField>

            <USeparator />

            <div class="flex items-center justify-between py-2">
              <div class="flex flex-col">
                <span class="text-sm font-semibold">Publish Status</span>
                <UBadge :color="post.published ? 'primary' : 'neutral'" variant="soft">
                  {{ post.published ? 'Published' : 'Draft' }}
                </UBadge>
              </div>
              <USwitch v-model="post.published" />
            </div>

            <UAlert
              v-if="post.published"
              color="primary"
              variant="soft"
              title="Post is Live"
              description="This article will be visible to everyone on your site."
              icon="i-heroicons-globe-alt"
              class="rounded-xl"
            />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
