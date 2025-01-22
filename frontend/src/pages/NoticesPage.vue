<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row justify-between q-mb-md">
        <h5 class="q-mt-none q-mb-md">Obavijesti</h5>
        <q-btn
          v-if="isAdmin"
          color="primary"
          icon="add"
          label="Nova obavijest"
          @click="openAddDialog"
        />
      </div>

      <div v-if="loading" class="text-center">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else-if="notices.length === 0" class="text-center">
        <p>Nema dostupnih obavijesti</p>
      </div>

      <div v-else class="q-gutter-md">
        <q-card v-for="notice in notices" :key="notice.id" class="notice-card">
          <q-card-section>
            <div class="text-h6">{{ notice.naslov }}</div>
            <div class="text-subtitle2">
              Autor: {{ notice.ime }} {{ notice.prezime }}
              <br>
              Datum: {{ formatDate(notice.datum_objave) }}
            </div>
          </q-card-section>

          <q-card-section>
            {{ notice.sadrzaj }}
          </q-card-section>

          <q-card-actions v-if="isAdmin" align="right">
            <q-btn
              flat
              color="primary"
              icon="edit"
              @click="openEditDialog(notice)"
            />
            <q-btn
              flat
              color="negative"
              icon="delete"
              @click="confirmDelete(notice)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Dialog za uređivanje/dodavanje -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ selectedNotice ? 'Uredi obavijest' : 'Nova obavijest' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="editForm.naslov"
            label="Naslov"
            :rules="[val => !!val || 'Naslov je obavezan']"
          />
          <q-input
            v-model="editForm.sadrzaj"
            type="textarea"
            label="Sadržaj"
            :rules="[val => !!val || 'Sadržaj je obavezan']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn
            :loading="saving"
            :label="selectedNotice ? 'Spremi' : 'Dodaj'"
            color="primary"
            @click="saveNotice"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog za potvrdu brisanja -->
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Jeste li sigurni da želite obrisati ovu obavijest?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn
            flat
            label="Obriši"
            color="negative"
            :loading="deleting"
            @click="deleteNotice"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const notices = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)
const selectedNotice = ref(null)
const editForm = ref({
  naslov: '',
  sadrzaj: ''
})

const isAdmin = computed(() => authStore.user?.uloga === 'admin')

const loadNotices = async () => {
  loading.value = true;
  try {
    console.log('Dohvaćam obavijesti...');
    const response = await api.get('/api/notices');
    notices.value = response.data;
    console.log('Učitane obavijesti:', notices.value);
  } catch (error) {
    console.error('Error loading notices:', error);
    $q.notify({
      color: 'negative',
      message: 'Greška pri učitavanju obavijesti'
    });
  } finally {
    loading.value = false;
  }
}

const openAddDialog = () => {
  selectedNotice.value = null;
  editForm.value = {
    naslov: '',
    sadrzaj: ''
  };
  editDialog.value = true;
}

const openEditDialog = (notice) => {
  selectedNotice.value = notice;
  editForm.value = {
    naslov: notice.naslov,
    sadrzaj: notice.sadrzaj
  };
  editDialog.value = true;
}

const confirmDelete = (notice) => {
  selectedNotice.value = notice;
  deleteDialog.value = true;
}

const saveNotice = async () => {
  if (!editForm.value.naslov || !editForm.value.sadrzaj) {
    $q.notify({
      color: 'negative',
      message: 'Molimo popunite sva polja'
    });
    return;
  }

  saving.value = true;
  try {
    let response;
    if (selectedNotice.value) {
      console.log('Ažuriranje obavijesti:', selectedNotice.value.id);
      response = await api.put(`/api/notices/${selectedNotice.value.id}`, editForm.value);
    } else {
      console.log('Kreiranje nove obavijesti:', editForm.value);
      response = await api.post('/api/notices', editForm.value);
    }
    
    await loadNotices(); // Osvježi listu nakon promjene
    editDialog.value = false;
    
    $q.notify({
      color: 'positive',
      message: selectedNotice.value ? 'Obavijest je ažurirana' : 'Nova obavijest je dodana'
    });
  } catch (error) {
    console.error('Error saving notice:', error);
    $q.notify({
      color: 'negative',
      message: error.response?.data?.error || 'Greška pri spremanju obavijesti'
    });
  } finally {
    saving.value = false;
  }
}

const deleteNotice = async () => {
  if (!selectedNotice.value?.id) {
    console.error('Pokušaj brisanja obavijesti bez ID-a');
    return;
  }

  deleting.value = true;
  try {
    const noticeId = selectedNotice.value.id;
    console.log('Brisanje obavijesti ID:', noticeId, 'Tip:', typeof noticeId);
    
    await api.delete(`/api/notices/${noticeId}`);
    notices.value = notices.value.filter(n => n.id !== noticeId);
    deleteDialog.value = false;
    
    $q.notify({
      color: 'positive',
      message: 'Obavijest je obrisana'
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    $q.notify({
      color: 'negative',
      message: error.response?.data?.error || 'Greška pri brisanju obavijesti'
    });
  } finally {
    deleting.value = false;
    selectedNotice.value = null;
  }
}

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  loadNotices()
})
</script>

<style lang="scss" scoped>
.notice-card {
  margin-bottom: 1rem;
}
</style>
