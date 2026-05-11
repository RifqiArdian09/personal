// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/app.css'],
  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n'
  ],
  runtimeConfig: {
    public: {
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL,
        key: process.env.NUXT_PUBLIC_SUPABASE_KEY
      }
    }
  },
  supabase: {
    redirectOptions: {
      login: '/admin/login',
      callback: '/confirm',
      exclude: [
        '/',
        '/id',
        '/id/',
        '/about',
        '/id/about',
        '/projects',
        '/projects/*',
        '/id/projects',
        '/id/projects/*',
        '/blog',
        '/blog/*',
        '/id/blog',
        '/id/blog/*',
        '/certificates',
        '/id/certificates',
        '/contact',
        '/id/contact',
      ],
    }
  },
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'id', iso: 'id-ID', name: 'Indonesia', file: 'id.json' }
    ],
    defaultLocale: 'id',
    langDir: '../locales',
    strategy: 'prefix_except_default'
  },
  googleFonts: {
    families: {
      'Space Grotesk': [400, 500, 600, 700],
      'Inter': [400, 500, 600, 700],
      'JetBrains Mono': [400, 500]
    }
  },
})