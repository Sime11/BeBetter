<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <h4 class="text-h4 q-my-none">Upravljanje FAQ-om</h4>
          <q-btn
            color="primary"
            icon="add"
            label="Novo pitanje"
            @click="openAddDialog"
          />
        </div>

        <!-- Lista FAQ-ova -->
        <q-list separator>
          <q-expansion-item
            v-for="faq in faqs"
            :key="faq.id"
            group="faq"
            class="q-mb-sm bg-white shadow-2 rounded-borders"
            icon="help_outline"
            :label="faq.pitanje"
            :caption="faq.kategorija"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <p class="text-body1">{{ faq.odgovor }}</p>
                <div class="row justify-end q-gutter-sm">
                  <q-btn
                    flat
                    color="primary"
                    icon="edit"
                    label="Uredi"
                    @click="editFaq(faq)"
                  />
                  <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    label="Obriši"
                    @click="confirmDelete(faq)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
    </div>

    <!-- Dijalog za dodavanje/uređivanje -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ editMode ? 'Uredi pitanje' : 'Novo pitanje' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="form.pitanje"
            label="Pitanje"
            :rules="[val => !!val || 'Pitanje je obavezno']"
            outlined
          />

          <q-input
            v-model="form.kategorija"
            label="Kategorija"
            class="q-mt-md"
            :rules="[val => !!val || 'Kategorija je obavezna']"
            outlined
          />

          <q-input
            v-model="form.odgovor"
            label="Odgovor"
            type="textarea"
            class="q-mt-md"
            :rules="[val => !!val || 'Odgovor je obavezan']"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Spremi" color="primary" @click="saveFaq" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dijalog za potvrdu brisanja -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Jeste li sigurni da želite obrisati ovo pitanje?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Obriši" color="negative" @click="deleteFaq" />
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
  name: 'AdminFaqPage',

  setup () {
    const $q = useQuasar()
    const faqs = ref([])
    const showDialog = ref(false)
    const showDeleteDialog = ref(false)
    const editMode = ref(false)
    const selectedFaq = ref(null)
    const form = ref({
      pitanje: '',
      kategorija: '',
      odgovor: ''
    })

    const loadFaqs = async () => {
      try {
        const response = await api.get('/api/faq')
        faqs.value = response.data
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Greška pri učitavanju FAQ-a'
        })
      }
    }

    const openAddDialog = () => {
      editMode.value = false
      form.value = {
        pitanje: '',
        kategorija: '',
        odgovor: ''
      }
      showDialog.value = true
    }

    const editFaq = (faq) => {
      editMode.value = true
      selectedFaq.value = faq
      form.value = { ...faq }
      showDialog.value = true
    }

    const saveFaq = async () => {
      try {
        if (editMode.value) {
          await api.put(`/api/faq/${selectedFaq.value.id}`, form.value)
          $q.notify({
            color: 'positive',
            message: 'FAQ uspješno ažuriran'
          })
        } else {
          await api.post('/api/faq', form.value)
          $q.notify({
            color: 'positive',
            message: 'FAQ uspješno dodan'
          })
        }
        showDialog.value = false
        loadFaqs()
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Greška pri spremanju FAQ-a'
        })
      }
    }

    const confirmDelete = (faq) => {
      selectedFaq.value = faq
      showDeleteDialog.value = true
    }

    const deleteFaq = async () => {
      try {
        await api.delete(`/api/faq/${selectedFaq.value.id}`)
        showDeleteDialog.value = false
        loadFaqs()
        $q.notify({
          color: 'positive',
          message: 'FAQ uspješno obrisan'
        })
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Greška pri brisanju FAQ-a'
        })
      }
    }

    onMounted(loadFaqs)

    return {
      faqs,
      showDialog,
      showDeleteDialog,
      editMode,
      form,
      openAddDialog,
      editFaq,
      saveFaq,
      confirmDelete,
      deleteFaq
    }
  }
}
</script>

<style lang="scss" scoped>
.q-expansion-item {
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
