<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          Mapa del Delito
        </q-toolbar-title>
        <q-space />
        <q-btn flat dense icon="tune" label="Herramientas" @click="toggleTools" class="q-mr-md" />

        <q-btn-dropdown v-if="authStore.isLoggedIn" flat dense icon="account_circle">
          <div class="q-pa-md text-center" style="min-width: 200px;">
            <q-avatar size="72px" color="primary" text-color="white" icon="person" />
            <div class="text-subtitle1 q-mt-md">{{ authStore.user?.name }}</div>
            <div class="text-caption text-grey">{{ authStore.user?.rol }}</div>
            <q-separator class="q-my-md" />
            <q-btn color="negative" label="Cerrar Sesión" push size="sm" v-close-popup @click="handleLogout"
              class="full-width" />
          </div>
        </q-btn-dropdown>
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
        <q-item clickable to="/datos">
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Datos</q-item-label>
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

    <q-slide-transition>
      <div v-show="showTools" class="floating-tools-container">
        <q-toolbar class="bg-white text-dark rounded-borders shadow-8 q-py-sm q-px-md">
          <div class="q-gutter-md row items-center">
            <q-input outlined v-model="fechaInicio" mask="####/##/##" dense label="Fecha de inicio">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaInicio" mask="YYYY/MM/DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input outlined v-model="fechaFin" mask="####/##/##" dense label="Fecha de fin">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaFin" mask="YYYY/MM/DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-btn color="primary" icon="search" label="Buscar" @click="buscarPorFecha" />
            <q-btn flat color="grey" icon="clear" label="Limpiar" @click="limpiarFiltro" class="q-ml-sm" />

          </div>
        </q-toolbar>
      </div>
    </q-slide-transition>

  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import { useGisStore } from 'src/stores/gisStore';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const gisStore = useGisStore(); // <-- Importamos el store de GIS
const $q = useQuasar();

const leftDrawerOpen = ref(false);
const showTools = ref(false);
const fechaInicio = ref<string | null>(null);
const fechaFin = ref<string | null>(null);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleTools = () => {
  showTools.value = !showTools.value;
};

const handleLogout = () => {
  authStore.logout();
  void router.push('/login');
};

// --- LÓGICA ACTUALIZADA PARA EL FILTRADO LOCAL ---
const buscarPorFecha = () => {
  if (!fechaInicio.value || !fechaFin.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecciona una fecha de inicio y una de fin.',
    });
    return;
  }
  if (new Date(fechaInicio.value) > new Date(fechaFin.value)) {
    $q.notify({
      type: 'negative',
      message: 'La fecha de inicio no puede ser posterior a la fecha de fin.',
    });
    return;
  }

  // Llama a la acción síncrona del store
  gisStore.filtrarMarcadoresPorFecha(fechaInicio.value, fechaFin.value);
  $q.notify({ type: 'info', message: 'Filtro aplicado.' });
};

const limpiarFiltro = () => {
  fechaInicio.value = null;
  fechaFin.value = null;
  // Llama a la acción síncrona para limpiar el filtro
  gisStore.limpiarFiltroDeFechas();
  $q.notify({ type: 'info', message: 'Filtro limpiado.' });
};
</script>

<style scoped>
.floating-tools-container {
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4000;
}
</style>
