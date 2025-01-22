<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          BeBetter
        </q-toolbar-title>

        <div v-if="authStore.user">
          {{ authStore.user.ime }} {{ authStore.user.prezime }}
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white"
    >
      <q-list>
        <q-item-label header>Izbornik</q-item-label>

        <!-- Osnovne stranice -->
        <div class="q-pb-sm">
          <q-item clickable v-ripple to="/">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Početna</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/o-nama">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>O nama</q-item-section>
          </q-item>
        </div>

        <!-- Stranice za prijavljene korisnike -->
        <template v-if="authStore.user">
          <q-separator spaced />
          
          <!-- Profil i treninzi -->
          <div class="q-pb-sm">
            <q-item clickable v-ripple to="/moj-profil">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Moj Profil</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/dnevnik-treninga">
              <q-item-section avatar>
                <q-icon name="fitness_center" />
              </q-item-section>
              <q-item-section>Dnevnik Treninga</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/planovi-treninga">
              <q-item-section avatar>
                <q-icon name="calendar_month" />
              </q-item-section>
              <q-item-section>Planovi Treninga</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/vjezbe">
              <q-item-section avatar>
                <q-icon name="sports_gymnastics" />
              </q-item-section>
              <q-item-section>Vježbe</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/zavrseni-treninzi">
              <q-item-section avatar>
                <q-icon name="history" />
              </q-item-section>
              <q-item-section>Završeni Treninzi</q-item-section>
            </q-item>
          </div>

          <q-separator spaced />

          <!-- Informacije i obavijesti -->
          <div class="q-pb-sm">
            <q-item clickable v-ripple to="/faq">
              <q-item-section avatar>
                <q-icon name="help" />
              </q-item-section>
              <q-item-section>FAQ</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/obavijesti">
              <q-item-section avatar>
                <q-icon name="notifications" />
              </q-item-section>
              <q-item-section>Obavijesti</q-item-section>
            </q-item>
          </div>

          <q-separator spaced />

          <!-- Odjava -->
          <div>
            <q-item clickable v-ripple @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Odjava</q-item-section>
            </q-item>
          </div>
        </template>

        <!-- Login za neprijavljene -->
        <template v-else>
          <q-separator spaced />
          <q-item clickable v-ripple to="/login">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>Prijava</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'MainLayout',

  setup () {
    const leftDrawerOpen = ref(false)
    const authStore = useAuthStore()
    const router = useRouter()

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    return {
      leftDrawerOpen,
      authStore,
      handleLogout,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>

<style lang="scss">
.q-drawer {
  .q-item {
    border-radius: 0 32px 32px 0;
    margin-right: 12px;
    margin-bottom: 4px;
  }
}
</style>
