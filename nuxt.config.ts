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
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/admin/login',
      callback: '/confirm',
      exclude: ['/', '/about', '/projects', '/projects/*', '/blog', '/blog/*', '/certificates', '/contact'],
    }
  },
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'id', iso: 'id-ID', name: 'Indonesia', file: 'id.json' }
    ],
    defaultLocale: 'en',
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