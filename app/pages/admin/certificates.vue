<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const supabase = useSupabaseClient()
const toast = useToast()

const { data: certificates, pending: loading, refresh: fetchCertificates } = await useAsyncData('certificates', async () => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data || []
}, {
  default: () => []
})

const page = ref(1)
const itemsPerPage = 5

const paginatedCertificates = computed(() => {
  if (!certificates.value) return []
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return certificates.value.slice(start, end)
})

const isOpen = ref(false)
const editingCert = ref<any>(null)

const form = ref({
  title: '',
  issuer: '',
  image_url: '',
  verification_url: '',
  issued_at: '',
  sort_order: 0
})

const openModal = (cert: any = null) => {
  if (cert) {
    editingCert.value = cert
    form.value = { ...cert }
  } else {
    editingCert.value = null
    form.value = { 
      title: '', 
      issuer: '', 
      image_url: '', 
      verification_url: '', 
      issued_at: new Date().toISOString().split('T')[0], 
      sort_order: certificates.value?.length || 0 
    }
  }
  isOpen.value = true
}

const saveCert = async () => {
  try {
    loading.value = true
    if (editingCert.value) {
      const { error } = await supabase
        .from('certificates')
        .update(form.value)
        .eq('id', editingCert.value.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('certificates')
        .insert(form.value)
      if (error) throw error
    }
    
    toast.add({ title: `Certificate ${editingCert.value ? 'updated' : 'added'} successfully`, color: 'success', icon: 'i-heroicons-check-circle' })
    isOpen.value = false
    fetchCertificates()
  } catch (e: any) {
    toast.add({ title: 'Error saving certificate', description: e.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const isDeleteModalOpen = ref(false)
const certToDelete = ref<string | null>(null)

const confirmDelete = (id: string) => {
  certToDelete.value = id
  isDeleteModalOpen.value = true
}

const deleteCert = async () => {
  if (!certToDelete.value) return
  try {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certToDelete.value)
    if (error) throw error
    toast.add({ title: 'Certificate deleted', color: 'success', icon: 'i-heroicons-check-circle' })
    fetchCertificates()
  } catch (e: any) {
    toast.add({ title: 'Error deleting certificate', description: e.message, color: 'error' })
  } finally {
    isDeleteModalOpen.value = false
    certToDelete.value = null
  }
}

const columns = [
  { accessorKey: 'image_url', header: 'Image' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'issuer', header: 'Issuer' },
  { accessorKey: 'issued_at', header: 'Date' },
  { accessorKey: 'actions', header: 'Actions' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Certificates</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Add or update your professional achievements.</p>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        size="lg"
        class="rounded-xl shadow-lg shadow-primary-500/20 px-6"
        @click="openModal()"
      >
        Add New
      </UButton>
    </div>

    <ClientOnly>
      <UCard :ui="{ body: 'p-0', rounded: 'rounded-2xl' }" class="overflow-hidden border-slate-200 dark:border-slate-800">
        <UTable
          :data="paginatedCertificates"
          :columns="columns"
          :loading="loading"
          class="w-full"
        >
          <template #image_url-cell="{ row }">
            <img v-if="row.original.image_url" :src="row.original.image_url" class="w-16 h-10 object-cover rounded-lg" :alt="row.original.title" />
            <div v-else class="w-16 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-4 h-4 text-slate-400" />
            </div>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-heroicons-pencil-square"
                class="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                @click="openModal(row.original)"
              />
              <UButton
                variant="ghost" 
                color="error"
                icon="i-heroicons-trash"
                class="rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                @click="confirmDelete(row.original.id)"
              />
            </div>
          </template>
        </UTable>
        <template #footer>
          <div class="flex justify-end p-4">
            <UPagination v-model:page="page" :total="certificates?.length || 0" :items-per-page="itemsPerPage" />
          </div>
        </template>
      </UCard>
    </ClientOnly>

    <UModal v-model:open="isOpen">
      <template #content>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <h3 class="text-lg font-bold">{{ editingCert ? 'Edit' : 'Add' }} Certificate</h3>
          </template>

        <div class="space-y-4 py-4">
          <UFormField label="Title">
            <UInput class="w-full" v-model="form.title" placeholder="Fullstack Developer Certificate" />
          </UFormField>
          <UFormField label="Issuer">
            <UInput class="w-full" v-model="form.issuer" placeholder="Udemy / Google" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Issue Date">
              <UInput class="w-full" v-model="form.issued_at" type="date" />
            </UFormField>
            <UFormField label="Sort Order">
              <UInput class="w-full" v-model="form.sort_order" type="number" />
            </UFormField>
          </div>
          <ImageUpload
            v-model="form.image_url"
            bucket="certificates"
            label="Certificate Image"
          />
          <UFormField label="Verification URL">
            <UInput class="w-full" v-model="form.verification_url" placeholder="https://..." />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="ghost" color="neutral" @click="isOpen = false">Cancel</UButton>
            <UButton color="primary" @click="saveCert">Save</UButton>
          </div>
        </template>
      </UCard>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <UCard :ui="{ 
          ring: '', 
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          body: { padding: 'p-5 sm:p-6' },
          footer: { padding: 'p-4 sm:px-6', background: 'bg-slate-50 dark:bg-slate-800/50' }
        }">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Hapus Sertifikat?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus sertifikat ini? Data yang dihapus tidak dapat dipulihkan kembali.
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
                @click="deleteCert" 
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
