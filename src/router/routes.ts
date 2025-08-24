import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true }, 
    children: [{ path: '', component: () => import('pages/MapVue.vue') }],
  },
   {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { guest: true } // Para redirigir si ya está logueado
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
