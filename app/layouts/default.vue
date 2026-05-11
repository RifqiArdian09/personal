<script setup lang="ts">
const colorMode = useColorMode()
colorMode.preference = 'light'

const { locale, setLocale } = useI18n();

const links = computed(() => [
  { label: locale.value === 'id' ? 'Beranda' : 'Home', to: "/", hash: "#home", icon: "i-heroicons-home" },
  { label: locale.value === 'id' ? 'Tentang' : 'About', to: "/", hash: "#about", icon: "i-heroicons-user" },
  { label: locale.value === 'id' ? 'Portofolio' : 'Portfolio', to: "/", hash: "#projects", icon: "i-heroicons-code-bracket-square" },
  { label: locale.value === 'id' ? 'Sertifikat' : 'Certificates', to: "/", hash: "#certificates", icon: "i-heroicons-trophy" },
  { label: locale.value === 'id' ? 'Blog' : 'Blog', to: "/", hash: "#blog", icon: "i-heroicons-document-text" },
  { label: locale.value === 'id' ? 'Pertanyaan' : 'Questions', to: "/", hash: "#faq", icon: "i-heroicons-question-mark-circle" },
]);

const toggleLocale = () => {
  setLocale(locale.value === 'id' ? 'en' : 'id');
};

const isMobileMenuOpen = ref(false)
const scrolled = ref(false)
const showBackToTop = ref(false)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fetch Profile for WhatsApp link
const supabase = useSupabaseClient<any>();
const { data: profile } = await useAsyncData('profile-layout', async () => {
  const { data } = await supabase.from('profiles').select('*').single();
  return data;
});

const openWhatsApp = () => {
  const phone = profile.value?.phone || "6285182911840";
  const text = encodeURIComponent("Halo Rifqi! Saya baru saja melihat portofolio Anda.");
  window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
};

onMounted(() => {
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY || document.documentElement.scrollTop
    scrolled.value = scrollPos > 20
    showBackToTop.value = scrollPos > 500
    
    // Update Scroll Progress Bar
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrolled_pct = (scrollPos / height) * 100
    const scrollBar = document.getElementById('scrollBar')
    if (scrollBar) scrollBar.style.width = scrolled_pct + '%'
  })

  // Typewriter for WA Label
  typeWaLabel();
})

const waLabelText = ref('');
const waMessageIndex = ref(0);
const typeWaLabel = () => {
  const messages = locale.value === 'id' 
    ? ['Tanya sesuatu?', 'Mau joki?', 'Kerja bareng?', 'Ada ide proyek?'] 
    : ['Got questions?', 'Need a dev?', 'Let\'s collaborate!', 'Hire me?'];
  
  const fullText = messages[waMessageIndex.value % messages.length] || '';
  let i = 0;
  waLabelText.value = '';
  
  const typing = setInterval(() => {
    if (i < fullText.length) {
      waLabelText.value += fullText.charAt(i);
      i++;
    } else {
      clearInterval(typing);
      setTimeout(() => {
        waMessageIndex.value++;
        typeWaLabel();
      }, 4000); // Wait 4s before next message
    }
  }, 80);
};

// Re-type when locale changes
watch(locale, () => typeWaLabel());
</script>

<template>
  <div class="min-h-screen bg-surface text-text-primary font-body selection:bg-accent selection:text-white bg-noise">
    <!-- Scroll Progress Bar -->
    <div class="scroll-progress">
      <div class="scroll-progress-bar" id="scrollBar"></div>
    </div>

    <!-- WhatsApp Chat Button (Right, Parallel with Back-to-Top) -->
    <div class="fixed bottom-8 right-8 z-[10001] flex items-center gap-3 group animate-pop">
      <!-- Label (Auto appearing with typing effect) -->
      <span class="px-3 py-1 bg-surface border-2 border-manga-border rounded-lg text-[10px] font-black uppercase tracking-widest text-text-primary whitespace-nowrap shadow-[4px_4px_0px_var(--color-manga-border)] pointer-events-none relative flex items-center order-1">
        {{ waLabelText }}<span class="ml-1 w-1 h-3 bg-accent animate-pulse"></span>
      </span>

      <button
        @click="openWhatsApp"
        class="w-12 h-12 rounded-full border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)] bg-[#25D366] text-white flex items-center justify-center hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_var(--color-manga-border)] transition-all cursor-pointer animate-glow-wa order-2"
      >
        <UIcon name="i-simple-icons-whatsapp" class="w-6 h-6 group-hover:rotate-12 transition-transform" />
        
        <!-- Glowing Ring Effect -->
        <div class="absolute -inset-1 rounded-full bg-[#25D366]/40 blur-md -z-10 animate-pulse"></div>
      </button>
    </div>

    <!-- Back to Top Button (Left) -->
    <button
      @click="scrollToTop"
      class="fixed bottom-8 left-8 w-12 h-12 rounded-xl border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)] bg-accent text-white flex items-center justify-center z-[10001] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_var(--color-manga-border)] transition-all cursor-pointer"
      :class="showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'"
    >
      <UIcon name="i-heroicons-arrow-up" class="w-6 h-6" />
    </button>

    <!-- Navbar -->
    <header
      class="fixed top-0 inset-x-0 z-[10000] transition-all duration-700"
      :class="scrolled ? 'bg-surface/70 backdrop-blur-2xl border-b-[3px] border-manga-border shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-3' : 'bg-transparent py-6'"
    >
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group relative">
          <div class="absolute -inset-2 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span class="font-black font-display text-lg sm:text-2xl tracking-tighter relative z-10 flex items-center transition-transform group-hover:scale-105">
           <span class="text-accent opacity-50 group-hover:opacity-100 transition-opacity mr-1">{</span>
           <span>Rifqi</span><span class="text-accent">.dev</span>
           <span class="text-accent opacity-50 group-hover:opacity-100 transition-opacity ml-1">}</span>
          </span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden lg:flex items-center gap-1 bg-surface-alt/50 border-2 border-manga-border rounded-2xl p-1.5 shadow-[4px_4px_0px_var(--color-manga-border)]">
           <NuxtLink
            v-for="link in links"
            :key="link.label"
            :to="link.hash ? { path: link.to, hash: link.hash } : link.to"
            class="group relative px-5 py-2.5 text-sm font-black font-display text-text-secondary hover:text-accent transition-all duration-300"
            active-class="active-nav-link"
          >
            <div class="relative z-10 flex items-center gap-2">
              <UIcon :name="link.icon" class="w-4 h-4 transition-all duration-500 group-hover:scale-125 group-hover:-rotate-6" />
              <span class="tracking-widest uppercase text-[10px]">{{ link.label }}</span>
            </div>
            <!-- Hover Effect Pill -->
            <div class="absolute inset-0 bg-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"></div>
          </NuxtLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          <!-- Language Switcher -->
          <button
            @click="toggleLocale"
            class="w-12 h-12 rounded-xl border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)] bg-surface flex flex-col items-center justify-center hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-manga-border)] transition-all cursor-pointer group"
          >
            <UIcon name="i-heroicons-language" class="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
            <span class="font-black font-mono text-[8px] uppercase mt-0.5">{{ locale === 'id' ? 'EN' : 'ID' }}</span>
          </button>



        

          <!-- Mobile Menu Toggle -->
          <button
            class="lg:hidden w-12 h-12 rounded-xl border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)] bg-surface flex items-center justify-center hover:translate-y-[-2px] transition-all cursor-pointer"
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
    <footer class="bg-surface border-t-[4px] border-manga-border relative overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-hero-pattern"></div>
      
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <!-- Brand Column -->
          <div class="space-y-6 lg:col-span-1">
            <NuxtLink to="/" class="flex items-center gap-3 group">
              <div class="w-12 h-12 bg-accent rounded-xl flex items-center justify-center border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)]">
                <span class="text-white font-bold text-xl font-display">R</span>
              </div>
              <span class="font-black font-display text-2xl tracking-tight">Rifqi<span class="text-accent">.dev</span></span>
            </NuxtLink>
            <p class="text-text-secondary text-sm font-medium leading-relaxed max-w-xs">
              Membangun pengalaman digital premium dengan fokus pada performa, aksesibilitas, dan estetika modern.
            </p>
            <div class="flex items-center gap-4">
              <a v-for="social in [
                { icon: 'i-simple-icons-github', url: 'https://github.com/rifqiardian09' },
                { icon: 'i-simple-icons-linkedin', url: 'https://linkedin.com/in/rifqiardian' },
                { icon: 'i-simple-icons-instagram', url: 'https://instagram.com/rifqiardian_09' }
              ]" :key="social.icon" :href="social.url" target="_blank"
                class="w-10 h-10 rounded-xl border-2 border-manga-border shadow-[3px_3px_0px_var(--color-manga-border)] bg-surface flex items-center justify-center hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_var(--color-manga-border)] hover:text-accent transition-all">
                <UIcon :name="social.icon" class="w-5 h-5" />
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="space-y-6">
            <h4 class="font-black font-display text-sm uppercase tracking-[0.2em] text-text-primary">Navigasi</h4>
            <nav class="flex flex-col gap-3">
              <NuxtLink v-for="link in links" :key="link.label" :to="link.hash ? { path: link.to, hash: link.hash } : link.to" 
                class="text-sm font-bold text-text-secondary hover:text-accent transition-colors flex items-center gap-2 group">
                <span class="w-0 group-hover:w-4 h-[2px] bg-accent transition-all"></span>
                {{ link.label }}
              </NuxtLink>
            </nav>
          </div>

          <!-- Services/Focus -->
          <div class="space-y-6">
            <h4 class="font-black font-display text-sm uppercase tracking-[0.2em] text-text-primary">Fokus Utama</h4>
            <ul class="space-y-3 text-sm font-medium text-text-secondary">
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-accent" /> Fullstack Development
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-accent" /> UI/UX Design
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-accent" /> Cyber Security
              </li>
            </ul>
          </div>

          <!-- Newsletter/Call to action -->
          <div class="space-y-6">
            <h4 class="font-black font-display text-sm uppercase tracking-[0.2em] text-text-primary">Mulai Proyek?</h4>
            <p class="text-sm text-text-secondary font-medium">
              Siap untuk mewujudkan ide brilian Anda menjadi kenyataan?
            </p>
            <a href="#contact" class="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-manga-border shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all">
              Hubungi Sekarang
            </a>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="mt-20 pt-8 border-t-2 border-divider flex flex-col md:flex-row items-center justify-between gap-6">
          <p class="text-xs font-mono text-text-secondary">
            &copy; {{ new Date().getFullYear() }} — Rifqi Ardian. All Rights Reserved.
          </p>
          
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

/* Nav active state */
.active-nav-link {
  color: var(--color-accent) !important;
}

.active-nav-link .nav-active-pill {
  display: block !important;
}

/* Global selection color */
::selection {
  background-color: var(--color-accent);
  color: white;
}
</style>
