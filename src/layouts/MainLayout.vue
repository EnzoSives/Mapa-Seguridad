<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Mapa Simple</q-toolbar-title>

        <div v-if="authStore.isLoggedIn" class="q-mr-md">
          Hola, {{ authStore.user?.name }}
        </div>
        <q-btn v-if="authStore.isLoggedIn" flat round dense icon="logout" @click="handleLogout" />

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
// 1. Importa el store de autenticación
import { useAuthStore } from 'src/stores/authStore';
import { useRouter } from 'vue-router';

// 2. Crea una instancia del store
const authStore = useAuthStore();
const router = useRouter();

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// 3. Define la función que llama a la acción de logout del store
function handleLogout() {
  authStore.logout();
  void router.push('/login');
}
</script>