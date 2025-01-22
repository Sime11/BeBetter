<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div v-for="vjezba in filtriraneVjezbe" :key="vjezba.id" class="col-12 col-sm-6 col-md-4">
        <q-card class="my-card">
          <div class="media-container" @click="showImageModal(vjezba)">
            <template v-if="isVideo(vjezba.slika)">
              <video
                :src="vjezba.slika"
                class="exercise-media"
                loop
                muted
                playsinline
                @mouseover="playVideo"
                @mouseleave="pauseVideo"
                @error="handleMediaError(vjezba, 'video')"
              >
                <div class="absolute-full flex flex-center bg-negative text-white">
                  Video nije dostupan
                </div>
              </video>
            </template>
            <template v-else>
              <q-img
                :src="vjezba.slika || '/images/default-exercise.svg'"
                class="exercise-media"
                @error="handleMediaError(vjezba, 'image')"
              >
                <template v-slot:loading>
                  <q-spinner-dots color="white" />
                </template>
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-negative text-white">
                    Slika nije dostupna
                  </div>
                </template>
              </q-img>
              <div class="hover-overlay">
                <q-icon name="zoom_in" size="md" color="white" />
              </div>
            </template>
          </div>

          <q-card-section>
            <div class="text-h6">{{ vjezba.naziv }}</div>
            <div class="text-subtitle2">
              <q-chip color="primary" text-color="white" size="sm">
                {{ vjezba.misicna_grupa }}
              </q-chip>
              <q-chip :color="getTezinaBoja(vjezba.tezina_vjezbe)" text-color="white" size="sm">
                {{ vjezba.tezina_vjezbe }}
              </q-chip>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-body2">{{ vjezba.opis }}</div>
            
            <q-expansion-item
              group="extras"
              icon="fitness_center"
              label="Oprema"
              header-class="text-primary"
            >
              <q-card>
                <q-card-section>
                  {{ vjezba.oprema }}
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item
              group="extras"
              icon="sports_gymnastics"
              label="Tehnika izvođenja"
              header-class="text-primary"
            >
              <q-card>
                <q-card-section>
                  <div v-for="(korak, index) in vjezba.tehnika.split('\n')" :key="index">
                    {{ korak }}
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item
              group="extras"
              icon="tips_and_updates"
              label="Savjeti"
              header-class="text-primary"
            >
              <q-card>
                <q-card-section>
                  {{ vjezba.savjeti }}
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              icon="add"
              label="Dodaj u plan"
              @click="dodajUPlan(vjezba)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Modal za prikaz slike -->
    <q-dialog v-model="imageModal">
      <q-card class="image-modal">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selectedVjezba?.naziv }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-img
            :src="selectedVjezba?.slika"
            style="max-height: 80vh;"
            fit="contain"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog za dodavanje u plan -->
    <q-dialog v-model="dodajUPlanDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Dodaj u plan treninga</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-select
              v-model="odabraniPlan"
              :options="planovi"
              label="Odaberi plan"
              option-label="naziv"
              class="q-mb-md"
            />

            <q-select
              v-model="odabraniDan"
              :options="odabraniPlan?.dani"
              label="Odaberi dan"
              option-label="naziv"
              class="q-mb-md"
              :disable="!odabraniPlan"
            />

            <q-input
              v-model="brojSetova"
              type="number"
              label="Broj setova"
              class="q-mb-md"
            />

            <q-input
              v-model="brojPonavljanja"
              type="number"
              label="Broj ponavljanja"
              class="q-mb-md"
            />

            <q-input
              v-model="tezina"
              type="number"
              label="Težina (kg)"
              class="q-mb-md"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Spremi" color="primary" @click="potvrdiDodavanjeUPlan" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Defaultna slika
const DEFAULT_IMAGE = '/images/default-exercise.svg'

// Funkcija za dohvaćanje defaultne slike
const getDefaultImage = (misicnaGrupa) => {
  return DEFAULT_IMAGE
}

const vjezbe = ref([])
const pretraga = ref('')
const odabranaMisicnaGrupa = ref('')
const odabranaTezina = ref('')
const detaljiOtvoreni = ref(false)
const odabranaVjezba = ref(null)
const originalImages = ref(new Map())

const misicneGrupe = [
  'Prsa',
  'Leđa',
  'Noge',
  'Ramena',
  'Biceps',
  'Triceps',
  'Trbušnjaci',
  'Gluteus'
]

const tezine = [
  'Početnik',
  'Srednji',
  'Napredni'
]

const getTezinaBoja = (tezina) => {
  const boje = {
    'Početnik': 'green',
    'Srednji': 'orange',
    'Napredni': 'red'
  }
  return boje[tezina] || 'grey'
}

const dohvatiVjezbe = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await api.get('/api/vjezbe', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('Dohvaćene vježbe:', response.data);
    vjezbe.value = response.data.map(vjezba => ({
      ...vjezba,
      currentImage: vjezba.slika
    }))
  } catch (error) {
    console.error('Greška pri dohvaćanju vježbi:', error)
  }
}

const filtriraneVjezbe = computed(() => {
  return vjezbe.value.filter(vjezba => {
    const odgovaraMisicnojGrupi = !odabranaMisicnaGrupa.value || 
      vjezba.misicna_grupa === odabranaMisicnaGrupa.value
    const odgovaraTezini = !odabranaTezina.value || 
      vjezba.tezina_vjezbe === odabranaTezina.value
    const odgovaraPretrazi = !pretraga.value || 
      vjezba.naziv.toLowerCase().includes(pretraga.value.toLowerCase()) ||
      vjezba.opis.toLowerCase().includes(pretraga.value.toLowerCase())
    
    return odgovaraMisicnojGrupi && odgovaraTezini && odgovaraPretrazi
  })
})

const showGif = (vjezba) => {
  if (vjezba.slika) {
    vjezba.currentImage = vjezba.slika;
  }
};

const hideGif = (vjezba) => {
  vjezba.currentImage = vjezba.slika || '/images/default-exercise.svg';
};

const handleMediaError = (vjezba, type) => {
  console.error(`Greška pri učitavanju ${type === 'video' ? 'videa' : 'slike'} za vježbu:`, vjezba.naziv);
  console.error('Putanja medija:', vjezba.slika);
  vjezba.slika = '/images/default-exercise.svg';
};

const isVideo = (path) => {
  if (!path) return false;
  const lowercasePath = path.toLowerCase();
  console.log('Checking path:', path);
  return lowercasePath.endsWith('.mp4') || lowercasePath.endsWith('.webm');
};

const playVideo = (event) => {
  const video = event.target;
  console.log('Playing video:', video.src);
  video.play().catch(error => {
    console.error('Error playing video:', error);
  });
};

const pauseVideo = (event) => {
  const video = event.target;
  console.log('Pausing video:', video.src);
  video.pause();
};

const imageModal = ref(false);
const selectedVjezba = ref(null);

const showImageModal = (vjezba) => {
  if (!isVideo(vjezba.slika)) {
    selectedVjezba.value = vjezba;
    imageModal.value = true;
  }
};

const dodajUPlanDialog = ref(false)
const odabraniPlan = ref(null)
const odabraniDan = ref(null)
const brojSetova = ref(3)
const brojPonavljanja = ref(10)
const tezina = ref(0)
const planovi = ref([])
const trenutnaVjezba = ref(null)

const daniUTjednu = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja']

const dohvatiPlanove = async () => {
  try {
    const { data } = await api.get('/api/planovi-treninga')
    planovi.value = data.map(plan => ({
      ...plan,
      dani: Array(parseInt(plan.trajanje_dana)).fill().map((_, index) => ({
        naziv: daniUTjednu[index],
        index: index + 1 // dan_index u bazi počinje od 1
      }))
    }))
  } catch (error) {
    console.error('Greška pri dohvaćanju planova:', error)
    $q.notify({
      color: 'negative',
      message: 'Greška pri dohvaćanju planova',
      icon: 'error'
    })
  }
}

const dodajUPlan = (vjezba) => {
  trenutnaVjezba.value = vjezba
  dodajUPlanDialog.value = true
}

const potvrdiDodavanjeUPlan = async () => {
  try {
    if (!odabraniPlan.value || !odabraniDan.value) {
      $q.notify({
        color: 'negative',
        message: 'Odaberi plan i dan',
        icon: 'error'
      })
      return
    }

    console.log('Dodavanje vježbe:', {
      plan: odabraniPlan.value,
      dan: odabraniDan.value,
      vjezba: trenutnaVjezba.value,
      setovi: brojSetova.value,
      ponavljanja: brojPonavljanja.value,
      tezina: tezina.value
    })

    const vjezbaZaDodati = {
      vjezba_id: trenutnaVjezba.value.id,
      broj_setova: parseInt(brojSetova.value),
      broj_ponavljanja: parseInt(brojPonavljanja.value),
      tezina: parseFloat(tezina.value) || 0
    }

    await api.post(`/api/planovi-treninga/${odabraniPlan.value.id}/vjezbe`, {
      dan_index: odabraniDan.value.index,
      vjezba: vjezbaZaDodati
    })

    $q.notify({
      color: 'positive',
      message: 'Vježba uspješno dodana u plan',
      icon: 'check'
    })

    dodajUPlanDialog.value = false
    resetirajFormu()
  } catch (error) {
    console.error('Greška pri dodavanju vježbe u plan:', error)
    $q.notify({
      color: 'negative',
      message: 'Greška pri dodavanju vježbe u plan',
      icon: 'error'
    })
  }
}

const resetirajFormu = () => {
  odabraniPlan.value = null
  odabraniDan.value = null
  brojSetova.value = 3
  brojPonavljanja.value = 10
  tezina.value = 0
  trenutnaVjezba.value = null
}

dohvatiVjezbe()
dohvatiPlanove()

</script>

<style scoped>
.media-container {
  height: 200px;
  overflow: hidden;
  position: relative;
  background: #f0f0f0;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
}

.exercise-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.media-container:hover .exercise-media {
  transform: scale(1.1);
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-container:hover .hover-overlay {
  opacity: 1;
}

.my-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.q-img {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-modal {
  min-width: 80vw;
  max-width: 95vw;
}
</style>
