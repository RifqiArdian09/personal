<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const { locale, locales, setLocale } = useI18n()
const colorMode = useColorMode()
const toast = useToast()

const selectedLocale = ref(locale.value)

// Safely map locales for USelect
const localeOptions = computed(() => {
  const list = unref(locales)
  if (Array.isArray(list)) {
    return list.map(l => {
      // Handle both string and object locales
      if (typeof l === 'string') return { label: l, value: l }
      return { label: (l as any).name || (l as any).code, value: (l as any).code }
    })
  }
  return []
})

const updateLanguage = async (val: any) => {
  await setLocale(val)
  toast.add({ title: 'Language updated', color: 'primary', icon: 'i-heroicons-language' })
}

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  toast.add({ 
    title: `Theme switched to ${colorMode.value === 'dark' ? 'Light' : 'Dark'}`, 
    color: 'primary',
    icon: colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'
  })
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 pb-12">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-cog-6-tooth" class="text-slate-500 w-6 h-6" />
          System Settings
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your admin experience and site-wide defaults.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <UCard>
        <template #header>
          <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-language" class="text-primary-500 w-5 h-5" />
            Localization
          </h3>
        </template>

        <div class="space-y-6">
          <UFormField label="Default Language" description="Select the primary language for the administrative panel.">
            <USelect
              v-model="selectedLocale"
              :items="localeOptions"
              class="w-full sm:w-64"
              @update:model-value="updateLanguage"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-swatch" class="text-blue-500 w-5 h-5" />
            Appearance
          </h3>
        </template>

        <div class="flex items-center justify-between py-2">
          <div>
            <p class="font-semibold text-slate-900 dark:text-white">Interface Theme</p>
            <p class="text-sm text-slate-500">Currently using {{ colorMode.value }} mode</p>
          </div>
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            color="neutral"
            variant="soft"
            class="rounded-xl"
            @click="toggleTheme"
          >
            Switch to {{ colorMode.value === 'dark' ? 'Light' : 'Dark' }}
          </UButton>
        </div>
      </UCard>

      <UCard class="border-error-200 dark:border-error-900/30 bg-error-50/10 dark:bg-error-900/5">
        <template #header>
          <h3 class="font-bold text-error-600 dark:text-error-400 flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" />
            Maintenance
          </h3>
        </template>
        
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p class="text-sm text-error-600 dark:text-error-400 max-w-md">
            Clearing the cache will force the application to re-fetch all configuration data from the server.
          </p>
          <UButton color="error" variant="soft" class="rounded-xl px-6">Clear Cache</UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
