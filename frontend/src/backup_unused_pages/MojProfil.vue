<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="max-width: 600px; width: 100%">
      <q-card class="my-card">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Moj Profil</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  filled
                  v-model="formData.username"
                  label="Korisničko ime"
                  :rules="[val => !!val || 'Korisničko ime je obavezno']"
                />
              </div>

              <div class="col-12">
                <q-input
                  filled
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  :rules="[
                    val => !!val || 'Email je obavezan',
                    val => /.+@.+\..+/.test(val) || 'Unesite validan email'
                  ]"
                />
              </div>

              <div class="col-12">
                <q-expansion-item
                  group="somegroup"
                  icon="lock"
                  label="Promijeni lozinku"
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      <q-input
                        filled
                        v-model="formData.currentPassword"
                        type="password"
                        label="Trenutna lozinka"
                      />

                      <q-input
                        filled
                        v-model="formData.newPassword"
                        type="password"
                        label="Nova lozinka"
                        class="q-mt-md"
                        :rules="[
                          val => !val || val.length >= 6 || 'Lozinka mora imati barem 6 znakova'
                        ]"
                      />

                      <q-input
                        filled
                        v-model="formData.confirmNewPassword"
                        type="password"
                        label="Potvrdi novu lozinku"
                        class="q-mt-md"
                        :rules="[
                          val => !val || val === formData.newPassword || 'Lozinke se ne podudaraju'
                        ]"
                      />
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12">
                <q-btn
                  label="Spremi promjene"
                  type="submit"
                  color="primary"
                  class="full-width"
                />
              </div>
              <div class="col-12">
                <q-btn
                  label="Odjavi se"
                  color="negative"
                  class="full-width"
                  @click="logout"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

export default defineComponent({
  name: 'MojProfil',

  setup () {
    const router = useRouter()
    const authStore = useAuthStore()
    const formData = ref({
      username: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    })

    onMounted(() => {
      const user = authStore.getUser
      if (user) {
        formData.value.username = user.username
        formData.value.email = user.email
      }
    })

    const onSubmit = async () => {
      const updateData = {
        username: formData.value.username,
        email: formData.value.email
      }

      if (formData.value.currentPassword && formData.value.newPassword) {
        updateData.currentPassword = formData.value.currentPassword
        updateData.newPassword = formData.value.newPassword
      }

      const success = await authStore.updateProfile(updateData)
      if (success) {
        formData.value.currentPassword = ''
        formData.value.newPassword = ''
        formData.value.confirmNewPassword = ''
      }
    }

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    return {
      formData,
      onSubmit,
      logout
    }
  }
})
</script>
