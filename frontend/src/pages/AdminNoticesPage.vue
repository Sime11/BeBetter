<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <h4 class="text-h4 q-my-none">Upravljanje obavijestima</h4>
          <q-btn
            color="primary"
            icon="add"
            label="Nova obavijest"
            @click="openAddDialog"
          />
        </div>

        <!-- Lista obavijesti -->
        <div class="row q-col-gutter-md">
          <div v-for="notice in notices" :key="notice.id" class="col-12">
            <q-card class="notice-card">
              <q-card-section>
                <div class="text-h6">{{ notice.naslov }}</div>
                <div class="text-subtitle2 text-grey-7">
                  {{ formatDate(notice.datum_objave) }} | 
                  Objavio: {{ notice.ime }} {{ notice.prezime }}
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="text-body1">
                {{ notice.sadrzaj }}
              </q-card-section>

              <q-card-actions align="right">
                <q-btn
                  flat
                  color="primary"
                  icon="edit"
                  label="Uredi"
                  @click="editNotice(notice)"
                />
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  label="Obriši"
                  @click="confirmDelete(notice)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Dijalog za dodavanje/uređivanje -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ editMode ? 'Uredi obavijest' : 'Nova obavijest' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="form.naslov"
            label="Naslov"
            :rules="[val => !!val || 'Naslov je obavezan']"
            outlined
          />

          <q-input
            v-model="form.sadrzaj"
            label="Sadržaj"
            type="textarea"
            class="q-mt-md"
            :rules="[val => !!val || 'Sadržaj je obavezan']"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Spremi" color="primary" @click="saveNotice" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dijalog za potvrdu brisanja -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Jeste li sigurni da želite obrisati ovu obavijest?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Obriši" color="negative" @click="deleteNotice" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

export default {
  name: 'AdminNoticesPage',

  setup () {
    const $q = useQuasar()
    const notices = ref([])
    const showDialog = ref(false)
    const showDeleteDialog = ref(false)
    const editMode = ref(false)
    const selectedNotice = ref(null)
    const form = ref({
      naslov: '',
      sadrzaj: ''
    })

    const formatDate = (dateStr) => {
      return date.formatDate(dateStr, 'DD.MM.YYYY. HH:mm')
    }

    const loadNotices = async () => {
      try {
        const response = await api.get('/api/notices')
        notices.value = response.data // Direktno koristimo response.data jer backend vraća array
        console.log('Učitane obavijesti:', notices.value)
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Greška pri učitavanju obavijesti'
        })
      }
    }

    const openAddDialog = () => {
      editMode.value = false
      form.value = {
        naslov: '',
        sadrzaj: ''
      }
      showDialog.value = true
    }

    const editNotice = (notice) => {
      editMode.value = true
      selectedNotice.value = notice
      form.value = {
        naslov: notice.naslov,
        sadrzaj: notice.sadrzaj
      }
      showDialog.value = true
    }

    const saveNotice = async () => {
      try {
        if (editMode.value) {
          await api.put(`/api/notices/${selectedNotice.value.id}`, form.value)
          $q.notify({
            color: 'positive',
            message: 'Obavijest uspješno ažurirana'
          })
        } else {
          await api.post('/api/notices', form.value)
          $q.notify({
            color: 'positive',
            message: 'Obavijest uspješno dodana'
          })
        }
        showDialog.value = false
        loadNotices()
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Greška pri spremanju obavijesti'
        })
      }
    }

    const confirmDelete = (notice) => {
      selectedNotice.value = notice
      showDeleteDialog.value = true
    }

    const deleteNotice = async () => {
      try {
        await api.delete(`/api/notices/${selectedNotice.value.id}`)
        showDeleteDialog.value = false
        loadNotices()
        $q.notify({
          color: 'positive',
          message: 'Obavijest uspješno obrisana'
        })
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Greška pri brisanju obavijesti'
        })
      }
    }

    onMounted(loadNotices)

    return {
      notices,
      showDialog,
      showDeleteDialog,
      editMode,
      form,
      formatDate,
      openAddDialog,
      editNotice,
      saveNotice,
      confirmDelete,
      deleteNotice
    }
  }
}
</script>

<style lang="scss" scoped>
.notice-card {
  margin-bottom: 16px;
  border-radius: 8px;
}
</style>
