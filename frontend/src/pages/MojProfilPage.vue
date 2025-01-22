<template>
  <q-page padding id="moj-profil-page" ref="mojProfil">
    <div class="row q-col-gutter-md">
      <!-- Osnovni podaci -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Osnovni podaci</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <div class="text-subtitle2">Ime i prezime</div>
                <div>{{ user.ime }} {{ user.prezime }}</div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2">Email</div>
                <div>{{ user.email }}</div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2">Datum registracije</div>
                <div>{{ formatDate(user.datum_registracije) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Osobni podaci -->
        <q-card class="q-mt-md">
          <q-card-section class="row items-center">
            <div class="text-h6">Osobni podaci</div>
            <q-space />
            <q-btn
              :icon="editing ? 'save' : 'edit'"
              :color="editing ? 'positive' : 'primary'"
              :label="editing ? 'Spremi' : 'Uredi'"
              flat
              @click="editing ? updateProfile() : startEditing()"
            />
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="user.visina"
                  type="number"
                  label="Visina (cm)"
                  outlined
                  dense
                  :readonly="!editing"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="user.tezina"
                  type="number"
                  label="Težina (kg)"
                  outlined
                  dense
                  :readonly="!editing"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="user.spol"
                  :options="['M', 'Ž']"
                  label="Spol"
                  outlined
                  dense
                  :readonly="!editing"
                  class="q-mt-sm"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="user.datum_rodenja"
                  type="date"
                  label="Datum rođenja"
                  outlined
                  dense
                  :readonly="!editing"
                  class="q-mt-sm"
                />
              </div>
              <div class="col-12">
                <q-select
                  v-model="user.razina_aktivnosti"
                  :options="aktivnostOptions"
                  label="Razina aktivnosti"
                  outlined
                  dense
                  class="q-mt-sm"
                  :readonly="!editing"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="user.zdravstveno_stanje"
                  type="textarea"
                  label="Zdravstveno stanje"
                  hint="Unesite važne zdravstvene informacije (npr. alergije, ozljede)"
                  outlined
                  autogrow
                  class="q-mt-sm"
                  :readonly="!editing"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="user.ciljevi"
                  type="textarea"
                  label="Fitness ciljevi"
                  hint="Opišite svoje fitness ciljeve"
                  outlined
                  autogrow
                  class="q-mt-sm"
                  :readonly="!editing"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistika treninga -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="fitness_center" size="28px" class="q-mr-sm" />
              Statistika treninga
            </div>
            <div class="row q-col-gutter-md">
              <!-- Ukupno treninga -->
              <div class="col-12 col-sm-6">
                <q-card class="stat-card bg-primary text-white">
                  <q-card-section class="text-center">
                    <q-icon name="sports_score" size="48px" class="q-mb-sm" />
                    <div class="text-h3 q-mb-sm">{{ statistika.ukupnoTreninga }}</div>
                    <div class="text-subtitle1 text-weight-bold">UKUPNO TRENINGA</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Treninzi ovaj tjedan -->
              <div class="col-12 col-sm-6">
                <q-card class="stat-card bg-teal text-white">
                  <q-card-section class="text-center">
                    <q-icon name="event_available" size="48px" class="q-mb-sm" />
                    <div class="text-h3 q-mb-sm">{{ statistika.treninziTjedan }}</div>
                    <div class="text-subtitle1 text-weight-bold">OVAJ TJEDAN</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Prosječno trajanje -->
              <div class="col-12 col-sm-6">
                <q-card class="stat-card bg-deep-purple text-white">
                  <q-card-section class="text-center">
                    <q-icon name="timer" size="48px" class="q-mb-sm" />
                    <div class="text-h3 q-mb-sm">{{ statistika.prosjecnoTrajanje }}</div>
                    <div class="text-subtitle1 text-weight-bold">PROSJEČNO MINUTA</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Ukupno sati -->
              <div class="col-12 col-sm-6">
                <q-card class="stat-card bg-green-9 text-white">
                  <q-card-section class="text-center">
                    <q-icon name="schedule" size="48px" class="q-mb-sm" />
                    <div class="text-h3 q-mb-sm time-display">
                      {{ statistika.ukupnoSati }}<span class="unit">h</span>
                      {{ statistika.ukupnoMinuta }}<span class="unit">min</span>
                    </div>
                    <div class="text-subtitle1 text-weight-bold">UKUPNO VRIJEME</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

export default {
  name: 'MojProfilPage',

  setup () {
    const $q = useQuasar()
    const user = ref({})
    const editing = ref(false)
    const statistika = ref({
      ukupnoTreninga: 0,
      treninziTjedan: 0,
      prosjecnoTrajanje: 0,
      ukupnoSati: 0,
      ukupnoMinuta: 0,
      najboljiTrening: '',
      najdužiTrening: ''
    })

    const aktivnostOptions = [
      'Sjedilački način života',
      'Lagana aktivnost (1-2x tjedno)',
      'Umjerena aktivnost (3-4x tjedno)',
      'Visoka aktivnost (5-6x tjedno)',
      'Vrlo visoka aktivnost (svakodnevno)'
    ]

    const dohvatiStatistiku = async () => {
      try {
        const response = await api.get('/api/statistika-korisnika')
        statistika.value = response.data
      } catch (error) {
        console.error('Greška pri dohvaćanju statistike:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri dohvaćanju statistike treninga',
          icon: 'error'
        })
      }
    }

    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString('hr-HR') : ''
    }

    const startEditing = () => {
      editing.value = true
    }

    const updateProfile = async () => {
      try {
        // Formatiranje datuma za backend
        const updateData = {
          visina: user.value.visina ? Number(user.value.visina) : null,
          tezina: user.value.tezina ? Number(user.value.tezina) : null,
          razina_aktivnosti: user.value.razina_aktivnosti,
          zdravstveno_stanje: user.value.zdravstveno_stanje,
          ciljevi: user.value.ciljevi,
          spol: user.value.spol || null,
          datum_rodenja: user.value.datum_rodenja ? user.value.datum_rodenja.split('T')[0] : null
        }
        
        console.log('Frontend - Raw datum_rodenja:', user.value.datum_rodenja)
        console.log('Frontend - Sending update data:', updateData)
        
        const response = await api.put('/api/profile', updateData)
        console.log('Frontend - Server response:', response.data)
        
        editing.value = false
        await loadUserData()
        
        $q.notify({
          color: 'positive',
          message: 'Profil uspješno ažuriran'
        })
      } catch (error) {
        console.error('Frontend - Error details:', error.response?.data || error.message)
        $q.notify({
          color: 'negative',
          message: `Greška pri ažuriranju profila: ${error.response?.data?.details || error.message}`
        })
      }
    }

    const loadUserData = async () => {
      try {
        const response = await api.get('/api/profile')
        console.log('Frontend - Received profile data:', response.data)
        
        // Formatiramo datum za prikaz u input polju
        const formattedData = {
          ...response.data,
          visina: response.data.visina || null,
          tezina: response.data.tezina || null,
          razina_aktivnosti: response.data.razina_aktivnosti || null,
          zdravstveno_stanje: response.data.zdravstveno_stanje || '',
          ciljevi: response.data.ciljevi || '',
          spol: response.data.spol || null,
          datum_rodenja: response.data.datum_rodenja ? response.data.datum_rodenja.split('T')[0] : null
        }
        
        user.value = formattedData
        console.log('Frontend - Processed user data:', user.value)
      } catch (error) {
        console.error('Frontend - Error loading data:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri učitavanju podataka'
        })
      }
    }

    onMounted(() => {
      loadUserData()
      dohvatiStatistiku()
      if (typeof window !== 'undefined') {
        window.addEventListener('osvjeziStatistiku', dohvatiStatistiku)
      }
    })

    return {
      user,
      editing,
      statistika,
      aktivnostOptions,
      formatDate,
      startEditing,
      updateProfile,
      dohvatiStatistiku
    }
  }
}
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.2);
}

.stat-card .q-card__section {
  padding: 24px;
}

.stat-card .text-h3 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  margin: 0;
}

.stat-card .text-subtitle1 {
  letter-spacing: 1px;
  opacity: 0.9;
}

.stat-card .q-icon {
  opacity: 0.9;
}

.time-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.time-display .unit {
  font-size: 1.5rem;
  opacity: 0.9;
  margin: 0 4px;
}
</style>
