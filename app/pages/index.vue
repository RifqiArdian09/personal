<script setup lang="ts">
const supabase = useSupabaseClient()

// Fetch Profile
const { data: profile } = await useAsyncData('profile', async () => {
  const { data } = await supabase.from('profile').select('*').single()
  return (data || {}) as any
})

// Fetch Projects with Pagination
const projectPage = ref(1)
const projectLimit = 6
const { data: projectData } = await useAsyncData('projects-paged', async () => {
  const from = (projectPage.value - 1) * projectLimit
  const to = from + projectLimit - 1
  const { data, count } = await supabase.from('projects')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
  return { items: data || [], total: count || 0 }
}, { watch: [projectPage] })

const projects = computed(() => projectData.value?.items || [])
const totalProjectPages = computed(() => Math.ceil((projectData.value?.total || 0) / projectLimit))

// Fetch Certificates with Pagination
const certPage = ref(1)
const certLimit = 6
const { data: certData } = await useAsyncData('certs-paged', async () => {
  const from = (certPage.value - 1) * certLimit
  const to = from + certLimit - 1
  const { data, count } = await supabase.from('certificates')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
  return { items: data || [], total: count || 0 }
}, { watch: [certPage] })

const certificates = computed(() => certData.value?.items || [])
const totalCertPages = computed(() => Math.ceil((certData.value?.total || 0) / certLimit))

// Fetch Blog Posts (Top 3)
const { data: blogs } = await useAsyncData('latest-blogs', async () => {
  const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(3)
  return (data || []) as any[]
})

// Modals
const isProjectModalOpen = ref(false)
const selectedProject = ref<any>(null)
const isCertModalOpen = ref(false)
const selectedCert = ref<any>(null)

const openProject = (project: any) => {
  selectedProject.value = project
  isProjectModalOpen.value = true
}
const openCert = (cert: any) => {
  selectedCert.value = cert
  isCertModalOpen.value = true
}

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

// Scroll reveal — observe ALL animation classes
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible')
      }
    })
  }, { threshold: 0.08 })
  
  document.querySelectorAll('.scroll-hidden, .reveal-card, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="overflow-x-hidden">
    <!-- ======================== HERO ======================== -->
    <section class="min-h-[90vh] flex items-center justify-center pt-24 pb-32 relative overflow-hidden bg-hero-pattern">
      <div class="absolute inset-0 bg-surface/90 pointer-events-none"></div>
      
      <!-- Decorative Animated Blobs -->
      <div class="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-float pointer-events-none"></div>

      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10">
        <!-- Left Text Content -->
        <div class="flex-1 text-center lg:text-left space-y-8">
          <div class="inline-flex items-center gap-3 manga-badge py-2 px-4 reveal-left scroll-visible neon-glow-accent">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
            <span class="text-xs font-bold tracking-widest uppercase">Active & Open for Hire</span>
          </div>
          
          <h1 class="text-6xl md:text-8xl font-bold font-display tracking-tight leading-[1.1] reveal-left">
            Hey, I'm <br />
            <span class="gradient-text drop-shadow-sm">{{ profile?.name || 'Rifqi Ardian' }}</span>
            <span class="animate-blink text-accent font-light">|</span>
          </h1>
          
          <p class="text-text-secondary text-xl md:text-2xl leading-relaxed max-w-[650px] mx-auto lg:mx-0 font-body font-medium reveal-left">
            {{ profile?.role || 'Fullstack Developer' }} — 
            <span class="text-text-primary">Crafting digital products</span> that merge bold aesthetics with high-performance code.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start reveal-left pt-4">
            <a href="#contact" class="btn-magnetic inline-flex items-center justify-center gap-3 px-10 py-5 bg-accent text-white font-bold rounded-2xl border-2 border-manga-border shadow-[5px_5px_0px_var(--color-manga-border)] hover:shadow-[8px_8px_0px_var(--color-manga-border)] transition-all font-display group">
              <UIcon name="i-heroicons-paper-airplane" class="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Start a Project
            </a>
            <a href="#projects" class="btn-magnetic inline-flex items-center justify-center gap-3 px-10 py-5 bg-surface font-bold rounded-2xl border-2 border-manga-border shadow-[5px_5px_0px_var(--color-manga-border)] hover:shadow-[8px_8px_0px_var(--color-manga-border)] transition-all font-display text-text-primary hover:text-accent">
              <UIcon name="i-heroicons-briefcase" class="w-6 h-6" />
              My Work
            </a>
          </div>
        </div>
        
        <!-- Right Visual Area -->
        <div class="relative mt-16 lg:mt-0 reveal-scale">
          <!-- Rotating Text Badge -->
          <div class="absolute -top-12 -right-12 w-40 h-40 hidden md:block z-30 animate-rotate">
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
              <text class="text-[10px] font-bold tracking-[0.2em] fill-accent uppercase">
                <textPath xlink:href="#circlePath">
                  Verified Developer • Creative Coder • Problem Solver •
                </textPath>
              </text>
            </svg>
          </div>

          <!-- Profile Image Card -->
          <div class="w-72 h-72 md:w-[400px] md:h-[400px] relative">
            <div class="absolute -inset-4 bg-accent-glow rounded-[40px] animate-glow-pulse opacity-20"></div>
            <div class="absolute inset-0 border-[4px] border-manga-border rounded-[32px] rotate-3 bg-surface z-0"></div>
            
            <div class="w-full h-full rounded-[32px] overflow-hidden border-[4px] border-manga-border shadow-2xl relative z-10 bg-surface-alt group">
              <img 
                v-if="profile?.profile_image_url" 
                :src="profile.profile_image_url" 
                :alt="profile.name" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-9xl font-bold font-display text-accent/20">RA</span>
              </div>
            </div>

            <!-- Floating Tech Tags -->
            <div class="absolute -bottom-6 -right-6 bg-surface border-[3px] border-manga-border p-4 rounded-2xl shadow-[6px_6px_0px_var(--color-manga-border)] z-20 animate-float-alt hidden sm:block">
              <div class="flex items-center gap-3">
                <div class="flex -space-x-2">
                  <UIcon name="i-simple-icons-nuxtdotjs" class="w-8 h-8 p-1.5 bg-green-500/10 text-green-500 rounded-lg border-2 border-manga-border bg-white" />
                  <UIcon name="i-simple-icons-vuedotjs" class="w-8 h-8 p-1.5 bg-green-400/10 text-green-400 rounded-lg border-2 border-manga-border bg-white" />
                  <UIcon name="i-simple-icons-typescript" class="w-8 h-8 p-1.5 bg-blue-500/10 text-blue-500 rounded-lg border-2 border-manga-border bg-white" />
                </div>
                <span class="text-xs font-bold font-mono">Modern Tech Stack</span>
              </div>
            </div>

            <!-- Floating Code Card -->
            <div class="absolute -top-10 -left-16 bg-surface dark:bg-slate-900 rounded-2xl border-[3px] border-manga-border shadow-[6px_6px_0px_var(--color-manga-border)] p-5 hidden xl:block z-20 w-80 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <div class="flex items-center gap-2 mb-4 border-b-2 border-divider pb-2">
                <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                  <div class="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                  <div class="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                </div>
                <span class="text-[10px] font-mono font-bold opacity-50 ml-2 uppercase tracking-widest">MainModule.ts</span>
              </div>
              <div class="font-mono text-[11px] leading-relaxed">
                <p><span class="text-pink-500">export</span> <span class="text-blue-500">class</span> <span class="text-accent">Developer</span> {</p>
                <p class="pl-4">skills = [<span class="text-orange-400">'Nuxt'</span>, <span class="text-orange-400">'Tailwind'</span>];</p>
                <p class="pl-4">focus = <span class="text-orange-400">'Premium UX'</span>;</p>
                <p class="pl-4"><span class="text-pink-500">async</span> <span class="text-blue-500">render</span>() {</p>
                <p class="pl-8 text-text-secondary">// Making magic happen...</p>
                <p class="pl-8"><span class="text-pink-500">return await</span> this.deploy();</p>
                <p class="pl-4">}</p>
                <p>}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================== ABOUT ======================== -->
    <section id="about" class="pt-48 pb-32 bg-surface-alt scroll-mt-20 relative manga-divider-top">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col items-center mb-24 reveal-scale">
          <span class="manga-badge mb-6 py-2 px-6 font-bold tracking-widest uppercase bg-accent text-white border-manga-border">01. THE JOURNEY</span>
          <h2 class="section-heading text-5xl md:text-6xl text-center">Beyond The Code</h2>
          <div class="w-24 h-2 bg-accent rounded-full mt-6 shadow-[0_4px_10px_rgba(13,148,136,0.4)]"></div>
        </div>
        
        <div class="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div class="lg:col-span-7 manga-card p-8 md:p-12 space-y-8 reveal-left relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            
            <h3 class="font-display font-bold text-3xl text-text-primary flex items-center gap-4">
              <span class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-accent" />
              </span>
              Creative Vision
            </h3>
            
            <div class="space-y-6 text-lg text-text-secondary leading-relaxed font-medium">
              <p class="whitespace-pre-wrap">{{ profile?.bio || 'Dedicated to building seamless digital experiences.' }}</p>
            </div>
            
            <div v-if="profile?.cv_url" class="pt-6 border-t border-divider">
              <a :href="profile.cv_url" target="_blank" class="btn-magnetic inline-flex items-center gap-3 px-8 py-4 bg-surface-alt font-bold rounded-2xl border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)] hover:bg-accent hover:text-white transition-all text-base font-display">
                <UIcon name="i-heroicons-cloud-arrow-down" class="w-5 h-5" />
                Grab My CV
              </a>
            </div>
          </div>
          
          <div class="lg:col-span-5 grid grid-cols-2 gap-6 reveal-right">
            <div v-for="(skill, i) in [
              { label: 'Frontend', icon: 'i-heroicons-code-bracket', color: 'text-accent', bg: 'bg-accent/10', techs: 'Nuxt, Vue, React' },
              { label: 'Backend', icon: 'i-heroicons-server', color: 'text-blue-500', bg: 'bg-blue-500/10', techs: 'Node, Supabase, SQL' },
              { label: 'Design', icon: 'i-heroicons-paint-brush', color: 'text-purple-500', bg: 'bg-purple-500/10', techs: 'Figma, UI/UX' },
              { label: 'Cloud', icon: 'i-heroicons-cloud', color: 'text-orange-500', bg: 'bg-orange-500/10', techs: 'Vercel, AWS, Git' }
            ]" :key="i" 
              class="manga-card p-6 text-center group hover:border-accent transition-all duration-300 hover:-rotate-2 reveal-card"
              :class="`reveal-delay-${i+1}`"
            >
              <div :class="[skill.bg, 'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border-2 border-transparent group-hover:border-manga-border transition-all group-hover:scale-110']">
                <UIcon :name="skill.icon" :class="[skill.color, 'w-8 h-8']" />
              </div>
              <h4 class="font-display font-bold text-xl mb-2">{{ skill.label }}</h4>
              <p class="text-text-secondary text-xs font-mono font-bold tracking-wider uppercase">{{ skill.techs }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================== PROJECTS ======================== -->
    <section id="projects" class="py-32 scroll-mt-20 relative">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center mb-24 reveal-scale">
          <span class="manga-badge mb-6 py-2 px-6 font-bold tracking-widest uppercase bg-accent text-white border-manga-border">02. PORTFOLIO</span>
          <h2 class="section-heading text-5xl md:text-6xl text-center">Featured Projects</h2>
          <div class="w-24 h-2 bg-accent rounded-full mt-6 shadow-[0_4px_10px_rgba(13,148,136,0.4)]"></div>
        </div>
        
        <div v-if="projects && projects.length > 0" class="grid md:grid-cols-2 gap-10 lg:gap-14">
          <div
            v-for="(project, idx) in projects"
            :key="project.id"
            class="manga-card overflow-hidden cursor-pointer group flex flex-col reveal-card hover:-translate-y-4 transition-all duration-500 bg-surface"
            :class="`reveal-delay-${idx + 1}`"
            @click="openProject(project)"
          >
            <div class="relative aspect-video overflow-hidden bg-surface-alt border-b-[3px] border-manga-border">
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-500"></div>
              <img
                v-if="project.thumbnail_url"
                :src="project.thumbnail_url"
                :alt="project.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                loading="lazy"
                @error="($event.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/0d9488?text=Project+Image'"
              />
              <div v-else class="w-full h-full flex items-center justify-center img-shimmer">
                <UIcon name="i-heroicons-photo" class="w-16 h-16 text-text-secondary opacity-20" />
              </div>
              <div class="absolute bottom-6 right-6 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div class="px-6 py-3 bg-white dark:bg-slate-900 text-text-primary font-bold border-2 border-manga-border shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] flex items-center gap-2">
                  Explore <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
                </div>
              </div>
            </div>
            <div class="p-8 space-y-4 flex-1 flex flex-col group-hover:bg-accent-soft/30 transition-colors">
              <h3 class="font-display font-extrabold text-2xl group-hover:text-accent transition-colors duration-300 leading-tight">{{ project.title }}</h3>
              <p class="text-text-secondary text-base line-clamp-3 flex-1 font-medium leading-relaxed">{{ project.description }}</p>
              <div class="flex flex-wrap gap-2 pt-4">
                <span v-for="tech in project.tech_stack?.slice(0,3)" :key="tech" class="px-3 py-1 bg-surface-alt border border-divider text-[10px] font-bold font-mono uppercase tracking-wider rounded-md">#{{ tech }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Projects -->
        <div v-if="totalProjectPages > 1" class="flex items-center justify-center gap-6 mt-20 reveal-scale">
          <button 
            @click="projectPage--; scrollToSection('projects')" 
            :disabled="projectPage === 1"
            class="w-14 h-14 rounded-2xl border-[3px] border-manga-border flex items-center justify-center transition-all shadow-[4px_4px_0px_var(--color-manga-border)] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--color-manga-border)] bg-surface text-text-primary group"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div class="flex items-center gap-2">
            <span class="font-display font-black text-xl text-accent">{{ projectPage }}</span>
            <span class="text-text-secondary font-bold">/</span>
            <span class="font-display font-bold text-lg text-text-secondary">{{ totalProjectPages }}</span>
          </div>

          <button 
            @click="projectPage++; scrollToSection('projects')" 
            :disabled="projectPage === totalProjectPages"
            class="w-14 h-14 rounded-2xl border-[3px] border-manga-border flex items-center justify-center transition-all shadow-[4px_4px_0px_var(--color-manga-border)] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--color-manga-border)] bg-surface text-text-primary group"
          >
            <UIcon name="i-heroicons-arrow-right" class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>

    <!-- ======================== CERTIFICATES ======================== -->
    <section id="certificates" class="pt-48 pb-32 bg-surface-alt scroll-mt-20 relative manga-divider-top">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col items-center mb-24 reveal-scale">
          <span class="manga-badge mb-6 py-2 px-6 font-bold tracking-widest uppercase bg-accent text-white border-manga-border">03. CREDENTIALS</span>
          <h2 class="section-heading text-5xl md:text-6xl text-center">Certifications</h2>
          <div class="w-24 h-2 bg-accent rounded-full mt-6 shadow-[0_4px_10px_rgba(13,148,136,0.4)]"></div>
        </div>

        <div v-if="certificates && certificates.length > 0" class="grid md:grid-cols-3 gap-8 lg:gap-10">
          <div
            v-for="(cert, idx) in certificates"
            :key="cert.id"
            class="manga-card overflow-hidden cursor-pointer group flex flex-col reveal-card hover:scale-[1.02] transition-all duration-500 bg-surface"
            :class="`reveal-delay-${idx + 1}`"
            @click="openCert(cert)"
          >
            <div class="relative aspect-[4/3] overflow-hidden bg-surface-alt border-b-[3px] border-manga-border">
              <img
                v-if="cert.image_url"
                :src="cert.image_url"
                :alt="cert.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                loading="lazy"
                @error="($event.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/0d9488?text=Certificate+Image'"
              />
              <div v-else class="w-full h-full flex items-center justify-center img-shimmer">
                <UIcon name="i-heroicons-academic-cap" class="w-16 h-16 text-text-secondary opacity-20" />
              </div>
              <div class="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div class="p-8 flex-1 flex flex-col justify-between space-y-6">
              <div class="space-y-3">
                <h3 class="font-display font-extrabold text-xl group-hover:text-accent transition-colors duration-300 line-clamp-2 leading-tight">{{ cert.title }}</h3>
                <p class="text-text-secondary text-sm font-bold flex items-center gap-2">
                  <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 text-accent" />
                  {{ cert.issuer }}
                </p>
              </div>
              <div class="pt-6 border-t border-divider flex items-center justify-between text-xs font-mono font-black text-text-secondary">
                <span class="px-2 py-1 bg-surface-alt rounded border border-divider">{{ new Date(cert.issued_at).getFullYear() }}</span>
                <span class="text-accent group-hover:translate-x-1 transition-transform flex items-center gap-1">VIEW DATA <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" /></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Certificates -->
        <div v-if="totalCertPages > 1" class="flex items-center justify-center gap-6 mt-20 reveal-scale">
          <button 
            @click="certPage--; scrollToSection('certificates')" 
            :disabled="certPage === 1"
            class="w-14 h-14 rounded-2xl border-[3px] border-manga-border flex items-center justify-center transition-all shadow-[4px_4px_0px_var(--color-manga-border)] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--color-manga-border)] bg-surface text-text-primary group"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div class="flex items-center gap-2">
            <span class="font-display font-black text-xl text-accent">{{ certPage }}</span>
            <span class="text-text-secondary font-bold">/</span>
            <span class="font-display font-bold text-lg text-text-secondary">{{ totalCertPages }}</span>
          </div>

          <button 
            @click="certPage++; scrollToSection('certificates')" 
            :disabled="certPage === totalCertPages"
            class="w-14 h-14 rounded-2xl border-[3px] border-manga-border flex items-center justify-center transition-all shadow-[4px_4px_0px_var(--color-manga-border)] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--color-manga-border)] bg-surface text-text-primary group"
          >
            <UIcon name="i-heroicons-arrow-right" class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>

    <!-- ======================== BLOG ======================== -->
    <section id="blog" class="py-32 scroll-mt-20">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center mb-24 reveal-scale">
          <span class="manga-badge mb-6 py-2 px-6 font-bold tracking-widest uppercase bg-accent text-white border-manga-border">04. INSIGHTS</span>
          <h2 class="section-heading text-5xl md:text-6xl text-center">Latest Writings</h2>
          <div class="w-24 h-2 bg-accent rounded-full mt-6 shadow-[0_4px_10px_rgba(13,148,136,0.4)]"></div>
        </div>

        <div v-if="blogs && blogs.length > 0" class="grid lg:grid-cols-3 gap-10">
          <NuxtLink
            v-for="(post, idx) in blogs"
            :key="post.id"
            :to="`/blog/${post.slug}`"
            class="manga-card overflow-hidden group flex flex-col reveal-card hover:-translate-y-2 transition-all duration-500 bg-surface"
            :class="`reveal-delay-${idx + 1}`"
          >
            <div class="relative aspect-[16/10] overflow-hidden bg-surface-alt border-b-[3px] border-manga-border">
              <img
                v-if="post.cover_url"
                :src="post.cover_url"
                :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                loading="lazy"
                @error="($event.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/0d9488?text=Blog+Post'"
              />
              <div v-else class="w-full h-full flex items-center justify-center img-shimmer">
                <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-text-secondary opacity-20" />
              </div>
            </div>
            <div class="p-8 space-y-4 flex-1 flex flex-col">
              <span class="text-[10px] font-black font-mono text-accent uppercase tracking-[0.2em]">{{ new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
              <h3 class="font-display font-extrabold text-2xl group-hover:text-accent transition-colors duration-300 line-clamp-2 leading-tight">{{ post.title }}</h3>
              <p class="text-text-secondary text-base line-clamp-2 font-medium leading-relaxed flex-1">{{ post.excerpt || post.content?.substring(0, 100) + '...' }}</p>
              <div class="pt-4 flex items-center gap-2 text-accent font-bold text-sm">
                READ ARTICLE <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
              </div>
            </div>
          </NuxtLink>
        </div>
        
        <div class="text-center mt-20 reveal-scale">
          <NuxtLink to="/blog" class="btn-magnetic inline-flex items-center gap-3 px-10 py-5 bg-surface font-bold rounded-2xl border-2 border-manga-border shadow-[5px_5px_0px_var(--color-manga-border)] hover:text-accent transition-all font-display text-text-primary">
            Explore All Posts
            <UIcon name="i-heroicons-document-magnifying-glass" class="w-6 h-6" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ======================== CONTACT ======================== -->
    <section id="contact" class="pt-48 pb-32 bg-surface-alt scroll-mt-20 relative manga-divider-top">
      <div class="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div class="reveal-scale mb-20">
          <span class="manga-badge mb-6 py-2 px-6 font-bold tracking-widest uppercase bg-accent text-white border-manga-border">05. GET IN TOUCH</span>
          <h2 class="section-heading text-6xl md:text-7xl">Let's Create <br /> <span class="gradient-text">Something Great</span></h2>
        </div>

        <div class="grid md:grid-cols-2 gap-12 text-left items-stretch">
          <div class="manga-card p-10 md:p-12 space-y-10 reveal-left bg-surface">
            <h3 class="font-display font-extrabold text-3xl">Contact Details</h3>
            <div class="space-y-8">
              <div class="flex items-center gap-6 group">
                <div class="w-14 h-14 rounded-2xl bg-accent/10 border-2 border-manga-border flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-[4px_4px_0px_var(--color-manga-border)]">
                  <UIcon name="i-heroicons-envelope" class="w-7 h-7" />
                </div>
                <a :href="`mailto:${profile?.email || 'rifqiardian09@gmail.com'}`" class="text-xl font-bold hover:text-accent transition-colors">{{ profile?.email || 'rifqiardian09@gmail.com' }}</a>
              </div>
              <div class="flex items-center gap-6 group">
                <div class="w-14 h-14 rounded-2xl bg-blue-500/10 border-2 border-manga-border flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-[4px_4px_0px_var(--color-manga-border)]">
                  <UIcon name="i-heroicons-map-pin" class="w-7 h-7" />
                </div>
                <span class="text-xl font-bold">{{ profile?.location || 'Indonesia' }}</span>
              </div>
            </div>
            <div class="pt-10 border-t border-divider">
              <div class="flex flex-wrap gap-4">
                <a v-for="social in [
                  { name: 'GitHub', icon: 'i-simple-icons-github', url: profile?.github_url || '#' },
                  { name: 'LinkedIn', icon: 'i-simple-icons-linkedin', url: profile?.linkedin_url || '#' },
                  { name: 'Instagram', icon: 'i-simple-icons-instagram', url: profile?.instagram_url || '#' }
                ]" :key="social.name" :href="social.url" target="_blank" class="w-12 h-12 rounded-xl border-2 border-manga-border flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-[3px_3px_0px_var(--color-manga-border)]">
                  <UIcon :name="social.icon" class="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div class="manga-card p-10 md:p-12 reveal-right bg-accent text-white border-accent flex flex-col justify-center text-center space-y-8">
            <div class="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white/40 animate-float-alt">
              <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-10 h-10" />
            </div>
            <h3 class="font-display font-black text-4xl">Ready to Start?</h3>
            <p class="text-white/80 text-xl font-medium">I'm currently accepting new projects.</p>
            <a :href="`mailto:${profile?.email || 'rifqiardian09@gmail.com'}`" class="w-full py-6 bg-white text-accent font-black rounded-2xl shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#000] transition-all uppercase tracking-widest text-sm">Send an Inquiry</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================== MODALS ======================== -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="isProjectModalOpen || isCertModalOpen" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[998]" @click="isProjectModalOpen = isCertModalOpen = false"></div>
      </Transition>
      
      <!-- Project Modal -->
      <Transition name="modal">
        <div v-if="isProjectModalOpen && selectedProject" class="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div class="manga-card w-full max-w-[1000px] max-h-[90vh] flex flex-col overflow-hidden bg-surface" @click.stop>
            <div class="relative aspect-video bg-surface-alt shrink-0 overflow-hidden border-b-4 border-manga-border">
              <img v-if="selectedProject.thumbnail_url" :src="selectedProject.thumbnail_url" class="w-full h-full object-cover" />
              <button @click="isProjectModalOpen = false" class="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center cursor-pointer hover:bg-accent transition-all border-2 border-white/20 z-30">
                <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
              </button>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div class="absolute bottom-8 left-8 right-8">
                <div class="flex flex-wrap gap-2 mb-4">
                  <span v-for="tech in selectedProject.tech_stack" :key="tech" class="px-3 py-1 bg-accent/90 text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/20">{{ tech }}</span>
                </div>
                <h2 class="font-display font-black text-3xl md:text-5xl text-white">{{ selectedProject.title }}</h2>
              </div>
            </div>
            <div class="p-8 md:p-12 flex-1 overflow-y-auto space-y-8 bg-noise">
              <div class="prose prose-lg dark:prose-invert max-w-none">
                <p class="text-xl text-text-secondary leading-relaxed font-medium">{{ selectedProject.description }}</p>
                <div class="h-px bg-divider w-full my-8"></div>
                <div v-html="selectedProject.content" class="text-lg leading-relaxed"></div>
              </div>
              <div class="flex flex-wrap gap-6 pt-6">
                <a v-if="selectedProject.live_url" :href="selectedProject.live_url" target="_blank" class="btn-magnetic flex items-center gap-3 px-8 py-4 bg-accent text-white font-black rounded-2xl border-2 border-manga-border shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all uppercase text-sm tracking-widest">
                  <UIcon name="i-heroicons-globe-alt" class="w-5 h-5" /> Live Demo
                </a>
                <a v-if="selectedProject.github_url" :href="selectedProject.github_url" target="_blank" class="btn-magnetic flex items-center gap-3 px-8 py-4 bg-surface font-black rounded-2xl border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)] hover:bg-accent hover:text-white transition-all uppercase text-sm tracking-widest text-text-primary">
                  <UIcon name="i-simple-icons-github" class="w-5 h-5" /> Source Code
                </a>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Cert Modal -->
      <Transition name="modal">
        <div v-if="isCertModalOpen && selectedCert" class="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div class="manga-card w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden bg-surface" @click.stop>
            <div class="flex items-center justify-between px-8 py-6 border-b-4 border-manga-border bg-surface-alt shrink-0">
              <h3 class="font-display font-black text-2xl uppercase tracking-tight">{{ selectedCert.title }}</h3>
              <button @click="isCertModalOpen = false" class="w-10 h-10 rounded-xl border-2 border-manga-border flex items-center justify-center cursor-pointer hover:bg-accent hover:text-white transition-all shadow-[2px_2px_0px_var(--color-manga-border)]">
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
              </button>
            </div>
            <div class="p-8 flex-1 overflow-y-auto space-y-8 bg-noise">
              <div v-if="selectedCert.image_url" class="rounded-[24px] overflow-hidden border-4 border-manga-border shadow-2xl">
                <img :src="selectedCert.image_url" class="w-full object-contain" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="manga-card p-6 bg-surface-alt border-divider flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border-2 border-manga-border">
                    <UIcon name="i-heroicons-building-office-2" class="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p class="text-[10px] font-black font-mono text-text-secondary uppercase mb-0.5">Issued By</p>
                    <p class="font-display font-bold text-lg leading-tight">{{ selectedCert.issuer }}</p>
                  </div>
                </div>
                <div class="manga-card p-6 bg-surface-alt border-divider flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border-2 border-manga-border">
                    <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p class="text-[10px] font-black font-mono text-text-secondary uppercase mb-0.5">Issue Date</p>
                    <p class="font-display font-bold text-lg leading-tight">{{ new Date(selectedCert.issued_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedCert.verification_url" class="px-8 py-6 border-t-4 border-manga-border bg-surface-alt shrink-0">
              <a :href="selectedCert.verification_url" target="_blank" class="w-full btn-magnetic flex items-center justify-center gap-3 px-10 py-5 bg-accent text-white font-black rounded-2xl border-2 border-manga-border shadow-[4px_4px_0px_#000] hover:shadow-[8px_8px_0px_#000] transition-all uppercase tracking-widest text-sm">
                <UIcon name="i-heroicons-check-badge" class="w-6 h-6" /> Verify Credential
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
