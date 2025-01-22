<template>
  <q-page padding class="bg-grey-2">
    <!-- Glavni header -->
    <div class="text-center q-mb-md">
      <h1 class="text-h4 text-bold text-primary">BeBetter Fitness App</h1>
      <p class="text-subtitle1 text-grey-8">Pratite svoj napredak, trenirajte pametno i postignite svoje ciljeve!</p>
    </div>

    <!-- Sekcija za kratki opis -->
    <div class="q-mb-lg text-center">
      <q-img
        src="https://source.unsplash.com/featured/?fitness,workout"
        spinner-color="primary"
        style="height: 200px; border-radius: 12px;"
      />
    </div>

    <!-- Sekcija s karticama -->
    <div class="row q-gutter-md justify-center">
      <q-card
        class="col-xs-12 col-sm-6 col-md-3 bg-white text-center shadow-3"
        flat
        bordered
      >
        <q-card-section>
          <q-icon name="fitness_center" size="3rem" color="primary" />
          <div class="text-h6 q-mt-md">Planovi Treninga</div>
          <p class="text-grey-7">Kreirajte i pratite personalizirane treninge za bolji rezultat.</p>
        </q-card-section>
      </q-card>

      <q-card
        class="col-xs-12 col-sm-6 col-md-3 bg-white text-center shadow-3"
        flat
        bordered
      >
        <q-card-section>
          <q-icon name="assignment" size="3rem" color="primary" />
          <div class="text-h6 q-mt-md">Dnevnik Treninga</div>
          <p class="text-grey-7">Unosite vježbe i pratite svoj napredak iz dana u dan.</p>
        </q-card-section>
      </q-card>

      <q-card
        class="col-xs-12 col-sm-6 col-md-3 bg-white text-center shadow-3"
        flat
        bordered
      >
        <q-card-section>
          <q-icon name="trending_up" size="3rem" color="primary" />
          <div class="text-h6 q-mt-md">Vaš Napredak</div>
          <p class="text-grey-7">Pratite grafički prikaz vašeg napretka kroz vrijeme.</p>
        </q-card-section>
      </q-card>

      <q-card
        class="col-xs-12 col-sm-6 col-md-3 bg-white text-center shadow-3"
        flat
        bordered
      >
        <q-card-section>
          <q-icon name="person" size="3rem" color="primary" />
          <div class="text-h6 q-mt-md">Moj Profil</div>
          <p class="text-grey-7">Uredite podatke, postavite ciljeve i personalizirajte svoj profil.</p>
        </q-card-section>
      </q-card>
    </div>

    <!-- Motivacijski citat -->
    <div class="q-mt-lg text-center">
      <q-icon name="format_quote" size="2rem" color="primary" />
      <p class="text-subtitle1 text-grey-7">
        "Ne odustaj kad postane teško. Odustani kad završiš!"
      </p>
      <q-icon name="format_quote" size="2rem" color="primary" />
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'NaslovnicaPage'
};
</script>

<style scoped>
.text-primary {
  color: #1976D2;
}
.shadow-3 {
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
