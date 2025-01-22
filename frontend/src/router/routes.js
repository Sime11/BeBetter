const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      // Javne stranice
      { 
        path: '', 
        component: () => import('../pages/IndexPage.vue')
      },
      {
        path: 'o-nama',
        component: () => import('../pages/ONamaPage.vue'),
        meta: { requiresAuth: false } // dostupno svima
      },
      {
        path: 'login',
        component: () => import('../pages/UserLogin.vue')
      },
      {
        path: 'registracija',
        component: () => import('../pages/RegistracijaPage.vue')
      },
      
      // Zaštićene stranice (potreban login)
      { 
        path: 'moj-profil', 
        component: () => import('../pages/MojProfilPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'dnevnik-treninga',
        component: () => import('../pages/DnevnikTreninga.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'vjezbe',
        component: () => import('../pages/VjezbePage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'planovi-treninga',
        component: () => import('../pages/PlanoviTreninga.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'zavrseni-treninzi',
        component: () => import('../pages/ZavrseniTreninzi.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'obavijesti', 
        component: () => import('../pages/NoticesPage.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'faq', 
        component: () => import('../pages/FaqPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  // Admin rute s AdminLayout-om
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        component: () => import('../pages/AdminPage.vue'),
      },
      {
        path: 'obavijesti',
        component: () => import('../pages/AdminNoticesPage.vue'),
      },
      {
        path: 'faq',
        component: () => import('../pages/AdminFaqPage.vue'),
      },
      {
        path: 'o-nama',
        component: () => import('../pages/ONamaPage.vue'),
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
]

export default routes
