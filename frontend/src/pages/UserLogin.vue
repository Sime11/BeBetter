<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="max-width: 400px">
      <q-card class="my-card">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Prijava na BeBetter</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <q-input
              filled
              v-model="email"
              label="Email"
              type="email"
              :rules="[val => !!val || 'Email je obavezan', val => /.+@.+\..+/.test(val) || 'Unesite validan email']"
            />

            <q-input
              filled
              type="password"
              v-model="password"
              label="Lozinka"
              :rules="[val => !!val || 'Lozinka je obavezna', val => val.length >= 6 || 'Lozinka mora imati barem 6 znakova']"
            />

            <div>
              <q-btn label="Prijavi se" type="submit" color="primary" size="lg" unelevated class="full-width"/>
              <div class="text-center q-mt-md">
                <span>Nemate račun?</span>
                <q-btn flat dense color="primary" to="/registracija" label="Registriraj se" />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'UserLogin',

  setup () {
    const router = useRouter()
    const authStore = useAuthStore()
    const $q = useQuasar()
    const email = ref('')
    const password = ref('')

    const handleSubmit = async () => {
      if (await authStore.login(email.value, password.value)) {
        // Preusmjeri na admin dashboard ako je admin, inače na početnu
        if (authStore.user.uloga === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        $q.notify({
          color: 'negative',
          message: 'Neuspješna prijava. Provjerite svoje podatke.',
          position: 'top'
        })
      }
    }

    return {
      email,
      password,
      handleSubmit
    }
  }
})
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>
