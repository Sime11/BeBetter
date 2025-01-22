<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Statistika treninga -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-primary text-white">
              <q-card-section>
                <div class="text-h6">Ukupno treninga</div>
                <div class="text-h3">{{ statistika.ukupnoTreninga }}</div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-teal text-white">
              <q-card-section>
                <div class="text-h6">Ovaj tjedan</div>
                <div class="text-h3">{{ statistika.treninziTjedan }}</div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-purple text-white">
              <q-card-section>
                <div class="text-h6">Prosječno trajanje</div>
                <div class="text-h3">{{ statistika.prosjecnoTrajanje }} min</div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-green text-white">
              <q-card-section>
                <div class="text-h6">Ukupno sati</div>
                <div class="text-h3">{{ statistika.ukupnoSati }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Osobni podaci -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Osobni podaci</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="spremiProfil" class="q-gutter-md">
              <q-input
                v-model="profil.ime"
                label="Ime"
                outlined
                :rules="[val => !!val || 'Ime je obavezno']"
              />

              <q-input
                v-model="profil.prezime"
                label="Prezime"
                outlined
                :rules="[val => !!val || 'Prezime je obavezno']"
              />

              <q-input
                v-model="profil.email"
                label="Email"
                type="email"
                outlined
                :rules="[
                  val => !!val || 'Email je obavezan',
                  val => /^[^@]+@[^@]+\.[^@]+$/.test(val) || 'Neispravan format email adrese'
                ]"
              />

              <q-input
                v-model="profil.visina"
                label="Visina (cm)"
                type="number"
                outlined
              />

              <q-input
                v-model="profil.tezina"
                label="Težina (kg)"
                type="number"
                outlined
              />

              <q-input
                v-model="profil.datum_rodenja"
                label="Datum rođenja"
                type="date"
                outlined
              />

              <div class="q-gutter-sm">
                <q-radio v-model="profil.spol" val="M" label="Muško" />
                <q-radio v-model="profil.spol" val="Ž" label="Žensko" />
              </div>

              <q-btn
                type="submit"
                color="primary"
                label="Spremi promjene"
                class="q-mt-md"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Zdravstveno stanje i ciljevi -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Zdravstveno stanje i ciljevi</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="spremiZdravstveneInfo" class="q-gutter-md">
              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Zdravstveno stanje</div>
                <q-input
                  v-model="zdravstveneInfo.zdravstveno_stanje"
                  type="textarea"
                  outlined
                  autogrow
                  placeholder="Unesite važne zdravstvene informacije (npr. alergije, ozljede)"
                />
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Fitness ciljevi</div>
                <q-input
                  v-model="zdravstveneInfo.fitness_ciljevi"
                  type="textarea"
                  outlined
                  autogrow
                  placeholder="Opišite svoje fitness ciljeve"
                />
              </div>

              <q-btn
                type="submit"
                color="primary"
                label="Spremi informacije"
                class="q-mt-md"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const statistika = ref({
  ukupnoTreninga: 0,
  treninziTjedan: 0,
  prosjecnoTrajanje: 0,
  ukupnoSati: 0
})

const profil = ref({
  ime: '',
  prezime: '',
  email: '',
  visina: null,
  tezina: null,
  datum_rodenja: null,
  spol: null
})

const zdravstveneInfo = ref({
  zdravstveno_stanje: '',
  fitness_ciljevi: ''
})

const dohvatiStatistiku = async () => {
  try {
    const { data } = await api.get('/api/statistika')
    console.log('Dohvaćena statistika:', data)
    statistika.value = data
  } catch (error) {
    console.error('Greška pri dohvaćanju statistike:', error)
    $q.notify({
      color: 'negative',
      message: 'Greška pri dohvaćanju statistike',
      icon: 'error'
    })
  }
}

const dohvatiProfil = async () => {
  try {
    const { data } = await api.get('/api/profil')
    profil.value = data
  } catch (error) {
    console.error('Greška pri dohvaćanju profila:', error)
    $q.notify({
      color: 'negative',
      message: 'Greška pri dohvaćanju profila',
      icon: 'error'
    })
  }
}

const dohvatiZdravstveneInfo = async () => {
  try {
    const { data } = await api.get('/api/zdravstvene-info')
    zdravstveneInfo.value = data
  } catch (error) {
    console.error('Greška pri dohvaćanju zdravstvenih informacija:', error)
    $q.notify({
      color: 'negative',
      message: 'Greška pri dohvaćanju zdravstvenih informacija',
      icon: 'error'
    })
  }
}

const spremiProfil = async () => {
  try {
    await api.put('/api/profil', profil.value)
    $q.notify({
      color: 'positive',
      message: 'Profil uspješno ažuriran',
      icon: 'check'
    })
  } catch (error) {
    console.error('Greška pri spremanju profila:', error)
    $q.notify({
      color: 'negative',
      message: 'Greška pri spremanju profila',
      icon: 'error'
    })
  }
}

const spremiZdravstveneInfo = async () => {
  try {
    await api.put('/api/zdravstvene-info', zdravstveneInfo.value)
    $q.notify({
      color: 'positive',
      message: 'Zdravstvene informacije uspješno ažurirane',
      icon: 'check'
    })
  } catch (error) {
    console.error('Greška pri spremanju zdravstvenih informacija:', error)
    $q.notify({
      color: 'negative',
      message: 'Greška pri spremanju zdravstvenih informacija',
      icon: 'error'
    })
  }
}

onMounted(() => {
  dohvatiProfil()
  dohvatiZdravstveneInfo()
  dohvatiStatistiku()
})
</script>
