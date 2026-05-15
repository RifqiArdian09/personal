<script setup lang="ts">
const supabase = useSupabaseClient<any>();
const { locale } = useI18n();

// Fetch Profile
const { data: profile } = await useAsyncData("profile", async () => {
  const { data } = await supabase.from("profile").select("*").single();
  return (data || {}) as any;
});

// Typewriter Roles Logic
const roles = [
  "Fullstack Web Developer",
  "Mobile App Developer",
  "IT Enthusiast"
];
const currentRoleIndex = ref(0);
const displayedRole = ref("");
let isDeleting = false;
let charIndex = 0;

const typeRole = () => {
  const currentFullRole = roles[currentRoleIndex.value]!;

  if (isDeleting) {
    displayedRole.value = currentFullRole.substring(0, charIndex - 1);
    charIndex--;
  } else {
    displayedRole.value = currentFullRole.substring(0, charIndex + 1);
    charIndex++;
  }

  let typingSpeed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentFullRole.length) {
    typingSpeed = 2000; // Pause at end
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    currentRoleIndex.value = (currentRoleIndex.value + 1) % roles.length;
    typingSpeed = 500;
  }

  setTimeout(typeRole, typingSpeed);
};

// Fetch Projects with Pagination
const projectPage = ref(1);
const projectLimit = 9;
const { data: projectData } = await useAsyncData(
  "projects-paged",
  async () => {
    const from = (projectPage.value - 1) * projectLimit;
    const to = from + projectLimit - 1;
    const { data, count } = await supabase
      .from("projects")
      .select("*, project_team_members(*), project_tech(*), project_images(*)", { count: "exact" })
      .order("featured", { ascending: false })
      .order("thumbnail_url", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to);
    return { items: data || [], total: count || 0 };
  },
  { watch: [projectPage] },
);

const projects = computed(() => projectData.value?.items || []);
const totalProjectPages = computed(() =>
  Math.ceil((projectData.value?.total || 0) / projectLimit),
);

// Fetch Certificates with Pagination
const certPage = ref(1);
const certLimit = 6;
const { data: certData } = await useAsyncData(
  "certs-paged",
  async () => {
    const from_val = (certPage.value - 1) * certLimit;
    const to_val = from_val + certLimit - 1;
    const { data, count } = await supabase
      .from("certificates")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from_val, to_val);
    return { items: data || [], total: count || 0 };
  },
  { watch: [certPage] },
);

const certificates = computed(() => certData.value?.items || []);
const totalCertPages = computed(() =>
  Math.ceil((certData.value?.total || 0) / certLimit),
);


// WhatsApp Form Logic
const formName = ref("");
const formMessage = ref("");

const openWhatsApp = () => {
  const phone = profile.value?.whatsapp || profile.value?.phone || "6285182911840";
  const text = encodeURIComponent(
    locale.value === 'id' 
      ? "Halo Rifqi! Saya ingin berdiskusi tentang proyek." 
      : "Hello Rifqi! I'd like to discuss a project."
  );
  window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
};

const sendWhatsApp = () => {
  const phone = profile.value?.whatsapp || profile.value?.phone || "6285182911840";
  const text = encodeURIComponent(
    `Halo Rifqi! Nama saya ${formName.value}.\n\n${formMessage.value}`,
  );
  window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
};

// Modals
const isProjectModalOpen = ref(false);
const selectedProject = ref<any>(null);
const isCertModalOpen = ref(false);
const selectedCert = ref<any>(null);

// FAQ Logic
const activeFaq = ref<number | null>(0);
const faqs = computed(() => [
  // FAQ Umum
  {
    q: locale.value === 'id' ? 'Apa saja layanan yang Anda tawarkan?' : 'What services do you offer?',
    a: locale.value === 'id' ? 'Saya fokus pada pembuatan aplikasi web kustom, mulai dari pengembangan front-end yang interaktif hingga sistem back-end yang kuat. Saya juga membantu integrasi API dan optimasi performa web.' : 'I focus on building custom web applications, from interactive front-end development to robust back-end systems. I also assist with API integration and web performance optimization.'
  },
  {
    q: locale.value === 'id' ? 'Bagaimana cara memulai proyek bersama Anda?' : 'How do I start a project with you?',
    a: locale.value === 'id' ? 'Cukup klik tombol WhatsApp di pojok kanan bawah atau kirim email. Saya biasanya merespons dalam waktu 24 jam untuk mendiskusikan detail proyek atau jadwal meeting singkat.' : 'Just click the WhatsApp button at the bottom right or send an email. I usually respond within 24 hours to discuss project details or schedule a quick meeting.'
  },
  // Teknis & Workflow
  {
    q: locale.value === 'id' ? 'Teknologi apa yang biasa Anda gunakan?' : 'What technology stack do you use?',
    a: locale.value === 'id' ? 'Untuk pengembangan web, saya mengandalkan ekosistem modern untuk antarmuka, serta CSS framework terbaru untuk desain responsif dan minimalis. Di sisi server, saya berpengalaman dengan berbagai framework back-end populer dan database management.' : 'For web development, I rely on modern ecosystems for the interface and the latest CSS frameworks for responsive and minimalist design. On the server side, I am experienced with various popular back-end frameworks and database management.'
  },
  {
    q: locale.value === 'id' ? 'Apakah Anda bisa mengerjakan desain sekaligus coding?' : 'Can you handle both design and coding?',
    a: locale.value === 'id' ? 'Tentu. Saya memiliki ketertarikan kuat pada estetika antarmuka yang bersih dan modern. Saya biasanya merancang mockup terlebih dahulu sebelum masuk ke tahap pengembangan kode agar sesuai ekspektasi Anda.' : 'Certainly. I have a strong interest in clean and modern interface aesthetics. I usually design mockups first before entering the code development stage to meet your expectations.'
  },
  {
    q: locale.value === 'id' ? 'Berapa lama waktu pengerjaan satu proyek?' : 'How long does a project take?',
    a: locale.value === 'id' ? 'Waktu pengerjaan bergantung pada kompleksitas fitur. Landing page sederhana biasanya memakan waktu 1-2 minggu, sedangkan sistem web yang kompleks bisa memakan waktu 1 bulan atau lebih.' : 'Timeline depends on feature complexity. A simple landing page usually takes 1-2 weeks, while complex web systems can take 1 month or more.'
  },
  // Lain-lain
  {
    q: locale.value === 'id' ? 'Apakah Anda tersedia untuk pekerjaan Full-time atau Freelance?' : 'Are you available for Full-time or Freelance work?',
    a: locale.value === 'id' ? 'Saya terbuka untuk kedua peluang tersebut, baik kontrak proyek jangka pendek maupun posisi tetap di perusahaan yang inovatif.' : 'I am open to both opportunities, whether short-term project contracts or permanent positions in innovative companies.'
  },
  {
    q: locale.value === 'id' ? 'Apakah Anda bersedia mengerjakan revisi?' : 'Are you willing to do revisions?',
    a: locale.value === 'id' ? 'Ya, setiap proyek mencakup slot revisi untuk memastikan hasil akhir benar-benar memuaskan dan berfungsi sesuai tujuan awal.' : 'Yes, every project includes revision slots to ensure the final result is truly satisfying and functions according to its original purpose.'
  }
]);

const toggleFaq = (idx: number) => {
  activeFaq.value = activeFaq.value === idx ? null : idx;
};

const openProject = (project: any) => {
  selectedProject.value = project;
  isProjectModalOpen.value = true;
};
const openCert = (cert: any) => {
  selectedCert.value = cert;
  isCertModalOpen.value = true;
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

// Scroll reveal logic
const initScrollReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible');
      }
    });
  }, { threshold: 0.08 });
  
  document.querySelectorAll('.scroll-hidden, .reveal-card, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
};

onMounted(() => {
  typeRole();
  initScrollReveal();
});

// Re-observe when pagination changes
watch([projectPage, certPage, projects, certificates], () => {
  nextTick(() => {
    initScrollReveal();
  });
});
</script>

<template>
  <div class="relative overflow-x-hidden bg-surface selection:bg-accent selection:text-white">
    <!-- Premium Decorative Elements -->
    <div class="fixed inset-0 z-0 mesh-gradient opacity-30 pointer-events-none"></div>
    <div
      class="fixed top-[15%] -left-[10%] w-[35%] h-[35%] bg-accent/10 rounded-full blur-[120px] animate-glow-pulse pointer-events-none">
    </div>
    <div
      class="fixed bottom-[15%] -right-[10%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[120px] animate-glow-pulse pointer-events-none"
      style="animation-delay: -2s"></div>

    <!-- ======================== HERO SECTION ======================== -->
    <section id="home" class="min-h-screen relative flex items-center pt-36 lg:pt-24 pb-32 overflow-hidden bg-hero-pattern">
      <div
        class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
        <!-- Left Text Content -->
        <div class="flex-1 text-center lg:text-left space-y-10">
          <div class="space-y-4">
            <p class="text-accent font-mono font-bold tracking-[0.2em] reveal-left uppercase flex items-center justify-center lg:justify-start gap-2">
              // {{ $t('hero.greeting') }} <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-yellow-500 animate-pulse" />
            </p>

            <!-- Mobile Profile Image -->
            <div class="lg:hidden py-6 flex justify-center reveal-scale">
               <div class="relative w-[240px] h-[240px] flex items-center justify-center">
                <div
                  class="relative w-[90%] h-[90%] flex items-center justify-center overflow-hidden bg-surface-alt border-[3px] border-manga-border shadow-[10px_10px_0px_var(--color-manga-border)] animate-float"
                  style="border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%">
                  <img v-if="profile?.profile_image_url" :src="profile.profile_image_url"
                    class="w-full h-full object-cover"
                    :alt="profile.name" />
                  <div v-else class="w-full h-full flex items-center justify-center bg-accent/20">
                    <UIcon name="i-heroicons-user" class="w-24 h-24 text-accent" />
                  </div>
                </div>

                <!-- Floating Terminal Snippet (Mobile) -->
                <div
                  class="absolute -bottom-2 -right-2 z-30 w-[160px] manga-card bg-[#0f172a] border-[2px] border-manga-border shadow-[6px_6px_0px_rgba(0,0,0,0.2)] overflow-hidden animate-float-alt"
                  style="animation-delay: -1.5s">
                  <div class="px-3 py-1.5 bg-[#1e293b] border-b-[2px] border-manga-border flex items-center gap-1">
                    <div class="w-2 h-2 rounded-full bg-red-500 border border-black/10"></div>
                    <div class="w-2 h-2 rounded-full bg-yellow-500 border border-black/10"></div>
                    <div class="w-2 h-2 rounded-full bg-green-500 border border-black/10"></div>
                  </div>
                  <div class="p-3 font-mono text-[9px] leading-relaxed text-left">
                    <p class="text-[#2dd4bf]">const <span class="text-[#60a5fa]">rifqi</span> = {</p>
                    <p class="pl-3 text-[#60a5fa]">role: <span class="text-[#fbbf24]">'developer'</span>,</p>
                    <p class="pl-3 text-[#60a5fa]">passion: <span class="text-[#fbbf24]">'creating'</span></p>
                    <p class="text-[#2dd4bf]">};</p>
                  </div>
                </div>
               </div>
            </div>


            <h1 class="text-4xl md:text-6xl font-black font-display tracking-tight leading-[1.1] reveal-left">
              {{ $t('hero.iam') }}
              <span class="text-text-primary manga-underline">{{
                profile?.name?.split(" ")[0] || "Rifqi"
                }}</span>
            </h1>

            <div class="flex items-center justify-center lg:justify-start gap-3 reveal-left">
              <span class="text-accent font-black text-xl font-mono">></span>
              <p class="text-text-primary text-lg md:text-xl font-mono font-bold">
                {{ displayedRole
                }}<span class="animate-blink text-accent font-light">|</span>
              </p>
            </div>
          </div>

          <p
            class="text-text-secondary text-base md:text-lg leading-relaxed max-w-[550px] mx-auto lg:mx-0 font-medium reveal-left">
            {{ $t('hero.description') }}
          </p>

          <!-- Actions & Socials -->
          <div class="space-y-10 reveal-left">
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#projects"
                class="btn-magnetic inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-manga-border shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all group">
                <UIcon name="i-heroicons-briefcase" class="w-4 h-4" />
                {{ $t('hero.cta_work') }}
                <UIcon name="i-heroicons-arrow-right"
                  class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              <a href="#certificates"
                class="btn-magnetic inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-surface text-text-primary text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)] hover:shadow-[6px_6px_0px_var(--color-manga-border)] transition-all group">
                <UIcon name="i-heroicons-trophy" class="w-4 h-4 text-accent" />
                {{ $t('hero.cta_contact') }}
              </a>
            </div>

            <!-- Social Links Row -->
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a :href="profile?.github_url || 'https://github.com/RifqiArdian09'" target="_blank" class="social-icon-btn" aria-label="GitHub">
                <UIcon name="i-simple-icons-github" class="w-5 h-5" />
              </a>
              <a :href="profile?.linkedin_url || 'https://www.linkedin.com/in/rifqi-ardian'" target="_blank" class="social-icon-btn" aria-label="LinkedIn">
                <UIcon name="i-simple-icons-linkedin" class="w-5 h-5" />
              </a>
              <a :href="profile?.instagram_url || 'https://www.instagram.com/rifqiard._/'" target="_blank" class="social-icon-btn" aria-label="Instagram">
                <UIcon name="i-simple-icons-instagram" class="w-5 h-5" />
              </a>

            </div>
          </div>
        </div>

        <!-- Right Visual Area: Premium Character & Floating Terminal (Desktop Only) -->
        <div class="relative mt-16 lg:mt-0 reveal-scale hidden lg:flex items-center justify-center lg:flex-1">
          <div class="relative lg:w-[450px] lg:h-[450px] flex items-center justify-center">
            <!-- Main Character Image (Floating & Irregular) -->
            <div class="relative z-10 w-full h-full flex items-center justify-center">
              <div
                class="relative w-[85%] h-[85%] flex items-center justify-center group overflow-hidden bg-surface-alt border-[4px] border-manga-border shadow-[12px_12px_0px_var(--color-manga-border)] animate-float"
                style="border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%">
                <img v-if="profile?.profile_image_url" :src="profile.profile_image_url"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  :alt="profile.name" />
                <div v-else class="w-full h-full flex items-center justify-center bg-accent/20">
                  <UIcon name="i-heroicons-user" class="w-32 h-32 text-accent" />
                </div>
              </div>
            </div>

            <!-- Floating Terminal Snippet -->
            <div
              class="absolute -bottom-4 -right-4 sm:-right-8 z-30 w-[200px] sm:w-[280px] manga-card bg-[#1a1b26] border-[3px] border-manga-border shadow-[10px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden animate-float-alt"
              style="animation-delay: -1.5s">
              <div class="px-4 py-2.5 bg-[#24283b] border-b-[2.5px] border-manga-border flex items-center gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black/10"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black/10"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black/10"></div>
              </div>
              <div class="p-6 font-mono text-[12px] leading-relaxed">
                <p class="text-[#bb9af7]">
                  const
                  <span class="text-[#7aa2f7]">{{
                    profile?.name?.split(" ")[0].toLowerCase() || "rifqi"
                    }}</span>
                  = {
                </p>
                <div class="pl-5 space-y-0.5 text-[#a9b1d6]">
                  <p>
                    <span class="text-[#7dcfff]">role</span>:
                    <span class="text-[#9ece6a]">"developer"</span>,
                  </p>
                  <p>
                    <span class="text-[#7dcfff]">passion</span>:
                    <span class="text-[#9ece6a]">"creating"</span>
                  </p>
                </div>
                <p class="text-[#bb9af7]">};</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- ======================== INFINITE MARQUEE ======================== -->
    <div class="relative py-12 overflow-hidden border-y-[3px] border-manga-border bg-accent rotate-[1.5deg] scale-[1.05] z-20 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
      <div class="flex animate-marquee whitespace-nowrap">
        <div v-for="n in 10" :key="n" class="flex items-center gap-12 px-6">
          <span class="text-3xl md:text-5xl font-black font-display text-white uppercase tracking-tighter italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Fullstack Web Developer
          </span>
          <UIcon name="i-heroicons-computer-desktop" class="w-8 h-8 md:w-12 md:h-12 text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse" />
          <span class="text-3xl md:text-5xl font-black font-display text-white outline-text uppercase tracking-tighter italic opacity-80">
            Mobile App Developer
          </span>
          <UIcon name="i-heroicons-device-phone-mobile" class="w-8 h-8 md:w-12 md:h-12 text-white/80" />
          <span class="text-3xl md:text-5xl font-black font-display text-white uppercase tracking-tighter italic">
            IT Enthusiast
          </span>
          <UIcon name="i-heroicons-shield-check" class="w-8 h-8 md:w-12 md:h-12 text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>
      </div>
    </div>

    <!-- ======================== ABOUT ======================== -->
    <section id="about" class="py-32 bg-surface scroll-mt-20 relative overflow-hidden">
      <!-- Floating Abstract Balls -->
      <div class="absolute top-20 -right-10 w-32 h-32 rounded-full border-4 border-manga-border bg-accent/20 shadow-[8px_8px_0px_var(--color-manga-border)] animate-float pointer-events-none z-0"></div>
      <div class="absolute bottom-40 -left-12 w-48 h-48 rounded-full border-4 border-manga-border bg-blue-500/10 shadow-[10px_10px_0px_var(--color-manga-border)] animate-float-alt pointer-events-none z-0"></div>
      <div class="absolute top-1/2 left-1/4 w-12 h-12 rounded-full border-2 border-manga-border bg-yellow-500/20 shadow-[4px_4px_0px_var(--color-manga-border)] animate-pulse pointer-events-none z-0"></div>
      <div class="absolute top-1/3 right-1/4 w-16 h-16 rounded-full border-2 border-manga-border bg-accent/5 animate-float pointer-events-none z-0" style="animation-delay: -3s"></div>
      <div class="absolute bottom-10 right-1/2 w-8 h-8 rounded-full border-2 border-manga-border bg-blue-500/20 animate-float-alt pointer-events-none z-0"></div>
      <div class="absolute top-10 left-1/3 w-6 h-6 rounded-full bg-accent/30 animate-pulse pointer-events-none z-0"></div>
      
      
      
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <!-- Left Content -->
          <div class="space-y-12">
            <div class="space-y-6">
              <span
                class="manga-badge mb-6 py-2 px-6 font-bold tracking-widest uppercase bg-accent text-white border-manga-border reveal-left inline-block">
                {{ $t('about.badge') }}
              </span>

              <h2
                class="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.1] reveal-left">
                {{ $t('about.title_start') }}
                <span class="text-accent">{{ $t('about.title_accent') }}</span>
              </h2>
            </div>

            <div class="space-y-6 text-text-secondary text-lg leading-relaxed font-medium reveal-left">
              <p>
                {{ $t('about.description_1', { name: profile?.name || 'Rifqi Ardian' }) }}
              </p>
              <p>
                {{ $t('about.description_2') }}
              </p>
            </div>

            <!-- Stats Grid - Premium Cards -->
            <div class="grid grid-cols-3 gap-4 reveal-left">
              <div v-for="stat in [
                {
                  label: $t('about.stats.projects'),
                  value: (projectData?.total || 0) + '+',
                  icon: 'i-heroicons-command-line',
                },
                {
                  label: $t('about.stats.certificates'),
                  value: (certData?.total || 0) + '+',
                  icon: 'i-heroicons-academic-cap',
                },
                { label: $t('about.stats.years'), value: '3+', icon: 'i-heroicons-calendar' },
              ]" :key="stat.label"
                class="manga-card p-4 text-center group bg-surface/50 backdrop-blur-sm relative overflow-hidden hover:border-accent transition-all duration-500 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff1]">
                <div class="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <UIcon :name="stat.icon"
                  class="w-6 h-6 mx-auto mb-2 text-accent group-hover:scale-110 transition-transform duration-500" />
                <div class="text-xl md:text-2xl font-black font-display mb-0.5 text-text-primary tracking-tighter">
                  {{ stat.value }}
                </div>
                <div
                  class="text-[8px] font-black font-mono text-text-secondary uppercase tracking-[0.1em]">
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Right Content: Terminal Window -->
          <div class="reveal-right">
            <div
              class="manga-card overflow-hidden bg-[#1a1b26] border-[4px] border-manga-border shadow-[12px_12px_0px_var(--color-manga-border)]">
              <!-- Window Header -->
              <div class="px-6 py-4 bg-[#24283b] border-b-[3px] border-manga-border flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3.5 h-3.5 rounded-full bg-red-500 border border-black/20"></div>
                  <div class="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-black/20"></div>
                  <div class="w-3.5 h-3.5 rounded-full bg-green-500 border border-black/20"></div>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-accent" />
                  <span class="text-xs font-mono font-bold text-text-secondary tracking-widest">PERSONALITY.JSON</span>
                </div>
                <div class="w-12"></div>
                <!-- Spacer -->
              </div>

              <!-- Code Content -->
              <div class="p-8 md:p-10 font-mono text-sm md:text-base leading-relaxed overflow-x-auto text-[#a9b1d6]">
                <div class="space-y-1">
                  <p class="text-[#565f89] font-bold">{</p>
                  <div class="pl-6 space-y-1">
                    <p>
                      <span class="text-[#7aa2f7]">"name"</span>:
                      <span class="text-[#9ece6a]">"{{ profile?.name || "Rifqi Ardian" }}"</span>,
                    </p>
                    <p>
                      <span class="text-[#7aa2f7]">"role"</span>:
                      <span class="text-[#9ece6a]">"Student & Developer"</span>,
                    </p>
                    <p>
                      <span class="text-[#7aa2f7]">"location"</span>:
                      <span class="text-[#9ece6a]">"{{ profile?.location || "Indonesia" }}"</span>,
                    </p>
                    <p><span class="text-[#7aa2f7]">"skills"</span>: [</p>
                    <div class="pl-6">
                      <p>
                        <span class="text-[#9ece6a]">"Fullstack Web Developer"</span>,
                      </p>
                      <p>
                        <span class="text-[#9ece6a]">"Software Engineering Student"</span>,
                      </p>
                      <p>
                        <span class="text-[#9ece6a]">"Mobile App Developer"</span>
                      </p>
                    </div>
                    <p>],</p>
                    <p>
                      <span class="text-[#7aa2f7]">"currentFocus"</span>:
                      <span class="text-[#9ece6a]">"Building scalable web & mobile applications"</span>,
                    </p>
                    <p>
                      <span class="text-[#7aa2f7]">"funFact"</span>:
                      <span class="text-[#9ece6a]">"I enjoy turning startup ideas into real
                        products"</span>
                    </p>
                  </div>
                  <p class="text-[#565f89] font-bold">}</p>
                </div>
              </div>
            </div>

            <!-- Tech Stack Row below Terminal -->
            <div class="mt-8 space-y-4">
              <p class="text-[10px] font-black font-mono text-text-secondary uppercase tracking-[0.3em]">
                Main Technology Stack
              </p>
              <div class="flex flex-wrap gap-3">
                <div v-for="tech in [
                  {
                    name: 'HTML5',
                    icon: 'i-simple-icons-html5',
                    color: '#E34F26',
                  },
                  {
                    name: 'CSS3',
                    icon: 'i-simple-icons-css3',
                    color: '#1572B6',
                  },
                  {
                    name: 'JavaScript',
                    icon: 'i-simple-icons-javascript',
                    color: '#F7DF1E',
                  },
                  {
                    name: 'TypeScript',
                    icon: 'i-simple-icons-typescript',
                    color: '#007ACC',
                  },
                  {
                    name: 'PHP',
                    icon: 'i-simple-icons-php',
                    color: '#777BB4',
                  },
                  {
                    name: 'Python',
                    icon: 'i-simple-icons-python',
                    color: '#3776AB',
                  },
                  {
                    name: 'Tailwind CSS',
                    icon: 'i-simple-icons-tailwindcss',
                    color: '#06B6D4',
                  },
                  {
                    name: 'Laravel',
                    icon: 'i-simple-icons-laravel',
                    color: '#FF2D20',
                  },
                  {
                    name: 'React',
                    icon: 'i-simple-icons-react',
                    color: '#61DAFB',
                  },
                  {
                    name: 'Next.js',
                    icon: 'i-simple-icons-nextdotjs',
                    color: 'currentColor',
                  },
                  {
                    name: 'Vue.js',
                    icon: 'i-simple-icons-vuedotjs',
                    color: '#4FC08D',
                  },
                  {
                    name: 'Java',
                    icon: 'i-mdi-language-java',
                    color: '#ED8B00',
                  },
                  {
                    name: 'Android Studio',
                    icon: 'i-simple-icons-androidstudio',
                    color: '#3DDC84',
                  },
                  {
                    name: 'MySQL',
                    icon: 'i-simple-icons-mysql',
                    color: '#4479A1',
                  },
                  {
                    name: 'Supabase',
                    icon: 'i-simple-icons-supabase',
                    color: '#21c387',
                  },
                  {
                    name: 'Git',
                    icon: 'i-simple-icons-git',
                    color: '#f05032',
                  },
                  {
                    name: 'Github',
                    icon: 'i-simple-icons-github',
                    color: '#181717',
                  }
                
                  
                ]" :key="tech.name"
                  class="w-11 h-11 rounded-xl bg-surface border-2 border-manga-border flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-[3px_3px_0px_var(--color-manga-border)] group tech-icon-glow"
                  :title="tech.name">
                  <UIcon :name="tech.icon" class="w-5 h-5 transition-colors group-hover:text-white"
                    :style="{ color: tech.color }" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================== PROJECTS ======================== -->
    <section id="projects" class="py-32 scroll-mt-20 relative bg-hero-pattern">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center mb-24 reveal-scale">
          <span
            class="manga-badge mb-6 py-2 px-6 font-bold tracking-widest uppercase bg-accent text-white border-manga-border">
            {{ $t('projects.badge') }}
          </span>
          <h2 class="section-heading text-4xl md:text-5xl text-center">
            {{ $t('projects.title') }}
          </h2>
          <p class="mt-4 text-text-secondary text-center max-w-2xl font-medium">
            {{ $t('projects.subtitle') }}
          </p>
        </div>

        <div v-if="projects && projects.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          <div v-for="(project, idx) in projects" :key="project.id" class="group relative flex flex-col reveal-card"
            :class="`reveal-delay-${idx + 1}`" @click="openProject(project)">
            <!-- Project Card Core -->
            <div
              class="manga-card overflow-hidden cursor-pointer flex flex-col h-full bg-surface relative z-10 hover:-translate-y-2 transition-all duration-500 hover:border-accent hover:shadow-[12px_12px_0px_var(--color-accent-soft)]">
              <!-- Image Container -->
              <div class="relative aspect-video overflow-hidden bg-surface-alt border-b-[3px] border-manga-border">
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500">
                </div>
                <img v-if="project.thumbnail_url" :src="project.thumbnail_url" :alt="project.title"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy" />
                <div v-else class="w-full h-full flex items-center justify-center img-shimmer">
                  <UIcon name="i-heroicons-photo" class="w-12 h-12 text-text-secondary opacity-20" />
                </div>

                <!-- Floating Tags Over Image -->
                <div class="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
                  <span v-for="tech in project.project_tech?.slice(0, 2)" :key="tech.id"
                    class="px-2 py-0.5 glass-panel text-[8px] font-black font-mono uppercase tracking-[0.2em] text-white border-white/20">
                    {{ tech.tech_name }}
                  </span>
                </div>
              </div>

              <!-- Content Container -->
              <div class="p-5 space-y-4 flex-1 flex flex-col">
                <div class="space-y-2">
                  <h3
                    class="font-display font-black text-xl group-hover:text-accent transition-colors duration-300 leading-tight">
                    {{ project.title }}
                  </h3>
                  <p class="text-text-secondary text-sm line-clamp-2 flex-1 font-medium leading-relaxed opacity-80">
                    {{ project.description }}
                  </p>
                </div>

                <div class="pt-4 border-t border-divider space-y-4 mt-auto">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <UAvatarGroup v-if="
                        project.status === 'Team Project' &&
                        project.project_team_members?.length > 0
                      " size="xs" :max="10">
                        <ULink v-for="member in project.project_team_members" :key="member.id" :to="member.github_url"
                          target="_blank" class="hover:ring-2 hover:ring-accent transition rounded-full" raw>
                          <UAvatar :src="member.username === 'RifqiArdian09' 
                              ? profile?.profile_image_url 
                              : (member.github_url ? `${member.github_url}.png` : `https://github.com/${member.username}.png`)
                            " :alt="member.username" size="xs" loading="lazy" />
                        </ULink>
                      </UAvatarGroup>
                      <div v-else class="flex items-center">
                        <ULink :to="profile?.github || '#'" target="_blank"
                          class="hover:ring-2 hover:ring-accent transition rounded-full" raw>
                          <UAvatar :src="profile?.profile_image_url ||
                            'https://github.com/benjamincanac.png'
                            " size="xs" />
                        </ULink>
                      </div>
                      <span class="text-[9px] font-black font-mono text-text-secondary uppercase tracking-[0.2em]">
                        {{
                          project.status === "Team Project" ? "Team" : "Solo"
                        }}
                      </span>
                    </div>
                  </div>

                  <div :class="[
                    project.demo_url && project.github_url
                      ? 'flex flex-col'
                      : 'flex flex-wrap',
                    'gap-2',
                  ]">
                    <a v-if="project.id" @click="openProject(project)"
                      class="flex items-center justify-center gap-2 py-2 bg-[#f59e0b] text-white text-[9px] font-black uppercase tracking-widest rounded-lg border-2 border-manga-border shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] transition-all cursor-pointer"
                      :class="[
                        project.demo_url && project.github_url
                          ? 'w-full'
                          : project.demo_url || project.github_url
                            ? 'flex-1'
                            : 'w-full',
                      ]">
                      <UIcon name="i-heroicons-book-open" class="w-3.5 h-3.5" />
                      Detail
                    </a>
                    <a v-if="project.demo_url" :href="project.demo_url" target="_blank"
                      class="flex items-center justify-center gap-2 py-2 bg-accent text-white text-[9px] font-black uppercase tracking-widest rounded-lg border-2 border-manga-border shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] transition-all"
                      :class="[
                        project.demo_url && project.github_url
                          ? 'w-full'
                          : 'flex-1',
                      ]" @click.stop>
                      <UIcon name="i-heroicons-globe-alt" class="w-3.5 h-3.5" />
                      Demo
                    </a>
                    <a v-if="project.github_url" :href="project.github_url" target="_blank"
                      class="flex items-center justify-center gap-2 py-2 bg-[#0f172a] text-white text-[9px] font-black uppercase tracking-widest rounded-lg border-2 border-manga-border shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] transition-all"
                      :class="[
                        project.demo_url && project.github_url
                          ? 'w-full'
                          : 'flex-1',
                      ]" @click.stop>
                      <UIcon name="i-simple-icons-github" class="w-3.5 h-3.5" />
                      Code
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <!-- Background Glow Decor -->
            <div
              class="absolute -inset-2 bg-accent/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 -z-0">
            </div>
          </div>
        </div>

        <!-- Pagination Projects -->
        <div v-if="totalProjectPages > 1" class="flex items-center justify-center gap-6 mt-20 reveal-scale">
          <button @click="
            projectPage--;
          scrollToSection('projects');
          " :disabled="projectPage === 1"
            class="w-14 h-14 rounded-2xl border-[3px] border-manga-border flex items-center justify-center transition-all shadow-[4px_4px_0px_var(--color-manga-border)] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--color-manga-border)] bg-surface text-text-primary group">
            <UIcon name="i-heroicons-arrow-left" class="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div class="flex items-center gap-2">
            <span class="font-display font-black text-xl text-accent">{{
              projectPage
              }}</span>
            <span class="text-text-secondary font-bold">/</span>
            <span class="font-display font-bold text-lg text-text-secondary">{{
              totalProjectPages
              }}</span>
          </div>

          <button @click="
            projectPage++;
          scrollToSection('projects');
          " :disabled="projectPage === totalProjectPages"
            class="w-14 h-14 rounded-2xl border-[3px] border-manga-border flex items-center justify-center transition-all shadow-[4px_4px_0px_var(--color-manga-border)] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--color-manga-border)] bg-surface text-text-primary group">
            <UIcon name="i-heroicons-arrow-right" class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>

    <!-- ======================== CERTIFICATES ======================== -->
    <section id="certificates" class="py-32 bg-surface scroll-mt-20 relative overflow-hidden">
      <!-- Floating Abstract Balls -->
      <div class="absolute top-10 left-10 w-24 h-24 rounded-full border-4 border-manga-border bg-accent/10 shadow-[6px_6px_0px_var(--color-manga-border)] animate-float-alt pointer-events-none z-0"></div>
      <div class="absolute bottom-20 right-0 w-40 h-40 rounded-full border-4 border-manga-border bg-blue-500/10 shadow-[12px_12px_0px_var(--color-manga-border)] animate-float pointer-events-none z-0"></div>
      <div class="absolute top-1/2 right-20 w-14 h-14 rounded-full border-2 border-manga-border bg-accent/5 animate-pulse pointer-events-none z-0"></div>
      <div class="absolute bottom-10 left-1/4 w-10 h-10 rounded-full border-2 border-manga-border bg-yellow-500/10 animate-float pointer-events-none z-0"></div>
      <div class="absolute top-1/4 left-1/2 w-6 h-6 rounded-full bg-blue-500/20 animate-float-alt pointer-events-none z-0"></div>
      
      
      
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col items-center mb-24 reveal-scale">
          <span
            class="manga-badge mb-6 py-2 px-6 font-bold tracking-widest uppercase bg-accent text-white border-manga-border">
            {{ $t('certificates.badge') }}
          </span>
          <h2 class="section-heading text-4xl md:text-5xl text-center">
            {{ $t('certificates.title') }}
          </h2>
          <p class="mt-4 text-text-secondary text-center max-w-2xl font-medium">
            {{ $t('certificates.subtitle') }}
          </p>
        </div>

        <div v-if="certificates && certificates.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          <div v-for="cert in certificates" :key="cert.id"
            class="manga-card overflow-hidden flex flex-col h-full group reveal-card hover:-translate-y-1 transition-all duration-500 shadow-[8px_8px_0px_var(--color-manga-border)] hover:shadow-[12px_12px_0px_var(--color-accent-soft)]">
            <div class="relative aspect-video overflow-hidden bg-surface-alt/50 border-b-[3px] border-manga-border flex items-center justify-center p-2">
              <img v-if="cert.image_url" :src="cert.image_url" :alt="cert.title"
                class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-1000"
                loading="lazy" />
              <div v-else class="w-full h-full flex items-center justify-center img-shimmer">
                <UIcon name="i-heroicons-academic-cap" class="w-12 h-12 text-text-secondary opacity-20" />
              </div>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between space-y-4 relative overflow-hidden bg-surface">
              <div
                class="absolute -right-4 -bottom-4 w-24 h-24 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors">
              </div>

              <div class="space-y-3">
                <h3
                  class="font-display font-black text-lg group-hover:text-accent transition-colors duration-300 line-clamp-2 leading-tight">
                  {{ cert.title }}
                </h3>
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                    <UIcon name="i-heroicons-building-office-2" class="w-3 h-3 text-accent" />
                  </div>
                  <span class="text-text-secondary text-[11px] font-bold truncate">{{ cert.issuer }}</span>
                </div>
              </div>

              <div class="pt-4 border-t border-divider flex items-center gap-3 mt-auto">
                <div
                  class="px-2.5 py-1.5 bg-surface-alt rounded-lg border-2 border-manga-border text-[9px] font-black font-mono text-text-primary shadow-[2px_2px_0px_var(--color-manga-border)] shrink-0">
                  {{ new Date(cert.issued_at).getFullYear() }}
                </div>
                
                <a v-if="cert.verification_url" :href="cert.verification_url" target="_blank"
                  class="flex-1 flex items-center justify-center gap-2 py-1.5 bg-accent text-white text-[9px] font-black uppercase tracking-widest rounded-lg border-2 border-manga-border shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] transition-all">
                  {{ $t('certificates.verify') }} <UIcon name="i-heroicons-arrow-up-right" class="w-3.5 h-3.5" />
                </a>
                <div v-else
                  class="flex-1 flex items-center justify-center gap-2 py-1.5 bg-surface-alt text-text-secondary text-[9px] font-black uppercase tracking-widest rounded-lg border-2 border-divider opacity-60">
                  {{ $t('certificates.no_link') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Certificates -->
        <div v-if="totalCertPages > 1" class="flex items-center justify-center gap-6 mt-20 reveal-scale">
          <button @click="
            certPage--;
          scrollToSection('certificates');
          " :disabled="certPage === 1"
            class="w-14 h-14 rounded-2xl border-[3px] border-manga-border flex items-center justify-center transition-all shadow-[4px_4px_0px_var(--color-manga-border)] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--color-manga-border)] bg-surface text-text-primary group">
            <UIcon name="i-heroicons-arrow-left" class="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div class="flex items-center gap-2">
            <span class="font-display font-black text-xl text-accent">{{
              certPage
              }}</span>
            <span class="text-text-secondary font-bold">/</span>
            <span class="font-display font-bold text-lg text-text-secondary">{{
              totalCertPages
              }}</span>
          </div>

          <button @click="
            certPage++;
          scrollToSection('certificates');
          " :disabled="certPage === totalCertPages"
            class="w-14 h-14 rounded-2xl border-[3px] border-manga-border flex items-center justify-center transition-all shadow-[4px_4px_0px_var(--color-manga-border)] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--color-manga-border)] bg-surface text-text-primary group">
            <UIcon name="i-heroicons-arrow-right" class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>


    <!-- ======================== FAQ ======================== -->
    <section id="faq" class="py-32 bg-hero-pattern scroll-mt-20 relative overflow-hidden">
      <!-- Floating Abstract Balls -->
      <div class="absolute top-1/2 -left-10 w-28 h-28 rounded-full border-4 border-manga-border bg-accent/15 shadow-[8px_8px_0px_var(--color-manga-border)] animate-float pointer-events-none z-0"></div>
      <div class="absolute top-20 right-20 w-16 h-16 rounded-full border-2 border-manga-border bg-blue-500/10 shadow-[4px_4px_0px_var(--color-manga-border)] animate-float-alt pointer-events-none z-0"></div>
      <div class="absolute bottom-10 right-1/3 w-20 h-20 rounded-full border-2 border-manga-border bg-accent/5 animate-float pointer-events-none z-0"></div>
      <div class="absolute top-10 left-1/4 w-8 h-8 rounded-full bg-yellow-500/20 animate-pulse pointer-events-none z-0"></div>
      <div class="absolute bottom-1/4 left-1/3 w-6 h-6 rounded-full bg-accent/30 animate-float-alt pointer-events-none z-0"></div>
      
      
      
      <div class="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col items-center mb-20 reveal-scale">
          <span
            class="manga-badge mb-6 py-2 px-6 font-bold tracking-widest uppercase bg-accent text-white border-manga-border">
            {{ locale === 'id' ? '05. PERTANYAAN' : '05. QUESTIONS' }}
          </span>
          <h2 class="section-heading text-4xl md:text-5xl text-center">
            Frequently Asked <span class="text-accent">Questions</span>
          </h2>
          <p class="mt-4 text-text-secondary text-center max-w-2xl font-medium">
            {{ locale === 'id' ? 'Beberapa hal yang sering ditanyakan tentang saya dan layanan saya.' : 'Some common questions about me and my services.' }}
          </p>
        </div>

        <div class="space-y-4 mb-20">
          <div v-for="(faq, idx) in faqs" :key="idx" 
            class="manga-card overflow-hidden transition-all duration-500 bg-surface border-2"
            :class="activeFaq === idx ? 'border-accent shadow-[8px_8px_0px_var(--color-accent-soft)]' : 'border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)]'">
            <button 
              @click="toggleFaq(idx)"
              class="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer group">
              <span class="font-display font-black text-lg md:text-xl pr-8 transition-colors group-hover:text-accent">
                {{ faq.q }}
              </span>
              <div class="w-10 h-10 shrink-0 rounded-xl border-2 border-manga-border flex items-center justify-center transition-all"
                :class="activeFaq === idx ? 'bg-accent text-white border-accent rotate-180' : 'bg-surface-alt text-text-primary'">
                <UIcon name="i-heroicons-chevron-down" class="w-6 h-6" />
              </div>
            </button>
            
            <div 
              class="transition-all duration-500 ease-in-out overflow-hidden"
              :style="{ maxHeight: activeFaq === idx ? '300px' : '0' }">
              <div class="px-6 pb-6 pt-2 text-text-secondary font-medium leading-relaxed md:text-lg border-t-2 border-divider/10 mt-2 mx-4">
                {{ faq.a }}
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </section>

    <!-- ======================== MODALS ======================== -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="isProjectModalOpen || isCertModalOpen" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[998]"
          @click="isProjectModalOpen = isCertModalOpen = false"></div>
      </Transition>

      <!-- Project Modal -->
      <Transition name="modal">
        <div v-if="isProjectModalOpen && selectedProject"
          class="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 md:p-8">
          <div
            class="manga-card w-full max-w-[850px] max-h-[92vh] flex flex-col overflow-hidden bg-surface shadow-[10px_10px_0px_rgba(0,0,0,0.1)] md:shadow-[15px_15px_0px_rgba(0,0,0,0.1)]"
            @click.stop>
            
            <!-- Modal Header (Title & Close Button) -->
            <div class="flex items-center justify-between p-3 md:p-5 border-b-4 border-manga-border bg-surface shrink-0 z-30">
              <div class="flex-1 min-w-0 pr-4 pl-2">
                <h2 class="font-display font-black text-base md:text-2xl text-text-primary truncate">
                  {{ selectedProject.title }}
                </h2>
              </div>
              <button @click="isProjectModalOpen = false"
                class="w-9 h-9 md:w-10 md:h-10 rounded-xl border-2 border-manga-border flex items-center justify-center cursor-pointer hover:bg-accent hover:text-white transition-all group/close bg-surface-alt shrink-0">
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto custom-scrollbar bg-noise relative">
              <!-- Decorative background element -->
              <div class="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[120px] pointer-events-none"></div>

              <!-- Main Hero Image (Full Width) -->
              <div class="w-full bg-surface-alt border-b-2 border-divider flex items-center justify-center min-h-[200px] md:min-h-[350px] relative overflow-hidden group">
                <img v-if="selectedProject.thumbnail_url" :src="selectedProject.thumbnail_url"
                  class="max-w-full max-h-[450px] object-contain shadow-2xl relative z-10" />
                <div v-else class="w-full h-48 flex items-center justify-center">
                   <UIcon name="i-heroicons-photo" class="w-20 h-20 text-text-secondary opacity-10" />
                </div>
                <!-- Background blur of the same image for depth -->
                <img v-if="selectedProject.thumbnail_url" :src="selectedProject.thumbnail_url"
                  class="absolute inset-0 w-full h-full object-cover blur-3xl opacity-10 scale-110" />
              </div>

              <!-- Main Grid Layout -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-0">
                
                <!-- Left Column: Content & Description -->
                <div class="lg:col-span-8 p-6 md:p-10 space-y-10 border-r-0 lg:border-r-2 border-divider bg-surface/30">
                  
                  <!-- Description -->
                  <div class="relative py-2">
                    <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="absolute -top-4 -left-4 w-12 h-12 text-accent/10 -z-10" />
                    <p class="text-base md:text-xl text-text-primary leading-relaxed font-medium italic border-l-4 border-accent pl-5 md:pl-8 py-1">
                      {{ selectedProject.description }}
                    </p>
                  </div>

                  <!-- Full Case Study Content -->
                  <div class="prose prose-slate dark:prose-invert max-w-none">
                    <div class="flex items-center gap-3 mb-6">
                       <h4 class="font-display font-black text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-lg">Case Study</h4>
                       <div class="h-px flex-1 bg-divider"></div>
                    </div>
                    <div v-html="selectedProject.content" class="text-sm md:text-base leading-relaxed text-text-primary/80 space-y-4 font-medium">
                    </div>
                  </div>

                  <!-- Project Gallery Section (Main Column) -->
                  <div v-if="selectedProject.project_images?.length > 0" class="pt-6 space-y-6">
                    <div class="flex items-center gap-3">
                      <h4 class="font-display font-black text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-lg">Gallery</h4>
                      <div class="h-px flex-1 bg-divider"></div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div v-for="(img, idx) in selectedProject.project_images" :key="idx" 
                        class="group/img relative rounded-xl overflow-hidden border-2 border-manga-border shadow-[4px_4px_0px_var(--color-manga-border)] hover:shadow-[6px_6px_0px_var(--color-accent-soft)] transition-all duration-500 bg-surface-alt flex items-center justify-center">
                        <img :src="img.image_url" :alt="img.caption || 'Project Screenshot'" class="max-w-full max-h-full object-contain transition-transform duration-700 group-hover/img:scale-105" />
                        <div v-if="img.caption" class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-2 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all duration-500">
                          <p class="text-[9px] font-bold text-white uppercase tracking-widest">{{ img.caption }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Sidebar Metadata -->
                <div class="lg:col-span-4 p-6 md:p-8 space-y-8 bg-surface-alt/20">
                  
                  <!-- Project Type Badge -->
                  <div class="p-4 rounded-xl border-2 border-manga-border bg-surface shadow-[4px_4px_0px_var(--color-manga-border)]">
                    <p class="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Project Type</p>
                    <div class="flex items-center gap-2">
                      <UIcon :name="selectedProject.status === 'Team Project' ? 'i-heroicons-users' : 'i-heroicons-user'" class="w-5 h-5 text-accent" />
                      <span class="font-display font-black text-lg text-text-primary">{{ selectedProject.status }}</span>
                    </div>
                  </div>

                  <!-- Tech Stack -->
                  <div class="space-y-3">
                    <p class="text-[9px] font-black text-text-secondary uppercase tracking-widest border-b-2 border-divider pb-2">Technologies</p>
                    <div class="flex flex-wrap gap-2">
                      <span v-for="tech in selectedProject.project_tech" :key="tech.id"
                        class="px-2.5 py-1.5 bg-surface border-2 border-manga-border text-text-primary text-[9px] font-black uppercase tracking-widest rounded-lg shadow-[2px_2px_0px_var(--color-manga-border)]">
                        {{ tech.tech_name }}
                      </span>
                    </div>
                  </div>

                  <!-- Release Date -->
                  <div class="space-y-2">
                    <p class="text-[9px] font-black text-text-secondary uppercase tracking-widest border-b-2 border-divider pb-2">Release</p>
                    <div class="flex items-center gap-3 text-text-primary font-bold">
                      <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-accent" />
                      <span>{{ selectedProject.date }}</span>
                    </div>
                  </div>

                  <!-- Team Members (Conditional) -->
                  <div v-if="selectedProject.status === 'Team Project' && selectedProject.project_team_members?.length > 0" class="space-y-4">
                    <p class="text-[9px] font-black text-text-secondary uppercase tracking-widest border-b-2 border-divider pb-2">Team Members</p>
                    <div class="grid grid-cols-1 gap-3">
                      <a v-for="member in selectedProject.project_team_members" :key="member.id" :href="member.github_url"
                        target="_blank"
                        class="p-3 rounded-xl bg-surface border-2 border-divider flex items-center gap-3 group/member hover:border-accent transition-all shadow-sm">
                        <UAvatar :src="member.username === 'RifqiArdian09' 
                            ? profile?.profile_image_url 
                            : (member.github_url ? `${member.github_url}.png` : `https://github.com/${member.username}.png`)
                          " size="sm" class="border-2 border-manga-border" />
                        <div class="flex-1 min-w-0">
                          <p class="font-black text-[11px] truncate text-text-primary">{{ member.username }}</p>
                        </div>
                        <UIcon name="i-heroicons-arrow-up-right" class="w-3 h-3 text-text-secondary group-hover/member:text-accent" />
                      </a>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="space-y-3 pt-6">
                    <p class="text-[9px] font-black text-text-secondary uppercase tracking-widest border-b-2 border-divider pb-2">Quick Links</p>
                    <div class="flex flex-col gap-3">
                      <a v-if="selectedProject.demo_url" :href="selectedProject.demo_url" target="_blank"
                        class="flex items-center justify-center gap-3 px-6 py-4 bg-accent text-white font-black rounded-xl border-2 border-manga-border shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-0 transition-all uppercase text-[10px] tracking-widest">
                        <UIcon name="i-heroicons-globe-alt" class="w-5 h-5" /> Live Preview
                      </a>
                      <a v-if="selectedProject.github_url" :href="selectedProject.github_url" target="_blank"
                        class="flex items-center justify-center gap-3 px-6 py-4 bg-[#0f172a] text-white font-black rounded-xl border-2 border-manga-border shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-0 transition-all uppercase text-[10px] tracking-widest">
                        <UIcon name="i-simple-icons-github" class="w-5 h-5" /> Source Code
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
