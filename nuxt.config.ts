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
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY
    }
  },
  supabase: {
    redirectOptions: {
      login: '/admin/login',
      callback: '/confirm',
      exclude: [
        '/',
        '/id',
        '/id/**',
        '/en',
        '/en/**',
        '/about',
        '/projects',
        '/projects/**',
        '/blog',
        '/blog/**',
        '/certificates',
        '/certificates/**',
        '/contact',
        '/contact/**',
        '/confirm',
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