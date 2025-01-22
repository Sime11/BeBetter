<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="max-width: 400px">
      <q-card class="my-card">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Registracija</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              filled
              v-model="ime"
              label="Ime"
              :rules="[val => !!val || 'Ime je obavezno']"
            />

            <q-input
              filled
              v-model="prezime"
              label="Prezime"
              :rules="[val => !!val || 'Prezime je obavezno']"
            />

            <q-input
              filled
              v-model="email"
              label="Email"
              type="email"
              :rules="[
                val => !!val || 'Email je obavezan',
                val => /.+@.+\..+/.test(val) || 'Unesite validan email'
              ]"
            />

            <q-input
              filled
              type="password"
              v-model="password"
              label="Lozinka"
              :rules="[
                val => !!val || 'Lozinka je obavezna',
                val => val.length >= 6 || 'Lozinka mora imati barem 6 znakova'
              ]"
            />

            <q-input
              filled
              type="password"
              v-model="confirmPassword"
              label="Potvrdi lozinku"
              :rules="[
                val => !!val || 'Potvrda lozinke je obavezna',
                val => val === password || 'Lozinke se ne podudaraju'
              ]"
            />

            <div>
              <q-btn label="Registriraj se" type="submit" color="primary" class="full-width"/>
              <div class="text-center q-mt-md">
                <span>Već imate račun?</span>
                <q-btn flat dense color="primary" to="/login" label="Prijavi se" />
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

export default defineComponent({
  name: 'RegistracijaPage',

  setup () {
    const router = useRouter()
    const authStore = useAuthStore()
    const ime = ref('')
    const prezime = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')

    const onSubmit = async () => {
      if (password.value !== confirmPassword.value) {
        return
      }
      const success = await authStore.register(ime.value, prezime.value, email.value, password.value)
      if (success) {
        router.push('/login')
      }
    }

    return {
      ime,
      prezime,
      email,
      password,
      confirmPassword,
      onSubmit
    }
  }
})
</script>
