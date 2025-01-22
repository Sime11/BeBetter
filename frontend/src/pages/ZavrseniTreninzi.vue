<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col-12">
        <h4 class="q-mt-none q-mb-md">Povijest Treninga</h4>
        <q-btn
          icon="arrow_back"
          label="Natrag na treninge"
          color="primary"
          :to="{ name: 'dnevnik-treninga' }"
          class="q-mb-md"
        />
      </div>
    </div>

    <q-table
      :rows="treninzi"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey-8">
          Nema završenih treninga
        </div>
      </template>

      <template v-slot:body-cell-tip_treninga="props">
        <q-td :props="props" class="text-weight-medium">
          {{ props.row.tip_treninga }}
        </q-td>
      </template>

      <template v-slot:body-cell-datum="props">
        <q-td :props="props">
          {{ formatDateTime(props.row.datum) }}
        </q-td>
      </template>

      <template v-slot:body-cell-tezina="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-rating
              v-model="props.row.tezina_treninga"
              max="5"
              size="1em"
              color="primary"
              icon="fitness_center"
              readonly
            />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-vjezbe="props">
        <q-td :props="props">
          <div v-if="props.row.vjezbe && props.row.vjezbe.length > 0">
            <q-list dense>
              <q-item v-for="vjezba in props.row.vjezbe" :key="vjezba.id">
                <q-item-section>
                  <q-item-label>
                    {{ vjezba.naziv }}
                    <span class="text-grey-7">
                      ({{ vjezba.broj_setova }}x{{ vjezba.broj_ponavljanja }})
                      <template v-if="vjezba.tezina">
                        - {{ vjezba.tezina }}kg
                      </template>
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div v-else class="text-grey-6">
            Nema vježbi
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

export default {
  name: 'ZavrseniTreninzi',
  setup () {
    const $q = useQuasar()
    const treninzi = ref([])
    const loading = ref(false)
    const columns = [
      {
        name: 'tip_treninga',
        required: true,
        label: 'Tip Treninga',
        align: 'left',
        field: 'tip_treninga',
        sortable: true
      },
      {
        name: 'datum',
        align: 'left',
        label: 'Datum i vrijeme',
        field: 'datum',
        sortable: true
      },
      {
        name: 'trajanje',
        align: 'left',
        label: 'Trajanje (min)',
        field: 'trajanje',
        sortable: true
      },
      {
        name: 'tezina',
        align: 'center',
        label: 'Težina',
        field: 'tezina_treninga',
        sortable: true
      },
      {
        name: 'vjezbe',
        align: 'left',
        label: 'Vježbe',
        field: 'vjezbe'
      }
    ]

    const formatDateTime = (val) => {
      return date.formatDate(val, 'DD.MM.YYYY. HH:mm')
    }

    const dohvatiTreninge = async () => {
      loading.value = true
      try {
        const response = await api.get('/api/zavrseni-treninzi')
        treninzi.value = response.data
      } catch (error) {
        console.error('Greška pri dohvaćanju treninga:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri dohvaćanju završenih treninga',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      dohvatiTreninge()
    })

    return {
      treninzi,
      columns,
      loading,
      formatDateTime
    }
  }
}
</script>
