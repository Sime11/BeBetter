const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },                   // Početna stranica
      { path: '/moj_profil', component: () => import('pages/MojProfil.vue') },        // Moj profil
      { path: '/dnevnik_treninga', component: () => import('pages/DnevnikTreninga.vue') }, // Dnevnik treninga
      { path: '/planovi_treninga', component: () => import('pages/PlanoviTreninga.vue') }, // Planovi treninga
      { path: '/napredak', component: () => import('pages/NapredakPage.vue') },       // Napredak
      { path: '/login', component: () => import('pages/UserLogin.vue') },             // Login
      { path: '/registracija', component: () => import('pages/RegistracijaPage.vue') } // Registracija
    ]
  },

  // 404 Not Found page - Always leave this as the last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
