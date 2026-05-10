<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const supabase = useSupabaseClient()
const toast = useToast()

const { data: projects, pending: loading, refresh: fetchProjects } = await useAsyncData('projects', async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data || []
}, {
  default: () => []
})

const page = ref(1)
const itemsPerPage = 5

const paginatedProjects = computed(() => {
  if (!projects.value) return []
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return projects.value.slice(start, end)
})

const isDeleteModalOpen = ref(false)
const projectToDelete = ref<string | null>(null)

const confirmDelete = (id: string) => {
  projectToDelete.value = id
  isDeleteModalOpen.value = true
}

const deleteProject = async () => {
  if (!projectToDelete.value) return
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectToDelete.value)
    if (error) throw error
    toast.add({ title: 'Project deleted successfully', color: 'success', icon: 'i-heroicons-check-circle' })
    fetchProjects()
  } catch (e: any) {
    toast.add({ title: 'Error deleting project', description: e.message, color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    isDeleteModalOpen.value = false
    projectToDelete.value = null
  }
}

const toggleFeatured = async (project: any) => {
  try {
    const newValue = !project.featured
    const { error } = await supabase
      .from('projects')
      .update({ featured: newValue })
      .eq('id', project.id)
    if (error) throw error
    toast.add({ title: `Project ${newValue ? 'featured' : 'unfeatured'} successfully`, color: 'success' })
    fetchProjects()
  } catch (e: any) {
    toast.add({ title: 'Error updating project', description: e.message, color: 'error' })
  }
}

const columns = [
  { accessorKey: 'thumbnail_url', header: 'Image' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'featured', header: 'Featured' },
  { accessorKey: 'actions', header: 'Actions' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold">Manage Projects</h2>
      <UButton
        to="/admin/projects/new"
        color="primary"
        icon="i-heroicons-plus"
      >
        Add Project
      </UButton>
    </div>

    <ClientOnly>
      <UCard :ui="{ body: 'p-0', rounded: 'rounded-2xl' }" class="overflow-hidden border-slate-200 dark:border-slate-800">
        <UTable
          :data="paginatedProjects"
          :columns="columns"
          :loading="loading"
          class="w-full"
        >
          <template #thumbnail_url-cell="{ row }">
            <img v-if="row.original.thumbnail_url" :src="row.original.thumbnail_url" class="w-16 h-10 object-cover rounded" :alt="row.original.title" />
            <div v-else class="w-16 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-4 h-4 text-slate-400" />
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="row.original.status === 'Solo Project' ? 'info' : 'primary'" variant="soft">
              {{ row.original.status }}
            </UBadge>
          </template>

          <template #featured-cell="{ row }">
            <UButton
              variant="ghost"
              color="neutral"
              :icon="row.original.featured ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
              @click="toggleFeatured(row.original)"
            />
          </template>

          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-heroicons-pencil-square"
                :to="`/admin/projects/${row.original.id}`"
              />
              <UButton
                variant="ghost"
                color="error"
                icon="i-heroicons-trash"
                @click="confirmDelete(row.original.id)"
              />
            </div>
          </template>
        </UTable>
        <template #footer>
          <div class="flex justify-end">
            <UPagination v-model:page="page" :total="projects?.length || 0" :items-per-page="itemsPerPage" />
          </div>
        </template>
      </UCard>
    </ClientOnly>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Confirm Deletion</h3>
          </template>
          <div class="py-4">
            <p class="text-slate-500 dark:text-slate-400">Are you sure you want to delete this project? This action cannot be undone.</p>
          </div>
          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton variant="ghost" color="neutral" @click="isDeleteModalOpen = false">Cancel</UButton>
              <UButton color="error" @click="deleteProject">Delete</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
