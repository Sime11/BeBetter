import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    // Ako korisnik pokušava pristupiti login/register stranici dok je prijavljen
    if (authStore.isAuthenticated && ['/login', '/registracija'].includes(to.path)) {
      next('/')
      return
    }

    // Ako ruta ne zahtijeva autentifikaciju, pusti prolaz
    if (!to.meta.requiresAuth) {
      next()
      return
    }

    // Ako ruta zahtijeva autentifikaciju, a korisnik nije prijavljen
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }

    // Ako ruta zahtijeva admin prava, a korisnik nije admin
    if (to.meta.requiresAdmin && authStore.user?.uloga !== 'admin') {
      next('/')
      return
    }

    // U svim ostalim slučajevima, pusti prolaz
    next()
  })

  return Router
})
