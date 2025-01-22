<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Lijeva strana: Forma za kreiranje plana -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ uređivanje ? 'Uredi Plan Treninga' : 'Novi Plan Treninga' }}</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="spremiPlan" ref="planForm">
              <div class="q-gutter-md">
                <q-input
                  v-model="trenutniPlan.naziv"
                  label="Naziv plana *"
                  :rules="[val => !!val || 'Naziv je obavezan']"
                  lazy-rules
                  outlined
                />

                <q-input
                  v-model="trenutniPlan.opis"
                  type="textarea"
                  label="Opis"
                  outlined
                  autogrow
                />

                <q-select
                  v-model="trenutniPlan.tezina_plana"
                  :options="tezinePlana"
                  label="Težina plana *"
                  :rules="[val => !!val || 'Težina je obavezna']"
                  lazy-rules
                  outlined
                  emit-value
                  map-options
                />

                <q-input
                  v-model.number="trenutniPlan.trajanje_dana"
                  type="number"
                  label="Trajanje (dana) *"
                  :rules="[
                    val => !!val || 'Trajanje je obavezno',
                    val => val > 0 || 'Trajanje mora biti veće od 0'
                  ]"
                  lazy-rules
                  @update:model-value="handleTrajanjeDanaChange"
                  outlined
                />

                <!-- Dodavanje vježbi po danima -->
                <div v-for="(dan, index) in trenutniPlan.dani" :key="index" class="q-mt-md">
                  <div class="text-subtitle2">{{ dan.naziv }}</div>
                  <q-list bordered>
                    <q-item v-for="(vjezba, vjezbaIndex) in dan.vjezbe" :key="vjezbaIndex">
                      <q-item-section>
                        <q-select
                          v-model="vjezba.vjezba_id"
                          :options="dostupneVjezbe"
                          label="Odaberi vježbu"
                          outlined
                          dense
                          emit-value
                          map-options
                          option-label="naziv"
                          option-value="id"
                          :rules="[val => !!val || 'Vježba je obavezna']"
                          lazy-rules
                        />
                      </q-item-section>
                      
                      <q-item-section class="col-3">
                        <q-input
                          v-model="vjezba.broj_setova"
                          type="number"
                          label="Setovi"
                          outlined
                          dense
                          :rules="[val => val > 0 || 'Mora biti veće od 0']"
                          lazy-rules
                        />
                      </q-item-section>
                      
                      <q-item-section class="col-3">
                        <q-input
                          v-model="vjezba.broj_ponavljanja"
                          type="number"
                          label="Ponavljanja"
                          outlined
                          dense
                          :rules="[val => val > 0 || 'Mora biti veće od 0']"
                          lazy-rules
                        />
                      </q-item-section>
                      
                      <q-item-section side>
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="remove"
                          @click="ukloniVjezbu(index, vjezbaIndex)"
                        />
                      </q-item-section>
                    </q-item>
                    
                    <q-item>
                      <q-item-section>
                        <q-btn
                          flat
                          color="primary"
                          icon="add"
                          label="Dodaj vježbu"
                          @click="dodajVjezbu(index)"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="row justify-end q-gutter-sm">
                  <q-btn
                    v-if="uređivanje"
                    label="Odustani"
                    color="grey"
                    @click="resetirajFormu"
                    :disable="spremanje"
                  />
                  <q-btn
                    :label="uređivanje ? 'Spremi promjene' : 'Spremi plan'"
                    type="submit"
                    color="primary"
                    :loading="spremanje"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Desna strana: Prikaz planova -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Moji Planovi Treninga</div>
          </q-card-section>

          <q-card-section>
            <div class="q-pa-md">
              <q-table
                :rows="planovi"
                :columns="columns"
                row-key="id"
                :rows-per-page-options="[5, 10, 20]"
                :loading="ucitavanje"
              >
                <template v-slot:body-cell-tezina_plana="props">
                  <q-td :props="props">
                    <q-chip :color="getTezinaColor(props.value)" text-color="white">
                      {{ props.value }}
                    </q-chip>
                  </q-td>
                </template>

                <template v-slot:body-cell-akcije="props">
                  <q-td :props="props" class="q-gutter-sm">
                    <q-btn
                      flat
                      round
                      color="info"
                      icon="visibility"
                      @click="pregledajPlan(props.row)"
                    >
                      <q-tooltip>Pregledaj plan</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      @click="urediPlan(props.row)"
                    >
                      <q-tooltip>Uredi plan</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="obrisiPlan(props.row.id)"
                    >
                      <q-tooltip>Obriši plan</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog za pregled plana -->
    <q-dialog v-model="pregledDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ odabraniPlan?.naziv }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            <q-chip color="primary" text-color="white">
              {{ odabraniPlan?.tezina_plana }}
            </q-chip>
            <q-chip color="secondary" text-color="white">
              {{ odabraniPlan?.trajanje_dana }} dana
            </q-chip>
          </div>

          <div class="text-body1 q-mb-md">
            {{ odabraniPlan?.opis }}
          </div>

          <div v-for="(dan, index) in odabraniPlan?.dani" :key="index" class="q-mb-md">
            <q-expansion-item
              :label="dan.naziv"
              :caption="dan.vjezbe.length + ' vježbi'"
              header-class="bg-grey-2"
              default-opened
            >
              <q-card>
                <q-card-section>
                  <div v-if="dan.vjezbe.length === 0" class="text-grey">
                    Nema vježbi za ovaj dan
                  </div>
                  <q-list v-else bordered separator>
                    <q-item v-for="vjezba in dan.vjezbe" :key="vjezba.id">
                      <q-item-section>
                        <q-item-label class="text-weight-medium">{{ vjezba.naziv_vjezbe }}</q-item-label>
                        <q-item-label caption>
                          <div class="row q-gutter-x-sm">
                            <div>
                              <q-icon name="fitness_center" size="xs" />
                              {{ vjezba.broj_setova }} x {{ vjezba.broj_ponavljanja }}
                            </div>
                            <div v-if="vjezba.tezina > 0">
                              <q-icon name="scale" size="xs" />
                              {{ vjezba.tezina }} kg
                            </div>
                          </div>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Zatvori" color="primary" v-close-popup />
          <q-btn flat label="Uredi" color="primary" @click="urediPlan" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

export default {
  name: 'PlanoviTreninga',
  setup () {
    const $q = useQuasar()
    const planForm = ref(null)
    const planovi = ref([])
    const dostupneVjezbe = ref([])
    const ucitavanje = ref(false)
    const spremanje = ref(false)
    const uređivanje = ref(false)
    const pregledDialog = ref(false)
    const dijalogOtvoren = ref(false)
    const odabraniPlan = ref(null)

    const trenutniPlan = ref({
      naziv: '',
      opis: '',
      tezina_plana: 'Početnik',
      trajanje_dana: 1,
      dani: [{
        naziv: 'Ponedjeljak',
        vjezbe: []
      }]
    })

    const tezinePlana = [
      { label: 'Početnik', value: 'Početnik' },
      { label: 'Srednji', value: 'Srednji' },
      { label: 'Napredni', value: 'Napredni' }
    ]

    const getTezinaColor = (tezina) => {
      switch (tezina) {
        case 'Početnik':
          return 'green'
        case 'Srednji':
          return 'orange'
        case 'Napredni':
          return 'red'
        default:
          return 'grey'
      }
    }

    const columns = [
      {
        name: 'naziv',
        required: true,
        label: 'Naziv',
        align: 'left',
        field: row => row.naziv,
        sortable: true
      },
      {
        name: 'tezina_plana',
        required: true,
        label: 'Težina',
        align: 'left',
        field: row => row.tezina_plana,
        sortable: true
      },
      {
        name: 'trajanje_dana',
        required: true,
        label: 'Trajanje (dana)',
        align: 'left',
        field: row => row.trajanje_dana,
        sortable: true
      },
      {
        name: 'akcije',
        label: 'Akcije',
        align: 'right'
      }
    ]

    const daniUTjednu = [
      'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak',
      'Petak', 'Subota', 'Nedjelja'
    ]

    // Funkcija za inicijalizaciju dana
    const inicijalizirajDane = () => {
      const brojDana = trenutniPlan.value.trajanje_dana
      trenutniPlan.value.dani = Array(brojDana).fill().map((_, index) => ({
        naziv: daniUTjednu[index],
        vjezbe: []
      }))
    }

    // Watch za promjenu trajanje_dana
    watch(() => trenutniPlan.value.trajanje_dana, (noviBrojDana) => {
      if (noviBrojDana > 0) {
        inicijalizirajDane()
      }
    })

    const handleTrajanjeDanaChange = (value) => {
      const novaTrajanja = Math.min(Math.max(parseInt(value) || 1, 1), 7)
      trenutniPlan.value.trajanje_dana = novaTrajanja
      
      // Sačuvaj postojeće vježbe
      const postojeciDani = [...trenutniPlan.value.dani]
      
      // Kreiraj nove dane
      trenutniPlan.value.dani = Array(novaTrajanja).fill().map((_, index) => {
        if (index < postojeciDani.length) {
          // Zadrži postojeće vježbe za ovaj dan
          return postojeciDani[index]
        } else {
          // Kreiraj novi dan
          return {
            naziv: daniUTjednu[index],
            vjezbe: []
          }
        }
      })
    }

    const dodajVjezbu = (danIndex) => {
      trenutniPlan.value.dani[danIndex].vjezbe.push({
        vjezba_id: null,
        broj_setova: 3,
        broj_ponavljanja: 10
      })
    }

    const ukloniVjezbu = (danIndex, vjezbaIndex) => {
      trenutniPlan.value.dani[danIndex].vjezbe.splice(vjezbaIndex, 1)
    }

    // Watch za promjenu trajanja dana
    watch(() => trenutniPlan.value.trajanje_dana, (novaTrajanje) => {
      handleTrajanjeDanaChange(novaTrajanje)
    })

    onMounted(() => {
      dohvatiVjezbe()
      dohvatiPlanove()
      inicijalizirajDane()
    })

    // Dohvaćanje planova
    const dohvatiPlanove = async () => {
      try {
        ucitavanje.value = true
        const response = await api.get('/api/planovi-treninga')
        planovi.value = response.data
      } catch (error) {
        console.error('Greška pri dohvaćanju planova:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri dohvaćanju planova treninga',
          icon: 'error'
        })
      } finally {
        ucitavanje.value = false
      }
    }

    // Dohvaćanje dostupnih vježbi
    const dohvatiVjezbe = async () => {
      try {
        const response = await api.get('/api/vjezbe')
        dostupneVjezbe.value = response.data
      } catch (error) {
        console.error('Greška pri dohvaćanju vježbi:', error)
      }
    }

    // Spremanje plana
    const spremiPlan = async () => {
      try {
        if (!planForm.value.validate()) {
          return;
        }

        spremanje.value = true;
        console.log('Spremanje plana:', trenutniPlan.value);

        const planZaSlanje = {
          naziv: trenutniPlan.value.naziv,
          opis: trenutniPlan.value.opis,
          tezina_plana: trenutniPlan.value.tezina_plana,
          trajanje_dana: trenutniPlan.value.trajanje_dana,
          dani: trenutniPlan.value.dani.map((dan, index) => ({
            naziv: dan.naziv,
            vjezbe: dan.vjezbe.map(v => ({
              vjezba_id: parseInt(v.vjezba_id),
              broj_setova: parseInt(v.broj_setova) || 3,
              broj_ponavljanja: parseInt(v.broj_ponavljanja) || 10,
              dan_index: index + 1 // Dodajemo 1 za spremanje u bazu
            }))
          }))
        };

        console.log('Plan za slanje:', planZaSlanje);

        if (uređivanje.value) {
          await api.put(`/api/planovi-treninga/${trenutniPlan.value.id}`, planZaSlanje);
          $q.notify({
            color: 'positive',
            message: 'Plan treninga je uspješno ažuriran',
            icon: 'check'
          });
        } else {
          await api.post('/api/planovi-treninga', planZaSlanje);
          $q.notify({
            color: 'positive',
            message: 'Plan treninga je uspješno spremljen',
            icon: 'check'
          });
        }

        resetirajFormu();
        dohvatiPlanove();
      } catch (error) {
        console.error('Greška pri spremanju plana:', error);
        $q.notify({
          color: 'negative',
          message: 'Greška pri spremanju plana treninga',
          icon: 'error'
        });
      } finally {
        spremanje.value = false;
      }
    };

    // Uređivanje plana
    const urediPlan = async (plan) => {
      try {
        const { data } = await api.get(`/api/planovi-treninga/${plan.id}`)
        console.log('Dohvaćeni plan:', data)
        
        // Organiziraj vježbe po danima
        const vjezbePoTjednu = {}
        if (Array.isArray(data.vjezbe)) {
          data.vjezbe.forEach(vjezba => {
            // dan_index u bazi počinje od 1, oduzimamo 1 za frontend array
            const dan = (vjezba.dan_index - 1).toString()
            if (!vjezbePoTjednu[dan]) {
              vjezbePoTjednu[dan] = []
            }
            vjezbePoTjednu[dan].push({
              vjezba_id: vjezba.vjezba_id,
              naziv_vjezbe: vjezba.vjezba_naziv,
              broj_setova: vjezba.broj_setova,
              broj_ponavljanja: vjezba.broj_ponavljanja,
              tezina: vjezba.tezina,
              napomena: vjezba.napomena,
              dan_index: vjezba.dan_index - 1 // Prilagođavamo za frontend
            })
          })
        }

        trenutniPlan.value = {
          id: data.id,
          naziv: data.naziv,
          opis: data.opis || '',
          tezina_plana: data.tezina_plana,
          trajanje_dana: parseInt(data.trajanje_dana),
          dani: Array(data.trajanje_dana).fill().map((_, index) => ({
            naziv: daniUTjednu[index],
            vjezbe: vjezbePoTjednu[index.toString()] || []
          }))
        }

        console.log('Pripremljeni plan za uređivanje:', trenutniPlan.value)
        uređivanje.value = true
        dijalogOtvoren.value = true
      } catch (error) {
        console.error('Greška pri učitavanju plana:', error.response?.data || error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri učitavanju plana za uređivanje',
          icon: 'error'
        })
      }
    }

    // Brisanje plana
    const obrisiPlan = async (id) => {
      try {
        await api.delete(`/api/planovi-treninga/${id}`)
        await dohvatiPlanove()
        $q.notify({
          color: 'positive',
          message: 'Plan uspješno obrisan',
          icon: 'check'
        })
      } catch (error) {
        console.error('Greška pri brisanju plana:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri brisanju plana',
          icon: 'error'
        })
      }
    }

    // Pregled plana
    const pregledajPlan = (plan) => {
      try {
        console.log('Plan za pregled:', plan)
        
        // Organiziraj vježbe po danima
        const vjezbePoTjednu = {}
        if (Array.isArray(plan.vjezbe)) {
          plan.vjezbe.forEach(vjezba => {
            const dan = (vjezba.dan_index - 1).toString()
            if (!vjezbePoTjednu[dan]) {
              vjezbePoTjednu[dan] = []
            }
            vjezbePoTjednu[dan].push({
              id: vjezba.id,
              vjezba_id: vjezba.vjezba_id,
              naziv_vjezbe: vjezba.vjezba_naziv,
              broj_setova: vjezba.broj_setova,
              broj_ponavljanja: vjezba.broj_ponavljanja,
              tezina: vjezba.tezina || 0
            })
          })
        }

        console.log('Vježbe po danima:', vjezbePoTjednu)

        odabraniPlan.value = {
          id: plan.id,
          naziv: plan.naziv,
          opis: plan.opis || '',
          tezina_plana: plan.tezina_plana,
          trajanje_dana: parseInt(plan.trajanje_dana),
          dani: Array(parseInt(plan.trajanje_dana)).fill().map((_, index) => ({
            naziv: daniUTjednu[index],
            vjezbe: vjezbePoTjednu[index.toString()] || []
          }))
        }

        console.log('Pripremljeni plan:', odabraniPlan.value)
        pregledDialog.value = true
      } catch (error) {
        console.error('Greška pri pripremi plana za pregled:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri pripremi plana za pregled',
          icon: 'error'
        })
      }
    }

    // Metoda za uređivanje trenutno pregledanog plana
    const urediOdabraniPlan = () => {
      trenutniPlan.value = { ...odabraniPlan.value }
      uređivanje.value = true
      pregledDialog.value = false
    }

    // Pomoćne funkcije za vježbe
    const getNazivVjezbe = (vjezbaId) => {
      const vjezba = dostupneVjezbe.value.find(v => v.id === vjezbaId)
      return vjezba ? vjezba.naziv : 'Nepoznata vježba'
    }

    const resetirajFormu = () => {
      trenutniPlan.value = {
        naziv: '',
        opis: '',
        tezina_plana: 'Početnik',
        trajanje_dana: 1,
        dani: [{
          naziv: 'Ponedjeljak',
          vjezbe: []
        }]
      }
      uređivanje.value = false
      if (planForm.value) {
        planForm.value.resetValidation()
        planForm.value.reset()
      }
    }

    return {
      planForm,
      planovi,
      dostupneVjezbe,
      trenutniPlan,
      tezinePlana,
      ucitavanje,
      spremanje,
      uređivanje,
      pregledDialog,
      dijalogOtvoren,
      odabraniPlan,
      daniUTjednu,
      handleTrajanjeDanaChange,
      dodajVjezbu,
      ukloniVjezbu,
      dohvatiPlanove,
      spremiPlan,
      resetirajFormu,
      urediPlan,
      obrisiPlan,
      pregledajPlan,
      getTezinaColor,
      columns,
      urediOdabraniPlan
    }
  }
}
</script>

<style scoped>
.q-table__card {
  margin-bottom: 20px;
}

.exercise-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
