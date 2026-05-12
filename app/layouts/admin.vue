<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const supabase = useSupabaseClient<any>()
const user = useSupabaseUser()
const router = useRouter()
const colorMode = useColorMode()
const route = useRoute()

const open = ref(true)
const isMobileOpen = ref(false)
const isLogoutModalOpen = ref(false)

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/admin/login')
}

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/admin'
  },
  {
    label: 'Profile',
    icon: 'i-heroicons-user-circle',
    to: '/admin/profile'
  },

  {
    label: 'Projects',
    icon: 'i-heroicons-briefcase',
    to: '/admin/projects'
  },
  {
    label: 'Certificates',
    icon: 'i-heroicons-academic-cap',
    to: '/admin/certificates'
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/admin/settings'
  }
])

const userItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'View Site',
      icon: 'i-heroicons-globe-alt',
      to: '/'
    }
  ],
  [
    {
      label: 'Appearance',
      icon: 'i-heroicons-swatch',
      children: [
        {
          label: 'Light',
          icon: 'i-heroicons-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onUpdateChecked(checked: boolean) {
            if (checked) colorMode.preference = 'light'
          }
        },
        {
          label: 'Dark',
          icon: 'i-heroicons-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onUpdateChecked(checked: boolean) {
            if (checked) colorMode.preference = 'dark'
          }
        }
      ]
    }
  ],
  [
    {
      label: 'Log out',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      onSelect: () => {
        isLogoutModalOpen.value = true
      }
    }
  ]
])

const pageTitle = computed(() => {
  const item = navItems.value.find(item => route.path.startsWith(item.to as string))
  return item?.label || 'Dashboard'
})
</script>

<template>
  <div class="flex h-screen bg-slate-50 dark:bg-[#020617] font-['Space_Grotesk'] overflow-hidden">
    <!-- Sidebar for Desktop -->
    <USidebar
      v-model="open"
      collapsible="icon"
      class="hidden lg:flex bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-20"
      :ui="{
        container: 'h-full flex flex-col',
        inner: 'flex-1 overflow-y-auto px-3 py-4 space-y-4',
        body: 'p-0'
      }"
    >
      <template #header>
        <div class="p-4 flex items-center gap-3 overflow-hidden border-b border-slate-100 dark:border-slate-800/50">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
            <span class="text-white font-bold text-lg">A</span>
          </div>
          <div v-if="open" class="flex flex-col min-w-0">
            <span class="font-bold text-slate-900 dark:text-white truncate leading-tight">Admin Panel</span>
            <span class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Portfolio CMS</span>
          </div>
        </div>
      </template>

      <template #default="{ state }">
        <UNavigationMenu
          :key="state"
          :items="navItems"
          orientation="vertical"
          variant="pill"
          :ui="{
            root: 'space-y-1',
            link: 'px-3 py-2 rounded-xl transition-all duration-200 group text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 aria-[current=page]:bg-teal-500/10 aria-[current=page]:text-teal-600 aria-[current=page]:dark:text-teal-400 aria-[current=page]:font-medium aria-[current=page]:shadow-sm aria-[current=page]:ring-1 aria-[current=page]:ring-teal-500/20',
            linkLeadingIcon: 'w-5 h-5'
          }"
        />
      </template>

      <template #footer>
        <div class="p-3 border-t border-slate-100 dark:border-slate-800/50">
          <ClientOnly>
            <UDropdownMenu
              :items="userItems"
              :content="{ align: 'center', side: 'right', sideOffset: 12 }"
              class="w-full"
            >
              <UButton
                color="neutral"
                variant="ghost"
                class="w-full overflow-hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <template #leading>
                  <UAvatar
                    :src="user?.user_metadata?.avatar_url"
                    :alt="user?.email || ''"
                    size="sm"
                    class="ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                </template>
                <div v-if="open" class="flex flex-col min-w-0 text-left ml-2 flex-1">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{{ user?.email?.split('@')[0] }}</span>
                  <span class="text-[10px] text-slate-500 truncate">{{ user?.email }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-up-down" class="text-slate-400 ms-auto w-4 h-4" />
              </UButton>
            </UDropdownMenu>
          </ClientOnly>
        </div>
      </template>
    </USidebar>

    <!-- Sidebar for Mobile -->
    <USlideover v-model:open="isMobileOpen" title="Admin Navigation">
      <template #content>
        <div class="h-full flex flex-col bg-white dark:bg-[#020617]">
          <div class="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/50">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
              <span class="text-white font-bold text-lg">A</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-slate-900 dark:text-white truncate leading-tight">Admin Panel</span>
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Portfolio CMS</span>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto px-3 py-4">
            <UNavigationMenu
              :items="navItems"
              orientation="vertical"
              variant="pill"
              :ui="{
                root: 'space-y-1',
                link: 'px-3 py-2 rounded-xl transition-all duration-200 group text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 aria-[current=page]:bg-teal-500/10 aria-[current=page]:text-teal-600 aria-[current=page]:dark:text-teal-400 aria-[current=page]:font-medium aria-[current=page]:shadow-sm aria-[current=page]:ring-1 aria-[current=page]:ring-teal-500/20',
                linkLeadingIcon: 'w-5 h-5'
              }"
              @click="isMobileOpen = false"
            />
          </div>

          <div class="p-3 border-t border-slate-100 dark:border-slate-800/50">
            <UDropdownMenu
              :items="userItems"
              :content="{ align: 'center', side: 'right', sideOffset: 12 }"
              class="w-full"
            >
              <UButton
                color="neutral"
                variant="ghost"
                class="w-full overflow-hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <template #leading>
                  <UAvatar
                    :src="user?.user_metadata?.avatar_url"
                    :alt="user?.email || ''"
                    size="sm"
                    class="ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                </template>
                <div class="flex flex-col min-w-0 text-left ml-2 flex-1">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{{ user?.email?.split('@')[0] }}</span>
                  <span class="text-[10px] text-slate-500 truncate">{{ user?.email }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-up-down" class="text-slate-400 ms-auto w-4 h-4" />
              </UButton>
            </UDropdownMenu>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <header class="h-16 shrink-0 flex items-center justify-between px-6 sticky top-0 z-10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div class="flex items-center gap-6">
          <UButton
            icon="i-heroicons-bars-3-bottom-left"
            color="neutral"
            variant="ghost"
            class="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            @click="isMobileOpen = true"
          />
          <UButton
            icon="i-heroicons-bars-3-bottom-left"
            color="neutral"
            variant="ghost"
            class="hidden lg:flex hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            @click="open = !open"
          />
          <nav class="flex items-center gap-2 text-sm text-slate-500">
            <span class="hidden sm:inline">Admin</span>
            <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
            <span class="font-semibold text-slate-900 dark:text-teal-400">{{ pageTitle }}</span>
          </nav>
        </div>
        
        <div class="flex items-center gap-3">
          <UButton
            to="/"
            target="_blank"
            icon="i-heroicons-arrow-top-right-on-square"
            label="Live Site"
            variant="soft"
            color="neutral"
            size="sm"
            class="hidden sm:flex rounded-lg"
          />
          <UColorModeButton class="rounded-lg" />
        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#020617] scroll-smooth">
        <div :key="$route.path" class="p-6 md:p-8 max-w-6xl mx-auto">
          <slot />
        </div>
      </main>
    </div>

    <!-- Logout Confirmation Modal -->
    <UModal v-model:open="isLogoutModalOpen">
      <template #content>
        <UCard :ui="{
          body: 'p-5 sm:p-6',
          footer: 'p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50'
        }">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Keluar dari Admin?</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Anda akan keluar dari sesi administrasi. Anda perlu login kembali untuk mengakses panel ini.
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
                @click="isLogoutModalOpen = false" 
              />
              <UButton 
                color="primary" 
                label="Ya, Keluar"
                icon="i-heroicons-check"
                class="rounded-xl px-5 shadow-lg shadow-teal-500/20"
                @click="handleLogout" 
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
