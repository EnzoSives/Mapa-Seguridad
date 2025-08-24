import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import routes from './routes';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // --- AÑADIR ESTE BLOQUE ---
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const isGuest = to.matched.some(record => record.meta.guest);

    if (requiresAuth && !authStore.isLoggedIn) {
      // Si la ruta requiere autenticación y no está logueado, redirige a /login
      next('/login');
    } else if (isGuest && authStore.isLoggedIn) {
      // Si es una ruta de invitado (como login) y ya está logueado, redirige al inicio
      next('/');
    } else {
      // En cualquier otro caso, permite la navegación
      next();
    }
  });
  // --- FIN DEL BLOQUE A AÑADIR ---

  return Router;
});