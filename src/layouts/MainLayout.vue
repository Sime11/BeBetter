<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-h5 text-bold">BeBetter</q-toolbar-title>
        <q-space />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above>
      <q-list>
        <q-item v-for="item in linkedList" :key="item.title" clickable v-ripple tag="router-link" :to="item.link">
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.title }}</q-item-label>
            <q-item-label caption>{{ item.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>



<script>
export default {
  name: 'MainLayout',
  setup () {
    const linkedList = [
      { title: 'Naslovnica', caption: 'Početna stranica', icon: 'home', link: '/' },
      { title: 'Moj profil', caption: 'Vaš profil i ciljevi', icon: 'person', link: '/moj_profil' },
      { title: 'Dnevnik treninga', caption: 'Unesite svoje treninge', icon: 'fitness_center', link: '/dnevnik_treninga' },
      { title: 'Planovi treninga', caption: 'Pregled i prilagodba planova', icon: 'assignment', link: '/planovi_treninga' },
      { title: 'Napredak', caption: 'Analizirajte svoj napredak', icon: 'show_chart', link: '/napredak' },
      { title: 'Login', caption: 'Prijava', icon: 'login', link: '/login' },
      { title: 'Registracija', caption: 'Registrirajte se', icon: 'person_add', link: '/registracija' }
    ];

    return { linkedList };
  }
}
</script>

