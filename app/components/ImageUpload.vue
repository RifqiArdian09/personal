<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  bucket: 'profile' | 'projects' | 'certificates' | 'icons'
  label?: string
}>()

const emit = defineEmits(['update:modelValue'])

const supabase = useSupabaseClient()
const toast = useToast()
const uploading = ref(false)

const handleUpload = async (event: any) => {
  try {
    uploading.value = true
    const file = event.target.files[0]
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from(props.bucket)
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from(props.bucket)
      .getPublicUrl(filePath)

    emit('update:modelValue', data.publicUrl)
    toast.add({ title: 'Image uploaded successfully', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Upload failed', description: e.message, color: 'error' })
  } finally {
    uploading.value = false
  }
}

const removeImage = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="space-y-2">
    <p v-if="label" class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ label }}</p>
    
    <div v-if="modelValue" class="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 group">
      <img :src="modelValue" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <UButton
          icon="i-heroicons-trash"
          color="error"
          variant="soft"
          @click="removeImage"
        >
          Remove
        </UButton>
      </div>
    </div>

    <div v-else class="flex items-center justify-center w-full">
      <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:hover:border-slate-500">
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <UIcon v-if="!uploading" name="i-heroicons-cloud-arrow-up" class="w-8 h-8 mb-3 text-slate-400" />
          <p v-if="!uploading" class="mb-2 text-sm text-slate-500 dark:text-slate-400">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p v-if="!uploading" class="text-xs text-slate-500 dark:text-slate-400">PNG, JPG or WEBP</p>
          
          <div v-if="uploading" class="flex flex-col items-center">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 mb-3 text-teal-500 animate-spin" />
            <p class="text-sm text-teal-500">Uploading...</p>
          </div>
        </div>
        <input type="file" class="hidden" accept="image/*" @change="handleUpload" :disabled="uploading" />
      </label>
    </div>
  </div>
</template>
