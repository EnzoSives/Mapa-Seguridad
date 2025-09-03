<template>
  <q-layout view="lHh Lpr lFf" id="main-layout">
    <q-header flat class="text-white">
      <q-toolbar class="q-toolbar-custom">
        <div class="menu-container">
          <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="q-mr-md" color="dark" />
          <q-toolbar-title class="text-dark">
            Mapa Simple
          </q-toolbar-title>
          <div v-if="authStore.isLoggedIn" class="q-mr-md text-dark">
            Hola, {{ authStore.user?.name }}
          </div>
          <q-btn v-if="authStore.isLoggedIn" flat round dense icon="logout" @click="handleLogout" color="dark" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header>Menú</q-item-label>
        <q-item clickable to="/">
          <q-item-section avatar>
            <q-icon name="map" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mapa</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Cerrar Sesión</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleLogout = () => {
  authStore.logout();
  void router.push('/login');
};
</script>

<style scoped>
#main-layout > .q-header {
  background-color: transparent !important;
  box-shadow: none !important;
}

.q-toolbar-custom {
  justify-content: center;
  padding: 0;
  min-height: auto;
}

.menu-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: white;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 15px; /* <-- CAMBIO AQUÍ */
}
</style>
