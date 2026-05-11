<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const supabase = useSupabaseClient<any>()
const toast = useToast()

const loading = ref(false)
const posts = ref<any[]>([])

const fetchPosts = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    posts.value = data || []
  } catch (e: any) {
    toast.add({ title: 'Error fetching posts', description: e.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const isDeleteModalOpen = ref(false)
const postToDelete = ref<string | null>(null)

const confirmDelete = (id: string) => {
  postToDelete.value = id
  isDeleteModalOpen.value = true
}

const deletePost = async () => {
  if (!postToDelete.value) return
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postToDelete.value)
    if (error) throw error
    toast.add({ title: 'Post deleted', color: 'success', icon: 'i-heroicons-check-circle' })
    fetchPosts()
  } catch (e: any) {
    toast.add({ title: 'Error deleting post', description: e.message, color: 'error' })
  } finally {
    isDeleteModalOpen.value = false
    postToDelete.value = null
  }
}

onMounted(() => {
  fetchPosts()
})

const page = ref(1)
const itemsPerPage = 5

const paginatedPosts = computed(() => {
  if (!posts.value) return []
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return posts.value.slice(start, end)
})

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'published', header: 'Status' },
  { accessorKey: 'published_at', header: 'Published At' },
  { accessorKey: 'actions', header: 'Actions' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-document-text" class="text-blue-500 w-6 h-6" />
          Manage Blog Posts
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Write and organize your thoughts and articles.
        </p>
      </div>
      <UButton
        to="/admin/blog/new"
        color="primary"
        icon="i-heroicons-plus"
        size="lg"
        class="rounded-xl px-5 shadow-lg shadow-teal-500/20 transition-transform hover:scale-105"
      >
        Write Post
      </UButton>
    </div>

    <ClientOnly>
      <UCard :ui="{ body: 'p-0' }" class="rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800">
        <UTable
          :data="paginatedPosts"
          :columns="columns"
          :loading="loading"
          class="w-full"
        >
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-slate-400" />
              </div>
              <p class="text-base font-semibold text-slate-900 dark:text-white">No blog posts found</p>
              <p class="text-sm text-slate-500 mt-1 max-w-sm">Start writing your first article to share your thoughts.</p>
              <UButton to="/admin/blog/new" color="primary" variant="soft" icon="i-heroicons-plus" class="mt-4 rounded-xl">Write Post</UButton>
            </div>
          </template>

          <template #published-cell="{ row }">
            <UBadge :color="row.original.published ? 'primary' : 'neutral'" variant="soft" class="rounded-lg">
              {{ row.original.published ? 'Published' : 'Draft' }}
            </UBadge>
          </template>

          <template #published_at-cell="{ row }">
            <span v-if="row.original.published_at" class="text-sm">{{ new Date(row.original.published_at).toLocaleDateString() }}</span>
            <span v-else class="text-slate-400">-</span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-heroicons-pencil-square"
                :to="`/admin/blog/${row.original.id}`"
                class="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              />
              <UButton
                variant="ghost"
                color="error"
                icon="i-heroicons-trash"
                @click="confirmDelete(row.original.id)"
                class="rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              />
            </div>
          </template>
        </UTable>
        <template #footer>
          <div class="flex justify-end p-4">
            <UPagination v-model:page="page" :total="posts?.length || 0" :items-per-page="itemsPerPage" />
          </div>
        </template>
      </UCard>
    </ClientOnly>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <UCard :ui="{
          body: 'p-5 sm:p-6',
          footer: 'p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50'
        }">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Hapus Postingan?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus postingan blog ini? Postingan yang dihapus tidak dapat dikembalikan lagi.
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton 
                variant="ghost" 
                color="neutral" 
                label="Batal"
                class="rounded-xl px-5"
                @click="isDeleteModalOpen = false" 
              />
              <UButton 
                color="error" 
                label="Hapus Permanen"
                icon="i-heroicons-trash"
                class="rounded-xl px-5 shadow-lg shadow-red-500/20"
                @click="deletePost" 
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
