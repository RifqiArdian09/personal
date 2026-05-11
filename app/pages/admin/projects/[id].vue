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
const pageTitle = computed(() => isNew ? 'Create Project' : 'Edit Project')

const loading = ref(false)
const saving = ref(false)

const project = ref({
  id: '',
  title: '',
  description: '',
  content: '',
  status: 'Solo Project',
  thumbnail_url: '',
  github_url: '',
  demo_url: '',
  date: '',
  featured: false,
  sort_order: 0
})

const techTags = ref<any[]>([])
const teamMembers = ref<any[]>([])
const projectImages = ref<any[]>([])

const fetchProject = async () => {
  if (isNew) return
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_tech (*),
        project_team_members (*),
        project_images (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    if (data) {
      const { project_tech, project_team_members, project_images, ...projectData } = data as any
      project.value = projectData
      techTags.value = project_tech || []
      teamMembers.value = project_team_members || []
      projectImages.value = project_images || []
    }
  } catch (e: any) {
    toast.add({ title: 'Error fetching project', description: e.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  try {
    saving.value = true
    
    if (isNew && !project.value.id) {
      project.value.id = project.value.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    }

    const { error: projectError } = await supabase
      .from('projects')
      .upsert(project.value)
    
    if (projectError) throw projectError

    // Save related tables
    if (!isNew) {
      await supabase.from('project_tech').delete().eq('project_id', project.value.id)
      await supabase.from('project_team_members').delete().eq('project_id', project.value.id)
      await supabase.from('project_images').delete().eq('project_id', project.value.id)
    }

    if (techTags.value.length > 0) {
      await supabase.from('project_tech').insert(techTags.value.map(t => ({ 
        project_id: project.value.id, 
        tech_name: t.tech_name,
        sort_order: t.sort_order 
      })))
    }
    if (teamMembers.value.length > 0) {
      await supabase.from('project_team_members').insert(teamMembers.value.map(t => ({ 
        project_id: project.value.id, 
        username: t.username,
        github_url: t.github_url,
        sort_order: t.sort_order 
      })))
    }
    if (projectImages.value.length > 0) {
      await supabase.from('project_images').insert(projectImages.value.map(t => ({ 
        project_id: project.value.id, 
        image_url: t.image_url,
        caption: t.caption,
        sort_order: t.sort_order 
      })))
    }

    toast.add({ title: 'Project saved successfully', color: 'primary', icon: 'i-heroicons-check-circle' })
    router.push('/admin/projects')
  } catch (e: any) {
    toast.add({ title: 'Error saving project', description: e.message, color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    saving.value = false
  }
}

const addTechTag = () => {
  techTags.value.push({ tech_name: '', sort_order: techTags.value.length })
}

const addTeamMember = () => {
  teamMembers.value.push({ username: '', github_url: '', sort_order: teamMembers.value.length })
}

const addProjectImage = () => {
  projectImages.value.push({ image_url: '', caption: '', sort_order: projectImages.value.length })
}

onMounted(() => {
  fetchProject()
})
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
            <UIcon name="i-heroicons-briefcase" class="text-teal-500 w-6 h-6" />
            {{ pageTitle }}
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ isNew ? 'Showcase your latest work.' : `Editing: ${project.title || 'Project'}` }}
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
          label="Save Project"
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
              <UIcon name="i-heroicons-document-text" class="text-teal-500 w-5 h-5" />
              Project Details
            </h3>
          </template>
          
          <div v-if="loading" class="space-y-6">
            <USkeleton class="h-12 w-full" />
            <USkeleton class="h-96 w-full" />
          </div>
          <div v-else class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Project ID / Slug" required description="Unique URL handle (e.g. ecommerce-app)">
                <UInput class="w-full" v-model="project.id" :disabled="!isNew" placeholder="project-slug" />
              </UFormField>
              <UFormField label="Project Title" required>
                <UInput class="w-full" v-model="project.title" placeholder="Stunning Project Name" />
              </UFormField>
            </div>

            <UFormField label="Short Overview" description="Brief intro shown on cards.">
              <UTextarea class="w-full" v-model="project.description" :rows="3" placeholder="What is this project about?" />
            </UFormField>

            <UFormField label="Full Case Study / Description">
              <TiptapEditor v-model="project.content" placeholder="Describe the process, tech used, and outcomes..." />
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-8">
              <UFormField label="GitHub Repository URL">
                <UInput class="w-full" v-model="project.github_url" placeholder="https://github.com/..." icon="i-simple-icons-github" />
              </UFormField>
              <UFormField label="Live Demo URL">
                <UInput class="w-full" v-model="project.demo_url" placeholder="https://..." icon="i-heroicons-globe-alt" />
              </UFormField>
            </div>
          </div>
        </UCard>

        <!-- Dynamic Sections -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-heroicons-cpu-chip" class="text-teal-500 w-5 h-5" />
                Technologies Used
              </h3>
              <UButton icon="i-heroicons-plus" size="xs" color="primary" variant="soft" label="Add Tech" class="rounded-lg" @click="addTechTag" />
            </div>
          </template>
          <div class="space-y-3">
            <div v-for="(tech, index) in techTags" :key="index" class="flex gap-3 items-center group">
              <UInput v-model="tech.tech_name" placeholder="e.g. Nuxt.js" class="flex-1" />
              <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" class="opacity-0 group-hover:opacity-100 transition-opacity" @click="techTags.splice(index, 1)" />
            </div>
            <div v-if="techTags.length === 0" class="text-center py-4 text-slate-400 text-sm italic">
              No technologies added yet.
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-heroicons-photo" class="text-teal-500 w-5 h-5" />
                Project Gallery
              </h3>
              <UButton icon="i-heroicons-plus" size="xs" color="primary" variant="soft" label="Add Image" class="rounded-lg" @click="addProjectImage" />
            </div>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(img, index) in projectImages" :key="index" class="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 relative group">
              <UButton 
                icon="i-heroicons-x-mark" 
                color="error" 
                variant="soft" 
                size="xs" 
                class="absolute -top-2 -right-2 z-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" 
                @click="projectImages.splice(index, 1)" 
              />
              <ImageUpload v-model="img.image_url" bucket="projects" />
              <UInput v-model="img.caption" placeholder="Image caption..." size="sm" variant="none" class="border-b border-transparent focus:border-primary-500 rounded-none px-0" />
            </div>
            <div v-if="projectImages.length === 0" class="col-span-full text-center py-8 text-slate-400 text-sm">
              <UIcon name="i-heroicons-photo" class="w-12 h-12 mx-auto mb-2 opacity-10" />
              <p>Add screenshots or mockups of your project.</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4 space-y-8">
        <UCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-adjustments-horizontal" class="text-teal-500 w-5 h-5" />
              Project Metadata
            </h3>
          </template>
          <div class="space-y-6">
            <UFormField label="Status">
              <USelect class="w-full" v-model="project.status" :items="['Solo Project', 'Team Project']" />
            </UFormField>
            
            <UFormField label="Completion Date" description="e.g. Summer 2024">
              <UInput class="w-full" v-model="project.date" placeholder="May 2024" icon="i-heroicons-calendar" />
            </UFormField>

            <UFormField label="Sort Order" description="Higher numbers appear later.">
              <UInput class="w-full" v-model="project.sort_order" type="number" />
            </UFormField>

            <USeparator />

            <div class="flex items-center justify-between py-2">
              <div class="flex flex-col">
                <span class="text-sm font-semibold">Featured Project</span>
                <span class="text-xs text-slate-500">Show on main highlights</span>
              </div>
              <USwitch v-model="project.featured" color="primary" />
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-photo" class="text-teal-500 w-5 h-5" />
              Project Thumbnail
            </h3>
          </template>
          <div class="space-y-4">
            <ImageUpload
              v-model="project.thumbnail_url"
              bucket="projects"
              class="w-full"
            />
            <p class="text-[10px] text-slate-500 text-center">
              Main image used for the project card in lists.
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-heroicons-users" class="text-teal-500 w-5 h-5" />
                Team Members
              </h3>
              <UButton icon="i-heroicons-plus" size="xs" color="neutral" variant="ghost" class="rounded-lg" @click="addTeamMember" />
            </div>
          </template>
          <div class="space-y-4">
            <div v-for="(member, index) in teamMembers" :key="index" class="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 relative group">
              <UButton 
                icon="i-heroicons-trash" 
                color="error" 
                variant="ghost" 
                size="xs" 
                class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                @click="teamMembers.splice(index, 1)" 
              />
              <UInput v-model="member.username" placeholder="Name" size="sm" class="bg-white dark:bg-slate-900" />
              <UInput v-model="member.github_url" placeholder="GitHub URL" size="sm" icon="i-simple-icons-github" />
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
