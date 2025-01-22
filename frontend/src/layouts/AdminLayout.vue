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

        <q-toolbar-title>BeBetter Admin</q-toolbar-title>

        <div>Admin: {{ authStore.user?.ime }} {{ authStore.user?.prezime }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white"
    >
      <q-list>
        <q-item-label header>Admin Menu</q-item-label>

        <q-item clickable v-ripple to="/admin" exact>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/obavijesti">
          <q-item-section avatar>
            <q-icon name="notifications" />
          </q-item-section>
          <q-item-section>Upravljanje Obavijestima</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/faq">
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>Upravljanje FAQ-om</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/o-nama">
          <q-item-section avatar>
            <q-icon name="info" />
          </q-item-section>
          <q-item-section>O nama</q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable v-ripple @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Odjava</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'AdminLayout',

  setup () {
    const router = useRouter()
    const authStore = useAuthStore()
    const leftDrawerOpen = ref(false)

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const logout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      logout,
      authStore
    }
  }
}
</script>

<style lang="scss">
.q-drawer {
  .q-item {
    border-radius: 0 24px 24px 0;
    margin-right: 12px;
    margin-bottom: 4px;

    &.q-router-link-active {
      background: #e3f2fd;
      color: #1976d2;
      font-weight: 500;
      
      .q-icon {
        color: #1976d2;
      }
    }
  }
}
</style>
