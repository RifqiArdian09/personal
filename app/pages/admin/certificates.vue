<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const supabase = useSupabaseClient<any>()
const toast = useToast()

const { data: certificates, pending: loading, refresh: fetchCertificates } = await useAsyncData('certificates', async () => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .order('created_at', { ascending: false })
  
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
  issued_at: ''
})

const openModal = (cert: any = null) => {
  if (cert) {
    editingCert.value = cert
    // Spread but exclude sort_order from display
    form.value = {
      title: cert.title,
      issuer: cert.issuer,
      image_url: cert.image_url || '',
      verification_url: cert.verification_url || '',
      issued_at: cert.issued_at || ''
    }
  } else {
    editingCert.value = null
    form.value = { 
      title: '', 
      issuer: '', 
      image_url: '', 
      verification_url: '', 
      issued_at: new Date().toISOString().split('T')[0] ?? ''
    }
  }
  isOpen.value = true
}

const saveCert = async () => {
  try {
    saving.value = true
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
    saving.value = false
  }
}

const isDeleteModalOpen = ref(false)
const saving = ref(false)
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
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-academic-cap" class="text-orange-500 w-6 h-6" />
          Manage Certificates
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add or update your professional achievements.
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        size="lg"
        class="rounded-xl px-5 shadow-lg shadow-primary-500/20 transition-transform hover:scale-105"
        @click="openModal()"
      >
        Add New
      </UButton>
    </div>

    <ClientOnly>
      <UCard :ui="{ body: 'p-0' }" class="rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800">
        <UTable
          :data="paginatedCertificates"
          :columns="columns"
          :loading="loading"
          class="w-full"
        >
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                <UIcon name="i-heroicons-academic-cap" class="w-8 h-8 text-slate-400" />
              </div>
              <p class="text-base font-semibold text-slate-900 dark:text-white">No certificates found</p>
              <p class="text-sm text-slate-500 mt-1 max-w-sm">Showcase your achievements by adding a new certificate.</p>
              <UButton @click="openModal()" color="primary" variant="soft" icon="i-heroicons-plus" class="mt-4 rounded-xl">Add Certificate</UButton>
            </div>
          </template>

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
        <div class="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden" style="max-height: 90vh;">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon :name="editingCert ? 'i-heroicons-pencil-square' : 'i-heroicons-plus-circle'" class="text-teal-500 w-5 h-5" />
              {{ editingCert ? 'Edit' : 'Add' }} Certificate
            </h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              size="sm"
              class="rounded-lg"
              @click="isOpen = false"
            />
          </div>

          <!-- Scrollable Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <UFormField label="Title">
              <UInput class="w-full" v-model="form.title" placeholder="Fullstack Developer Certificate" icon="i-heroicons-document-text" />
            </UFormField>
            <UFormField label="Issuer">
              <UInput class="w-full" v-model="form.issuer" placeholder="Udemy / Google" icon="i-heroicons-building-office" />
            </UFormField>
            <UFormField label="Issue Date">
              <UInput class="w-full" v-model="form.issued_at" type="date" />
            </UFormField>
            <UFormField label="Certificate Image">
              <ImageUpload
                v-model="form.image_url"
                bucket="certificates"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Verification URL">
              <UInput class="w-full" v-model="form.verification_url" placeholder="https://..." icon="i-heroicons-link" />
            </UFormField>
          </div>

          <!-- Sticky Footer -->
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
            <UButton variant="ghost" color="neutral" class="rounded-xl px-5" @click="isOpen = false">Batal</UButton>
            <UButton color="primary" icon="i-heroicons-check" class="rounded-xl px-5 shadow-lg shadow-teal-500/20" @click="saveCert">
              {{ editingCert ? 'Update' : 'Simpan' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

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
