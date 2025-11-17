                              <template>
                                <q-layout view="lHh Lpr lFf">
                                  <q-header elevated class="bg-primary text-white">
                                    <q-toolbar>
                                      <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
                                      <q-toolbar-title>
                                        Mapa del Delito
                                      </q-toolbar-title>
                                      <q-space />
                                      <q-btn flat dense icon="tune" label="Herramientas" @click="toggleTools"
                                        class="q-mr-md" />

                                      <q-btn-dropdown v-if="authStore.isLoggedIn" flat dense icon="account_circle">
                                        <div class="q-pa-md text-center" style="min-width: 200px;">
                                          <q-avatar size="72px" color="primary" text-color="white" icon="person" />
                                          <div class="text-subtitle1 q-mt-md">{{ authStore.user?.name }}</div>
                                          <div class="text-caption text-grey">{{ authStore.user?.rol }}</div>
                                          <q-separator class="q-my-md" />
                                          <q-btn color="negative" label="Cerrar Sesión" push size="sm" v-close-popup
                                            @click="handleLogout" class="full-width" />
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
                                      <q-item clickable to="/charts">
                                        <q-item-section avatar>
                                          <q-icon name="insights" />
                                        </q-item-section>
                                        <q-item-section>
                                          <q-item-label>Gráficos</q-item-label>
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

                                    <!-- Barra de filtros de fecha siempre visible (solo en página principal) -->
                                    <div v-if="route.path === '/'" class="floating-filter-container">
                                      <q-toolbar class="bg-white text-dark rounded-borders shadow-8 q-py-sm q-px-md">
                                        <div class="q-gutter-md row items-center">
                                          <DatePicker v-model="fechaInicio" mode="date" is24hr>
                                            <template #default="{ inputValue, inputEvents }">
                                              <q-input outlined :model-value="inputValue" v-on="inputEvents" dense
                                                label="Fecha de inicio">
                                                <template v-slot:append>
                                                  <q-icon name="event" class="cursor-pointer" />
                                                </template>
                                              </q-input>
                                            </template>
                                          </DatePicker>

                                          <DatePicker v-model="fechaFin" mode="date" is24hr>
                                            <template #default="{ inputValue, inputEvents }">
                                              <q-input outlined :model-value="inputValue" v-on="inputEvents" dense
                                                label="Fecha de fin">
                                                <template v-slot:append>
                                                  <q-icon name="event" class="cursor-pointer" />
                                                </template>
                                              </q-input>
                                            </template>
                                          </DatePicker>

                                          <q-btn color="primary" icon="search" label="Buscar" @click="buscarPorFecha" />
                                          <q-btn flat color="grey" icon="clear" label="Limpiar" @click="limpiarFiltro"
                                            class="q-ml-sm" />
                                        </div>
                                      </q-toolbar>
                                    </div>
                                  </q-page-container>

                                  <!-- Barra de herramientas adicionales (solo imprimir en página principal) -->
                                  <q-slide-transition>
                                    <div v-show="showTools && route.path === '/'" class="floating-tools-container">
                                      <q-toolbar class="bg-white text-dark rounded-borders shadow-8 q-py-sm q-px-md">
                                        <div class="q-gutter-md row items-center">
                                          <q-btn color="accent" icon="print" label="Imprimir Mapa" @click="imprimirMapa" />
                                        </div>
                                      </q-toolbar>
                                    </div>
                                  </q-slide-transition>                                </q-layout>
                              </template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import { useGisStore } from 'src/stores/gisStore';
import { useQuasar } from 'quasar';
import { DatePicker } from 'v-calendar';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const gisStore = useGisStore();
const $q = useQuasar();

const leftDrawerOpen = ref(false);
const showTools = ref(false);
const fechaInicio = ref<Date | null>(null);
const fechaFin = ref<Date | null>(null);

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

const buscarPorFecha = async () => { // 🚀 CAMBIO CLAVE: Agregar 'async' aquí
  if (!fechaInicio.value || !fechaFin.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecciona una fecha de inicio y una de fin.',
    });
    return;
  }
  if (fechaInicio.value > fechaFin.value) {
    $q.notify({
      type: 'negative',
      message: 'La fecha de inicio no puede ser posterior a la fecha de fin.',
    });
    return;
  }

  // Llama a la acción del store que aplica el filtro de rango
  await gisStore.filtrarMarcadoresPorFecha( // 🚀 CAMBIO CLAVE: Agregar 'await' aquí
    fechaInicio.value.toISOString(),
    fechaFin.value.toISOString()
  );
  $q.notify({ type: 'info', message: 'Filtro aplicado.' });
};

const limpiarFiltro = () => {
  fechaInicio.value = null;
  fechaFin.value = null;
  gisStore.limpiarFiltroDeFechas();
  $q.notify({ type: 'info', message: 'Filtro limpiado.' });
};

const imprimirMapa = () => {
  // Emitir evento para que el componente del mapa prepare la vista completa
  window.dispatchEvent(new CustomEvent('print-full-map'));
};
</script>

<style scoped>
.floating-filter-container {
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4000;
}

.floating-tools-container {
  position: absolute;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4000;
}
</style>

<style>
/* Estilos de impresión para ocultar todo excepto el mapa */
@media print {
  /* Configuración de página */
  @page {
    size: landscape;
    margin: 0;
  }

  /* Ocultar header, drawer y herramientas */
  .q-header,
  .q-drawer,
  .floating-filter-container,
  .floating-tools-container {
    display: none !important;
  }

  /* Hacer que el layout ocupe toda la página */
  .q-layout,
  .q-page-container {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Asegurar que el contenido del mapa ocupe toda la página */
  body,
  html {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }
}
</style>
