<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Forma za unos treninga -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h5">Novi Trening</div>
          </q-card-section>

          <q-card-section v-if="!uspjesnoSpremljeno">
            <q-form
              ref="treningForm"
              @submit.prevent="spremiTrening"
              class="q-gutter-md"
            >
              <!-- Osnovni podaci o treningu -->
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-select
                    v-model="noviTrening.tip_treninga"
                    :options="tipoviTreninga"
                    label="Tip Treninga *"
                    outlined
                    emit-value
                    map-options
                    :rules="[val => !!val || 'Tip treninga je obavezan']"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="noviTrening.datum"
                    type="date"
                    label="Datum *"
                    outlined
                    :rules="[val => !!val || 'Datum je obavezan']"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="noviTrening.trajanje"
                    type="number"
                    label="Trajanje (min) *"
                    outlined
                    :rules="[
                      val => !!val || 'Trajanje je obavezno',
                      val => val > 0 || 'Trajanje mora biti veće od 0'
                    ]"
                  />
                </div>
                <div class="col-12">
                  <div class="text-subtitle2 q-mb-sm">Težina treninga</div>
                  <q-rating
                    v-model="noviTrening.tezina_treninga"
                    size="2em"
                    color="primary"
                    icon="fitness_center"
                    :max="5"
                    :min="1"
                  >
                    <q-tooltip>Težina treninga (1-5)</q-tooltip>
                  </q-rating>
                </div>
              </div>

              <!-- Dodavanje vježbi -->
              <div class="q-mt-md">
                <div class="text-h6">Vježbe</div>
                <div v-for="(vjezba, index) in noviTrening.vjezbe" :key="index" class="q-mt-sm">
                  <q-card bordered flat>
                    <q-card-section>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12">
                          <q-select
                            v-model="vjezba.vjezba_id"
                            :options="dostupneVjezbe"
                            label="Odaberi vježbu *"
                            outlined
                            dense
                            emit-value
                            map-options
                            option-label="naziv"
                            option-value="id"
                          />
                        </div>
                        <div class="col-md-4 col-12">
                          <q-input
                            v-model="vjezba.broj_setova"
                            type="number"
                            label="Broj setova"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-md-4 col-12">
                          <q-input
                            v-model="vjezba.broj_ponavljanja"
                            type="number"
                            label="Ponavljanja"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-md-4 col-12">
                          <q-input
                            v-model="vjezba.tezina"
                            type="number"
                            label="Težina (kg)"
                            outlined
                            dense
                          />
                        </div>
                      </div>
                      <q-btn
                        flat
                        dense
                        color="negative"
                        icon="remove"
                        @click="ukloniVjezbu(index)"
                        class="q-mt-sm"
                      >
                        <q-tooltip>Ukloni vježbu</q-tooltip>
                      </q-btn>
                    </q-card-section>
                  </q-card>
                </div>
                <q-btn
                  flat
                  color="primary"
                  icon="add"
                  label="Dodaj vježbu"
                  @click="dodajVjezbu"
                  class="q-mt-sm"
                />
              </div>

              <!-- Bilješke -->
              <q-input
                v-model="noviTrening.biljeske"
                type="textarea"
                label="Bilješke"
                outlined
                autogrow
              />

              <div class="row justify-end q-mt-md">
                <q-btn
                  label="Spremi trening"
                  type="submit"
                  color="primary"
                  :loading="spremanje"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section v-else>
            <q-form
              ref="treningForm"
              @submit.prevent="spremiTrening"
              class="q-gutter-md"
            >
              <!-- Osnovni podaci o treningu -->
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-select
                    v-model="noviTrening.tip_treninga"
                    :options="tipoviTreninga"
                    label="Tip Treninga *"
                    outlined
                    emit-value
                    map-options
                    :rules="[val => !!val || 'Tip treninga je obavezan']"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="noviTrening.datum"
                    type="date"
                    label="Datum *"
                    outlined
                    :rules="[val => !!val || 'Datum je obavezan']"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="noviTrening.trajanje"
                    type="number"
                    label="Trajanje (min) *"
                    outlined
                    :rules="[
                      val => !!val || 'Trajanje je obavezno',
                      val => val > 0 || 'Trajanje mora biti veće od 0'
                    ]"
                  />
                </div>
                <div class="col-12">
                  <div class="text-subtitle2 q-mb-sm">Težina treninga</div>
                  <q-rating
                    v-model="noviTrening.tezina_treninga"
                    size="2em"
                    color="primary"
                    icon="fitness_center"
                    :max="5"
                    :min="1"
                  >
                    <q-tooltip>Težina treninga (1-5)</q-tooltip>
                  </q-rating>
                </div>
              </div>

              <!-- Dodavanje vježbi -->
              <div class="q-mt-md">
                <div class="text-h6">Vježbe</div>
                <div v-for="(vjezba, index) in noviTrening.vjezbe" :key="index" class="q-mt-sm">
                  <q-card bordered flat>
                    <q-card-section>
                      <div class="row q-col-gutter-sm">
                        <div class="col-12">
                          <q-select
                            v-model="vjezba.vjezba_id"
                            :options="dostupneVjezbe"
                            label="Odaberi vježbu *"
                            outlined
                            dense
                            emit-value
                            map-options
                            option-label="naziv"
                            option-value="id"
                          />
                        </div>
                        <div class="col-md-4 col-12">
                          <q-input
                            v-model="vjezba.broj_setova"
                            type="number"
                            label="Broj setova"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-md-4 col-12">
                          <q-input
                            v-model="vjezba.broj_ponavljanja"
                            type="number"
                            label="Ponavljanja"
                            outlined
                            dense
                          />
                        </div>
                        <div class="col-md-4 col-12">
                          <q-input
                            v-model="vjezba.tezina"
                            type="number"
                            label="Težina (kg)"
                            outlined
                            dense
                          />
                        </div>
                      </div>
                      <q-btn
                        flat
                        dense
                        color="negative"
                        icon="remove"
                        @click="ukloniVjezbu(index)"
                        class="q-mt-sm"
                      >
                        <q-tooltip>Ukloni vježbu</q-tooltip>
                      </q-btn>
                    </q-card-section>
                  </q-card>
                </div>
                <q-btn
                  flat
                  color="primary"
                  icon="add"
                  label="Dodaj vježbu"
                  @click="dodajVjezbu"
                  class="q-mt-sm"
                />
              </div>

              <!-- Bilješke -->
              <q-input
                v-model="noviTrening.biljeske"
                type="textarea"
                label="Bilješke"
                outlined
                autogrow
              />

              <div class="row justify-end q-mt-md">
                <q-btn
                  label="Spremi trening"
                  type="submit"
                  color="primary"
                  :loading="spremanje"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Povijest treninga -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h5">Povijest Treninga</div>
          </q-card-section>

          <q-card-section>
            <q-list separator>
              <q-item v-for="trening in treninzi" :key="trening.id" class="q-py-md">
                <q-item-section>
                  <q-item-label class="text-h6">
                    {{ trening.tip_treninga }}
                    <q-badge color="primary" class="q-ml-sm">
                      {{ formatirajTrajanje(trening.trajanje) }} min
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption>
                    {{ formatDate(trening.datum) }}
                  </q-item-label>
                  <q-item-label>
                    <div class="text-caption q-mb-xs">Težina treninga:</div>
                    <q-rating
                      v-model="trening.tezina_treninga"
                      size="1em"
                      color="primary"
                      icon="fitness_center"
                      :max="5"
                      :min="1"
                      readonly
                    />
                  </q-item-label>
                  
                  <!-- Vježbe u treningu -->
                  <q-expansion-item
                    v-if="trening.vjezbe && trening.vjezbe.length > 0"
                    label="Vježbe"
                    caption="Klikni za detalje"
                    class="q-mt-sm"
                    icon="fitness_center"
                  >
                    <q-card>
                      <q-card-section>
                        <q-list dense>
                          <q-item v-for="vjezba in trening.vjezbe" :key="vjezba.id">
                            <q-item-section>
                              <q-item-label>{{ vjezba.naziv_vjezbe }}</q-item-label>
                              <q-item-label caption>
                                {{ vjezba.broj_setova }} x {{ vjezba.broj_ponavljanja }}
                                <template v-if="vjezba.tezina">
                                  @ {{ vjezba.tezina }}kg
                                </template>
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>

                  <q-item-label caption v-if="trening.biljeske" class="q-mt-sm">
                    <strong>Bilješke:</strong> {{ trening.biljeske }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="obrisiTrening(trening.id)"
                  >
                    <q-tooltip>Obriši trening</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="check"
                    @click="zavrsiTrening(trening)"
                  >
                    <q-tooltip>Završi trening</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { date } from 'quasar'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

export default {
  name: 'DnevnikTreninga',
  setup () {
    const $q = useQuasar()
    const route = useRoute()
    const treninzi = ref([])
    const spremanje = ref(false)
    const dostupneVjezbe = ref([])
    const treningForm = ref(null)
    const uspjesnoSpremljeno = ref(false)

    const noviTrening = ref({
      tip_treninga: null,
      datum: date.formatDate(Date.now(), 'YYYY-MM-DD'),
      trajanje: null,
      tezina_treninga: 1,
      biljeske: '',
      vjezbe: []
    })

    const tipoviTreninga = [
      { label: 'Snaga', value: 'Snaga' },
      { label: 'Kardio', value: 'Kardio' },
      { label: 'Fleksibilnost', value: 'Fleksibilnost' },
      { label: 'Cross', value: 'Cross' },
      { label: 'Kombinirani', value: 'Kombinirani' }
    ]

    const formatDate = (dateStr) => {
      return date.formatDate(dateStr, 'DD.MM.YYYY.')
    }

    const formatirajTrajanje = (trajanje) => {
      const broj = parseInt(trajanje) || 0
      return Math.min(broj, 1000)
    }

    const dohvatiTreninge = async () => {
      try {
        const response = await api.get('/api/dnevnik')
        treninzi.value = response.data.map(trening => ({
          ...trening,
          trajanje: Math.min(parseInt(trening.trajanje) || 0, 1000)
        }))
      } catch (error) {
        console.error('Greška pri dohvaćanju treninga:', error)
        $q.notify({
          color: 'negative',
          message: error.response?.data?.error || 'Greška pri dohvaćanju treninga',
          icon: 'error'
        })
      }
    }

    const dohvatiVjezbe = async () => {
      try {
        const response = await api.get('/api/vjezbe')
        dostupneVjezbe.value = response.data
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Greška pri dohvaćanju vježbi'
        })
      }
    }

    const dodajVjezbu = () => {
      noviTrening.value.vjezbe.push({
        vjezba_id: null,
        broj_setova: null,
        broj_ponavljanja: null,
        tezina: null
      })
    }

    const ukloniVjezbu = (index) => {
      noviTrening.value.vjezbe.splice(index, 1)
    }

    const spremiTrening = async () => {
      try {
        spremanje.value = true
        console.log('Šaljem podatke:', noviTrening.value)
        await api.post('/api/dnevnik', noviTrening.value)
        
        // Označi da je spremanje uspjelo
        uspjesnoSpremljeno.value = true
        
        // Dohvati ažuriranu povijest treninga
        await dohvatiTreninge()
        
        // Prikaži poruku o uspjehu
        $q.notify({
          color: 'positive',
          message: 'Trening je uspješno spremljen',
          icon: 'check',
          position: 'bottom'
        })

        // Resetiraj podatke i nakon kratke pauze prikaži novu formu
        setTimeout(() => {
          noviTrening.value = {
            tip_treninga: null,
            datum: date.formatDate(Date.now(), 'YYYY-MM-DD'),
            trajanje: null,
            tezina_treninga: 1,
            biljeske: '',
            vjezbe: []
          }
          uspjesnoSpremljeno.value = false
        }, 100)

      } catch (error) {
        console.error('Greška:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri spremanju treninga',
          icon: 'error',
          position: 'bottom'
        })
      } finally {
        spremanje.value = false
      }
    }

    const obrisiTrening = async (id) => {
      try {
        await api.delete(`/api/dnevnik/${id}`)
        await dohvatiTreninge()
        $q.notify({
          color: 'positive',
          message: 'Trening uspješno obrisan'
        })
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Greška pri brisanju treninga'
        })
      }
    }

    const zavrsiTrening = async (trening) => {
      try {
        spremanje.value = true
        await api.post(`/api/dnevnik/${trening.id}/zavrsi`)
        await dohvatiTreninge()
        $q.notify({
          color: 'positive',
          message: 'Trening uspješno završen',
          icon: 'check'
        })
      } catch (error) {
        console.error('Greška pri završavanju treninga:', error)
        $q.notify({
          color: 'negative',
          message: error.response?.data?.error || 'Greška pri završavanju treninga',
          icon: 'error'
        })
      } finally {
        spremanje.value = false
      }
    }

    watch(
      () => route.path,
      () => {
        if (route.path === '/dnevnik-treninga') {
          dohvatiTreninge()
        }
      }
    )

    onMounted(() => {
      dohvatiTreninge()
      dohvatiVjezbe()
    })

    return {
      treninzi,
      noviTrening,
      tipoviTreninga,
      dostupneVjezbe,
      spremanje,
      treningForm,
      formatDate,
      formatirajTrajanje,
      dodajVjezbu,
      ukloniVjezbu,
      spremiTrening,
      obrisiTrening,
      uspjesnoSpremljeno,
      zavrsiTrening
    }
  }
}
</script>
