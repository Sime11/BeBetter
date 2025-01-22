<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <h4 class="text-h4 q-mb-md">Često postavljena pitanja</h4>
        
        <!-- Pretraga -->
        <q-input
          v-model="search"
          outlined
          label="Pretraži pitanja"
          class="q-mb-md"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Filter po kategorijama -->
        <div class="q-mb-md">
          <q-chip
            v-for="cat in categories"
            :key="cat"
            :selected="selectedCategory === cat"
            clickable
            @click="selectedCategory = cat === selectedCategory ? null : cat"
            color="primary"
            text-color="white"
            :class="{ 'bg-grey-4': selectedCategory !== cat }"
          >
            {{ cat }}
          </q-chip>
        </div>

        <!-- FAQ Lista -->
        <q-list separator>
          <q-expansion-item
            v-for="faq in filteredFaqs"
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
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>

        <!-- Ako nema rezultata -->
        <div v-if="filteredFaqs.length === 0" class="text-center q-pa-md">
          <q-icon name="search_off" size="50px" color="grey-5" />
          <p class="text-grey-7 q-mt-sm">Nema pronađenih pitanja</p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

export default {
  name: 'FaqPage',
  setup () {
    const $q = useQuasar()
    const faqs = ref([])
    const search = ref('')
    const selectedCategory = ref(null)
    const categories = ref([])

    // Filtriramo FAQ-ove prema pretrazi i odabranoj kategoriji
    const filteredFaqs = computed(() => {
      return faqs.value.filter(faq => {
        const matchesSearch = !search.value || 
          faq.pitanje.toLowerCase().includes(search.value.toLowerCase()) ||
          faq.odgovor.toLowerCase().includes(search.value.toLowerCase())
        
        const matchesCategory = !selectedCategory.value || 
          faq.kategorija === selectedCategory.value
        
        return matchesSearch && matchesCategory
      })
    })

    const loadFaqs = async () => {
      try {
        const response = await api.get('/api/faq')
        console.log('FAQ response:', response.data)
        faqs.value = response.data
        // Izvuci jedinstvene kategorije iz FAQ-ova
        categories.value = [...new Set(faqs.value.map(faq => faq.kategorija))].filter(Boolean)
      } catch (error) {
        console.error('Greška pri učitavanju FAQ-a:', error)
        $q.notify({
          color: 'negative',
          message: 'Greška pri učitavanju FAQ-a'
        })
      }
    }

    // Učitaj FAQ-ove pri mountanju komponente
    onMounted(() => {
      loadFaqs()
    })

    return {
      faqs,
      search,
      categories,
      selectedCategory,
      filteredFaqs
    }
  }
}
</script>

<style lang="scss" scoped>
.q-expansion-item {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.q-chip {
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}
</style>
