<script setup lang="ts">
definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    router.push('/admin')
  }
})

const loading = ref(false)
const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (signInError) throw signInError
    router.push('/admin')
  } catch (e: any) {
    error.value = e.message || 'Failed to sign in'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex font-['Space_Grotesk'] bg-[#020617]">

    <!-- Left Brand Panel (hidden on mobile) -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12">
      <!-- Animated blobs -->
      <div class="absolute -top-20 -left-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl animate-pulse" style="animation-delay: 2s;"></div>

      <!-- Brand content -->
      <div class="relative z-10 text-center">
        <div class="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-teal-500/30 rotate-3 hover:rotate-0 transition-transform duration-300">
          <span class="text-white font-bold text-3xl">A</span>
        </div>
        <h2 class="text-4xl font-bold text-white mb-3 tracking-tight">Admin Panel</h2>
        <p class="text-slate-400 text-lg max-w-sm leading-relaxed">
          Your personal portfolio CMS. Manage projects, blog posts, and your profile — all in one place.
        </p>

        <div class="mt-12 grid grid-cols-3 gap-6 max-w-xs mx-auto">
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <UIcon name="i-heroicons-briefcase" class="text-teal-400 w-5 h-5" />
            </div>
            <span class="text-xs text-slate-500">Projects</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <UIcon name="i-heroicons-document-text" class="text-blue-400 w-5 h-5" />
            </div>
            <span class="text-xs text-slate-500">Blog</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <UIcon name="i-heroicons-user-circle" class="text-indigo-400 w-5 h-5" />
            </div>
            <span class="text-xs text-slate-500">Profile</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Form Panel -->
    <div class="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      <!-- Mobile background blobs -->
      <div class="absolute -top-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl lg:hidden"></div>
      <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl lg:hidden"></div>

      <!-- Divider line for large screens -->
      <div class="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>

      <div class="w-full max-w-sm relative z-10">
        <!-- Mobile logo -->
        <div class="lg:hidden text-center mb-8">
          <div class="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-500/20 rotate-3">
            <span class="text-white font-bold text-xl">A</span>
          </div>
          <h1 class="text-2xl font-bold text-white">Admin Panel</h1>
        </div>

        <!-- Form heading -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
          <p class="text-slate-400 mt-2 text-sm">Enter your credentials to access the dashboard.</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-slate-300">Email Address</label>
            <UInput
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              icon="i-heroicons-envelope"
              size="lg"
              class="w-full rounded-xl"
            />
          </div>

          <!-- Password with show/hide -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-slate-300">Password</label>
            <div class="relative">
              <UInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                icon="i-heroicons-lock-closed"
                size="lg"
                class="w-full rounded-xl"
                :ui="{ trailing: 'pe-1' }"
              >
                <template #trailing>
                  <UButton
                    :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    class="rounded-lg text-slate-400 hover:text-teal-400"
                    type="button"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </div>
          </div>

          <!-- Error Alert -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-if="error" class="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 shrink-0 mt-0.5" />
              <span>{{ error }}</span>
            </div>
          </Transition>

          <!-- Submit Button -->
          <UButton
            type="submit"
            block
            size="xl"
            color="primary"
            :loading="loading"
            icon="i-heroicons-arrow-right-on-rectangle"
            class="rounded-xl shadow-xl shadow-teal-500/20 font-semibold tracking-wide mt-2"
          >
            {{ loading ? 'Signing in...' : 'Access Dashboard' }}
          </UButton>
        </form>

        <!-- Back link -->
        <div class="mt-8 text-center">
          <UButton
            to="/"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-heroicons-arrow-left"
            class="text-slate-500 hover:text-slate-300 rounded-xl"
          >
            Back to Portfolio
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
</style>
