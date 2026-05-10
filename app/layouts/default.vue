<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

const links = [
  { label: 'Home', to: '/', hash: '', icon: 'i-heroicons-home' },
  { label: 'About', to: '/', hash: '#about', icon: 'i-heroicons-user' },
  { label: 'Projects', to: '/', hash: '#projects', icon: 'i-heroicons-briefcase' },
  { label: 'Certificates', to: '/', hash: '#certificates', icon: 'i-heroicons-academic-cap' },
  { label: 'Blog', to: '/', hash: '#blog', icon: 'i-heroicons-document-text' },
  { label: 'Contact', to: '/', hash: '#contact', icon: 'i-heroicons-envelope' }
]

const isMobileMenuOpen = ref(false)
const scrolled = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 20
    
    // Update Scroll Progress Bar
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrolled_pct = (winScroll / height) * 100
    const scrollBar = document.getElementById('scrollBar')
    if (scrollBar) scrollBar.style.width = scrolled_pct + '%'

    // Toggle Back to Top Button
    const backToTop = document.getElementById('backToTop')
    if (backToTop) {
      if (window.scrollY > 500) {
        backToTop.classList.remove('opacity-0', 'pointer-events-none')
        backToTop.classList.add('opacity-100', 'pointer-events-all')
      } else {
        backToTop.classList.add('opacity-0', 'pointer-events-none')
        backToTop.classList.remove('opacity-100', 'pointer-events-all')
      }
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-surface text-text-primary font-body selection:bg-accent selection:text-white bg-noise">
    <!-- Scroll Progress Bar -->
    <div class="scroll-progress">
      <div class="scroll-progress-bar" id="scrollBar"></div>
    </div>

    <!-- Back to Top Button -->
    <button
      @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
      class="fixed bottom-8 right-8 w-12 h-12 rounded-xl border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)] bg-accent text-white flex items-center justify-center z-[100] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_var(--color-manga-border)] transition-all cursor-pointer opacity-0 pointer-events-none"
      id="backToTop"
    >
      <UIcon name="i-heroicons-arrow-up" class="w-6 h-6" />
    </button>

    <!-- Navbar -->
    <header
      class="fixed top-0 inset-x-0 z-[999] transition-all duration-500"
      :class="scrolled ? 'bg-surface-glass backdrop-blur-xl border-b-[3px] border-manga-border shadow-lg' : 'bg-transparent pt-4'"
    >
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center border-2 border-manga-border shadow-[2px_2px_0px_var(--color-manga-border)] group-hover:rotate-6 transition-transform">
            <span class="text-white font-bold font-display text-lg">R</span>
          </div>
          <span class="font-bold font-display text-xl tracking-tight hidden sm:block">
            <span class="text-accent">{</span>Rifqi<span class="text-accent">.dev}</span>
          </span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="link in links"
            :key="link.label"
            :to="link.hash ? { path: link.to, hash: link.hash } : link.to"
            class="px-4 py-2 text-sm font-bold font-display text-text-secondary hover:text-accent rounded-lg hover:bg-accent-soft transition-all duration-200 flex items-center gap-2"
            active-class="text-accent bg-accent-soft"
          >
            <UIcon :name="link.icon" class="w-4 h-4" />
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <ClientOnly>
            <button
              @click="isDark = !isDark"
              class="w-10 h-10 rounded-xl border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] bg-surface flex items-center justify-center hover:-translate-y-1 hover:shadow-[5px_5px_0px_var(--color-manga-border)] transition-all cursor-pointer active:translate-y-0 active:shadow-none"
              aria-label="Toggle theme"
            >
              <UIcon :name="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'" class="w-5 h-5 text-accent" />
            </button>
          </ClientOnly>

          <!-- Mobile Menu Toggle -->
          <button
            class="md:hidden w-10 h-10 rounded-xl border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] bg-surface flex items-center justify-center hover:-translate-y-1 transition-all cursor-pointer"
            @click="isMobileMenuOpen = true"
          >
            <UIcon name="i-heroicons-bars-3-bottom-right" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]" @click="isMobileMenuOpen = false"></div>
      </Transition>
      <Transition name="modal">
        <div v-if="isMobileMenuOpen" class="fixed top-0 right-0 bottom-0 w-[280px] bg-surface border-l-[4px] border-manga-border z-[999] p-6 flex flex-col shadow-2xl">
          <div class="flex justify-between items-center mb-8 pb-4 border-b-2 border-divider">
            <span class="font-bold font-display text-lg text-accent">Menu</span>
            <button @click="isMobileMenuOpen = false" class="w-10 h-10 rounded-xl border-2 border-manga-border flex items-center justify-center cursor-pointer hover:bg-surface-alt transition-colors">
              <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>
          <nav class="flex flex-col gap-2">
            <NuxtLink
              v-for="link in links"
              :key="link.label"
              :to="link.hash ? { path: link.to, hash: link.hash } : link.to"
              class="text-lg font-bold font-display text-text-primary hover:text-accent transition-all p-4 rounded-xl hover:bg-accent-soft border-2 border-transparent hover:border-manga-border flex items-center gap-3"
              @click="isMobileMenuOpen = false"
            >
              <UIcon :name="link.icon" class="w-6 h-6 text-accent" />
              {{ link.label }}
            </NuxtLink>
          </nav>

          <div class="mt-auto pt-8 border-t-2 border-divider flex justify-center gap-4">
             <a href="https://github.com/rifqiardian09" target="_blank" class="w-11 h-11 rounded-xl border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] flex items-center justify-center hover:-translate-y-1 transition-all bg-surface">
              <UIcon name="i-simple-icons-github" class="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/in/rifqiardian" target="_blank" class="w-11 h-11 rounded-xl border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] flex items-center justify-center hover:-translate-y-1 transition-all bg-surface">
              <UIcon name="i-simple-icons-linkedin" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-surface-alt border-t-[4px] border-manga-border relative overflow-hidden">
      <!-- Decorative pattern -->
      <div class="absolute inset-0 opacity-5 pointer-events-none bg-hero-pattern"></div>
      
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div class="flex flex-col md:flex-row items-center justify-between gap-12">
          <div class="flex flex-col items-center md:items-start gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)]">
                <span class="text-white font-bold text-lg font-display">R</span>
              </div>
              <span class="font-bold font-display text-2xl tracking-tight">Rifqi Ardian</span>
            </div>
            <p class="text-text-secondary text-sm font-mono max-w-[300px] text-center md:text-left">
              Crafting premium digital experiences with attention to detail and modern aesthetics.
            </p>
          </div>

          <div class="flex flex-col items-center gap-6">
            <div class="flex items-center gap-4">
              <a href="https://github.com/rifqiardian09" target="_blank" class="w-11 h-11 rounded-xl border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] bg-surface flex items-center justify-center hover:-translate-y-1 hover:text-accent transition-all">
                <UIcon name="i-simple-icons-github" class="w-6 h-6" />
              </a>
              <a href="https://linkedin.com/in/rifqiardian" target="_blank" class="w-11 h-11 rounded-xl border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] bg-surface flex items-center justify-center hover:-translate-y-1 hover:text-accent transition-all">
                <UIcon name="i-simple-icons-linkedin" class="w-6 h-6" />
              </a>
              <a href="https://instagram.com/rifqiardian_09" target="_blank" class="w-11 h-11 rounded-xl border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] bg-surface flex items-center justify-center hover:-translate-y-1 hover:text-accent transition-all">
                <UIcon name="i-simple-icons-instagram" class="w-6 h-6" />
              </a>
            </div>
            <p class="text-text-secondary text-xs font-mono">
              &copy; {{ new Date().getFullYear() }} — 
            </p>
          </div>

          <nav class="grid grid-cols-2 gap-x-8 gap-y-2">
            <NuxtLink v-for="link in links" :key="link.label" :to="link.hash ? { path: link.to, hash: link.hash } : link.to" class="text-sm font-bold font-display text-text-secondary hover:text-accent transition-colors">
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Transition animations */
.overlay-enter-active, .overlay-leave-active { transition: opacity .4s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: all .4s cubic-bezier(.22, 1, .36, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: translateX(50px); }

/* Global selection color */
::selection {
  background-color: var(--color-accent);
  color: white;
}
</style>
