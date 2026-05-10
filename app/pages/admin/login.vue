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
  <div class="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-['Space_Grotesk'] relative overflow-hidden">
    <!-- Decorative Background -->
    <div class="absolute top-0 left-0 w-full h-full">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
    </div>

    <UCard 
      class="w-full max-w-md relative z-10 border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden"
      :ui="{ body: 'p-8 md:p-10' }"
    >
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/20 rotate-3">
          <span class="text-white font-bold text-2xl">A</span>
        </div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
        <p class="text-slate-400 mt-2">Sign in to manage your digital portfolio</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <UFormField label="Email Address">
          <UInput
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            icon="i-heroicons-envelope"
            size="lg"
            class="rounded-xl"
          />
        </UFormField>

        <UFormField label="Password">
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            size="lg"
            class="rounded-xl"
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
          icon="i-heroicons-exclamation-triangle"
          class="rounded-xl"
        />

        <UButton
          type="submit"
          block
          size="xl"
          color="primary"
          :loading="loading"
          class="rounded-xl shadow-lg shadow-primary-500/30 font-bold tracking-wide"
        >
          Access Dashboard
        </UButton>
      </form>

      <div class="mt-8 pt-8 border-t border-slate-800 text-center">
        <UButton to="/" variant="link" color="neutral" size="sm" icon="i-heroicons-arrow-left">
          Back to Portfolio
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
