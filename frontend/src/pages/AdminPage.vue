<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Statistike -->
      <div class="col-12">
        <div class="text-h5 q-mb-md">Statistika treninga</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="stat-card">
              <q-card-section class="bg-primary">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-subtitle1 text-white">UKUPNO TRENINGA</div>
                    <div class="text-h3 text-white">{{ statistics.ukupnoTreninga || 0 }}</div>
                  </div>
                  <q-icon name="fitness_center" size="56px" color="white" class="q-ml-sm opacity-70" />
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="stat-card">
              <q-card-section class="bg-teal">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-subtitle1 text-white">AKTIVNI KORISNICI</div>
                    <div class="text-h3 text-white">{{ statistics.aktivniKorisnici || 0 }}</div>
                  </div>
                  <q-icon name="group" size="56px" color="white" class="q-ml-sm opacity-70" />
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="stat-card">
              <q-card-section class="bg-purple">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-subtitle1 text-white">PROSJEČNO MINUTA</div>
                    <div class="text-h3 text-white">{{ statistics.prosjecnoTrajanje || 0 }}</div>
                  </div>
                  <q-icon name="timer" size="56px" color="white" class="q-ml-sm opacity-70" />
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="stat-card">
              <q-card-section class="bg-positive">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-subtitle1 text-white">UKUPNO VRIJEME</div>
                    <div class="text-h3 text-white">{{ statistics.ukupnoKorisnika || 0 }}h</div>
                  </div>
                  <q-icon name="schedule" size="56px" color="white" class="q-ml-sm opacity-70" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Korisnici -->
      <div class="col-12 q-mt-md">
        <q-card>
          <q-card-section>
            <div class="text-h6">Korisnici</div>
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="users"
              :columns="columns"
              row-key="id"
              :loading="loading"
              :pagination-label="paginationLabel"
              :rows-per-page-options="[10, 20, 50]"
            >
              <!-- Uloga -->
              <template v-slot:body-cell-uloga="props">
                <q-td :props="props">
                  <q-chip
                    :color="props.value === 'admin' ? 'purple' : 'primary'"
                    text-color="white"
                    size="sm"
                  >
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>
              <!-- Akcije -->
              <template v-slot:body-cell-akcije="props">
                <q-td :props="props" class="text-center">
                  <q-btn 
                    flat 
                    round 
                    color="primary" 
                    icon="edit" 
                    @click="openRoleDialog(props.row)"
                  >
                    <q-tooltip>Promijeni ulogu</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Treninzi -->
    <div class="col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">Treninzi</div>
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="workouts"
            :columns="workoutColumns"
            row-key="id"
            :loading="loading"
          >
            <!-- Akcije -->
            <template v-slot:body-cell-akcije="props">
              <q-td :props="props">
                <q-btn-group spread>
                  <!-- Obriši trening -->
                  <q-btn
                    color="negative"
                    icon="delete"
                    @click="confirmDeleteWorkout(props.row)"
                    size="sm"
                  >
                    <q-tooltip>Obriši trening</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dijalog za promjenu uloge -->
    <q-dialog v-model="roleDialog.show" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Promjena uloge korisnika</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="roleDialog.newRole"
            :options="['admin', 'korisnik']"
            label="Nova uloga"
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Spremi" color="primary" @click="updateUserRole" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

export default {
  name: 'AdminPage',

  setup () {
    const $q = useQuasar()
    const users = ref([])
    const workouts = ref([])
    const loading = ref(false)
    const roleDialog = ref({
      show: false,
      user: null,
      newRole: ''
    })
    const statistics = ref({
      ukupnoKorisnika: 0,
      aktivniKorisnici: 0,
      ukupnoTreninga: 0,
      prosjecnoTrajanje: 0
    })

    const columns = [
      { name: 'ime', label: 'Ime', field: 'ime', sortable: true },
      { name: 'prezime', label: 'Prezime', field: 'prezime', sortable: true },
      { name: 'email', label: 'Email', field: 'email', sortable: true },
      { name: 'datum_registracije', label: 'Registriran', field: 'datum_registracije', sortable: true,
        format: val => new Date(val).toLocaleDateString() },
      { name: 'uloga', label: 'Uloga', field: 'uloga', sortable: true },
      { name: 'akcije', label: 'Akcije', field: 'akcije' }
    ]

    const workoutColumns = [
      { name: 'korisnik', label: 'Korisnik', field: row => `${row.ime} ${row.prezime}`, sortable: true },
      { name: 'tip_treninga', label: 'Tip treninga', field: 'tip_treninga', sortable: true },
      { name: 'datum', label: 'Datum', field: 'datum', sortable: true,
        format: val => new Date(val).toLocaleDateString() },
      { name: 'vrijeme_pocetka', label: 'Početak', field: 'vrijeme_pocetka', sortable: true,
        format: val => val ? val.substring(0, 5) : '-' },
      { name: 'vrijeme_zavrsetka', label: 'Završetak', field: 'vrijeme_zavrsetka', sortable: true,
        format: val => val ? val.substring(0, 5) : '-' },
      { name: 'trajanje', label: 'Trajanje', field: 'trajanje', sortable: true,
        format: val => val ? `${val} min` : '-' },
      { name: 'akcije', label: 'Akcije', field: 'akcije' }
    ]

    const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
      return `${firstRowIndex}-${endRowIndex} od ${totalRowsNumber}`
    }

    const fetchUsers = async () => {
      try {
        loading.value = true
        const response = await api.get('/api/admin/users')
        users.value = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error fetching users:', error)
        users.value = []
        $q.notify({
          color: 'negative',
          message: 'Greška pri dohvaćanju korisnika'
        })
      } finally {
        loading.value = false
      }
    }

    const fetchWorkouts = async () => {
      try {
        loading.value = true
        const response = await api.get('/api/admin/workouts')
        workouts.value = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error fetching workouts:', error)
        workouts.value = []
        $q.notify({
          color: 'negative',
          message: 'Greška pri dohvaćanju treninga'
        })
      } finally {
        loading.value = false
      }
    }

    const openRoleDialog = (user) => {
      roleDialog.value = {
        show: true,
        user: user,
        newRole: user.uloga
      }
    }

    const updateUserRole = async () => {
      try {
        await api.put(`/api/admin/users/${roleDialog.value.user.id}/role`, {
          uloga: roleDialog.value.newRole
        })
        
        await fetchUsers()
        
        $q.notify({
          color: 'positive',
          message: 'Uloga uspješno promijenjena',
          icon: 'check'
        })
        
        roleDialog.value.show = false
      } catch (error) {
        console.error('Error changing role:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri promjeni uloge',
          icon: 'error'
        })
      }
    }

    const toggleLock = async (user) => {
      try {
        await api.put(`/api/admin/users/${user.id}/lock`, {
          zakljucan: !user.zakljucan
        })
        
        await fetchUsers()
        
        $q.notify({
          color: 'positive',
          message: `Račun uspješno ${user.zakljucan ? 'otključan' : 'zaključan'}`,
          icon: 'check'
        })
      } catch (error) {
        console.error('Error toggling lock:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri promjeni statusa zaključanosti',
          icon: 'error'
        })
      }
    }

    const resetPassword = async (user) => {
      try {
        await api.post(`/api/admin/users/${user.id}/reset-password`)
        
        $q.notify({
          color: 'positive',
          message: 'Lozinka uspješno resetirana. Nova lozinka poslana na email.',
          icon: 'check'
        })
      } catch (error) {
        console.error('Error resetting password:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri resetiranju lozinke',
          icon: 'error'
        })
      }
    }

    const confirmDeleteWorkout = (workout) => {
      $q.dialog({
        title: 'Potvrda brisanja',
        message: 'Jeste li sigurni da želite obrisati ovaj trening?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await api.delete(`/api/admin/workouts/${workout.id}`)
          await fetchWorkouts()
          $q.notify({
            color: 'positive',
            message: 'Trening uspješno obrisan',
            icon: 'check'
          })
        } catch (error) {
          console.error('Error deleting workout:', error)
          $q.notify({
            color: 'negative',
            message: 'Greška pri brisanju treninga',
            icon: 'error'
          })
        }
      })
    }

    onMounted(async () => {
      await fetchUsers()
      await fetchWorkouts()
      // Dohvati statistike
      try {
        const response = await api.get('/api/admin/statistics')
        statistics.value = response.data
      } catch (error) {
        console.error('Error fetching statistics:', error)
      }
    })

    return {
      users,
      workouts,
      loading,
      columns,
      workoutColumns,
      roleDialog,
      statistics,
      openRoleDialog,
      updateUserRole,
      toggleLock,
      resetPassword,
      confirmDeleteWorkout,
      paginationLabel
    }
  }
}
</script>

<style lang="scss">
.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  
  .q-card__section {
    padding: 20px;
    background: linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  }

  .text-subtitle1 {
    font-size: 0.9rem;
    font-weight: 500;
    opacity: 0.9;
    letter-spacing: 0.5px;
  }

  .text-h3 {
    font-size: 2.5rem;
    font-weight: 600;
    line-height: 1.2;
    margin-top: 8px;
  }

  .q-icon {
    opacity: 0.8;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  }
}

.q-table {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  
  thead tr th {
    font-weight: 500;
  }
}
</style>
