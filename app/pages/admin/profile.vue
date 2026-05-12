<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const supabase = useSupabaseClient<any>()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const profile = ref({
  name: '',
  role: '',
  bio: '',
  profile_image_url: '',
  cv_url: '',
  github: '',
  linkedin: '',
  instagram: '',
  email: '',
  whatsapp: ''
})


const fetchProfile = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    if (data) {
      profile.value = { ...profile.value, ...(data as any) }
    }
  } catch (e: any) {
    toast.add({ title: 'Error fetching profile', description: e.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  try {
    saving.value = true
    const { error } = await supabase
      .from('profile')
      .upsert({
        ...profile.value,
        updated_at: new Date().toISOString()
      } as any)
    
    if (error) throw error
    toast.add({ title: 'Profile updated successfully', color: 'success', icon: 'i-heroicons-check-circle' })
  } catch (e: any) {
    toast.add({ title: 'Error saving profile', description: e.message, color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="space-y-8 pb-12 max-w-5xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-user-circle" class="text-indigo-500 w-6 h-6" />
          Profile Settings
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your identity and how people can reach you.
        </p>
      </div>
      <UButton
        color="primary"
        size="lg"
        icon="i-heroicons-check"
        :loading="saving"
        class="rounded-xl px-8 shadow-lg shadow-primary-500/20 transition-transform hover:scale-105"
        @click="saveProfile"
      >
        Save Changes
      </UButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Sidebar Info -->
      <div class="lg:col-span-4 space-y-8">
        <UCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-camera" class="text-indigo-500 w-5 h-5" />
              Display Photo
            </h3>
          </template>
          <div class="flex flex-col items-center gap-6 py-2">
            <ImageUpload
              v-model="profile.profile_image_url"
              bucket="profile"
              class="w-full"
            />
            <p class="text-[11px] text-slate-500 text-center leading-relaxed">
              Use a professional square image (min. 400px). Supports JPG, PNG.
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-briefcase" class="text-indigo-500 w-5 h-5" />
              Professional Role
            </h3>
          </template>
          <UFormField label="Title / Tagline" description="Displayed under your name">
            <UInput class="w-full" v-model="profile.role" placeholder="e.g. Fullstack Developer" />
          </UFormField>
        </UCard>
      </div>

      <!-- Main Form -->
      <div class="lg:col-span-8 space-y-8">
        <UCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-information-circle" class="text-indigo-500 w-5 h-5" />
              General Information
            </h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Full Name" class="md:col-span-1">
              <UInput class="w-full" v-model="profile.name" placeholder="John Doe" />
            </UFormField>
            <UFormField label="CV / Resume Link" class="md:col-span-1">
              <UInput class="w-full" v-model="profile.cv_url" placeholder="https://..." icon="i-heroicons-link" />
            </UFormField>
            <UFormField label="Biography / About" class="md:col-span-2">
              <UTextarea class="w-full" v-model="profile.bio" :rows="6" placeholder="Write a professional summary..." />
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-at-symbol" class="text-indigo-500 w-5 h-5" />
              Social &amp; Contact Presence
            </h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Official Email">
              <UInput class="w-full" v-model="profile.email" icon="i-heroicons-envelope" placeholder="email@example.com" />
            </UFormField>
            <UFormField label="WhatsApp Number">
              <UInput class="w-full" v-model="profile.whatsapp" icon="i-heroicons-phone" placeholder="+628..." />
            </UFormField>
            <UFormField label="GitHub Profile">
              <UInput class="w-full" v-model="profile.github" icon="i-simple-icons-github" placeholder="github.com/..." />
            </UFormField>
            <UFormField label="LinkedIn Profile">
              <UInput class="w-full" v-model="profile.linkedin" icon="i-simple-icons-linkedin" placeholder="linkedin.com/in/..." />
            </UFormField>
            <UFormField label="Instagram Profile">
              <UInput class="w-full" v-model="profile.instagram" icon="i-simple-icons-instagram" placeholder="instagram.com/..." />
            </UFormField>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
