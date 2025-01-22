<template>
  <q-page padding>
    <!-- Glavni naslov -->
    <div class="text-h4 text-center q-mb-lg text-blue-8">
      <q-icon name="info" size="md" class="q-mr-sm" />
      O Nama
    </div>

    <!-- Kratki opis aplikacije -->
    <div class="text-center q-mb-lg">
      <p class="text-subtitle1">
        Dobrodošli u <strong>BeBetter</strong> – vašu ultimativnu fitness aplikaciju!
        Ovdje možete pratiti napredak, planirati treninge i postizati svoje ciljeve.
      </p>
      <p class="text-subtitle2">
        Naša misija je pomoći vam da budete zdraviji, snažniji i bolja verzija sebe!
      </p>
    </div>

    <!-- Sekcija sa karticama o vrijednostima aplikacije -->
    <div class="row q-mb-lg justify-around">
      <q-card flat bordered class="col-3 q-pa-md text-center bg-blue-1">
        <q-icon name="fitness_center" size="lg" color="blue-8" />
        <div class="text-h6 q-mt-sm">Personalizirani Planovi</div>
        <p class="text-caption">
          Prilagodite svoje planove treninga vašim potrebama i ciljevima.
        </p>
      </q-card>
      <q-card flat bordered class="col-3 q-pa-md text-center bg-blue-1">
        <q-icon name="timeline" size="lg" color="blue-8" />
        <div class="text-h6 q-mt-sm">Pratite Napredak</div>
        <p class="text-caption">
          Grafovi i statistike kako biste pratili vaš razvoj kroz vrijeme.
        </p>
      </q-card>
      <q-card flat bordered class="col-3 q-pa-md text-center bg-blue-1">
        <q-icon name="group" size="lg" color="blue-8" />
        <div class="text-h6 q-mt-sm">Podrška Zajednice</div>
        <p class="text-caption">
          Zajedno smo jači! Pratite napredak drugih i motivirajte se.
        </p>
      </q-card>
    </div>

    <!-- Leaflet mapa za lokaciju u Rijeci -->
    <div id="map" class="q-mt-lg map-container"></div>

    <!-- Kontakt kartica -->
    <div class="row justify-center q-mt-xl">
      <div class="col-12 col-md-10">
        <q-card class="contact-card">
          <q-card-section>
            <div class="text-h4 text-weight-bold text-center text-primary q-mb-xl">
              <q-icon name="contact_support" size="xl" class="q-mr-md" />
              Kontaktirajte Nas
            </div>

            <div class="row q-col-gutter-xl">
              <!-- Kontakt informacije -->
              <div class="col-12 col-md-6">
                <div class="contact-info q-pa-md">
                  <div class="text-h6 text-primary q-mb-lg">Kontakt Informacije</div>
                  
                  <div class="contact-item q-mb-md">
                    <q-icon name="location_on" color="primary" size="sm" class="q-mr-sm" />
                    <div>
                      <div class="text-weight-medium">Adresa</div>
                      <div class="text-grey-8">Vukovarska 58, 51000 Rijeka</div>
                    </div>
                  </div>

                  <div class="contact-item q-mb-md">
                    <q-icon name="email" color="primary" size="sm" class="q-mr-sm" />
                    <div>
                      <div class="text-weight-medium">Email</div>
                      <div class="text-grey-8">info@bebetter.hr</div>
                    </div>
                  </div>

                  <div class="contact-item q-mb-md">
                    <q-icon name="phone" color="primary" size="sm" class="q-mr-sm" />
                    <div>
                      <div class="text-weight-medium">Telefon</div>
                      <div class="text-grey-8">+385 51 123 456</div>
                    </div>
                  </div>

                  <div class="contact-item">
                    <q-icon name="schedule" color="primary" size="sm" class="q-mr-sm" />
                    <div>
                      <div class="text-weight-medium">Radno Vrijeme</div>
                      <div class="text-grey-8">Pon - Pet: 08:00 - 20:00</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Društvene mreže -->
              <div class="col-12 col-md-6">
                <div class="social-media q-pa-md">
                  <div class="text-h6 text-primary q-mb-lg">Pratite Nas</div>
                  
                  <p class="text-grey-8 q-mb-lg">
                    Ostanite povezani s nama na društvenim mrežama za najnovije savjete,
                    motivaciju i novosti iz svijeta fitnessa!
                  </p>

                  <div class="row q-gutter-md justify-center">
                    <q-btn round flat color="blue-9" class="social-btn">
                      <q-icon name="fab fa-facebook-f" size="sm" />
                    </q-btn>
                    <q-btn round flat color="deep-orange" class="social-btn">
                      <q-icon name="fab fa-instagram" size="sm" />
                    </q-btn>
                    <q-btn round flat color="light-blue" class="social-btn">
                      <q-icon name="fab fa-twitter" size="sm" />
                    </q-btn>
                    <q-btn round flat color="red" class="social-btn">
                      <q-icon name="fab fa-youtube" size="sm" />
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { onMounted } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default {
  name: "ONamaPage",
  setup() {
    const initMap = () => {
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      const map = L.map("map").setView([45.3271, 14.4422], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([45.3271, 14.4422])
        .addTo(map)
        .bindPopup("Nalazimo se ovdje!<br>Rijeka, Hrvatska.")
        .openPopup();
    };

    onMounted(() => {
      setTimeout(initMap, 100);
    });

    return {};
  },
};
</script>

<style scoped>
.map-container {
  height: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.contact-card {
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.contact-item:hover {
  background-color: #f5f5f5;
}

.social-btn {
  width: 48px;
  height: 48px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
