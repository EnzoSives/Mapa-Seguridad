                              <template>
                                <q-layout view="lHh Lpr lFf">
                                  <q-header elevated class="bg-primary text-white">
                                    <q-toolbar>
                                      <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
                                      <q-toolbar-title>
                                        Mapa del Delito
                                      </q-toolbar-title>
                                      <q-space />
                                      <div v-if="route.path === '/'" class="row items-center no-wrap q-gutter-xs">
                                        <q-btn-dropdown flat dense icon="tune" label="Herramientas" class="q-ml-xs">
                                          <q-list>
                                            <q-item clickable v-close-popup @click="abrirModalAño">
                                              <q-item-section avatar>
                                                <q-icon color="primary" name="event" />
                                              </q-item-section>
                                              <q-item-section>
                                                <q-item-label>Cambiar año</q-item-label>
                                                <q-item-label caption>Selecciona el año a visualizar</q-item-label>
                                              </q-item-section>
                                            </q-item>
                                            <q-separator />
                                            <q-item clickable v-close-popup @click="imprimirMapa">
                                              <q-item-section avatar>
                                                <q-icon color="accent" name="print" />
                                              </q-item-section>
                                              <q-item-section>
                                                <q-item-label>Imprimir Mapa</q-item-label>
                                                <q-item-label caption>Imprime el mapa completo</q-item-label>
                                              </q-item-section>
                                            </q-item>
                                          </q-list>
                                        </q-btn-dropdown>
                                      </div>

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
                                      <q-card class="filter-card" bordered>
                                        <q-card-section class="q-pa-md">
                                          <div class="row items-center q-col-gutter-md">
                                            <!-- Selector de fecha de inicio -->
                                            <div class="col-12 col-sm-auto">
                                              <DatePicker v-model="fechaInicio" mode="date" is24hr>
                                                <template v-slot="{ togglePopover }">
                                                  <q-input outlined v-model="fechaInicioInput"
                                                    @update:model-value="onFechaInicioInput" dense
                                                    label="Fecha de inicio" style="min-width: 160px" class="date-input"
                                                    mask="##/##/####" placeholder="DD/MM/AAAA">
                                                    <template v-slot:append>
                                                      <q-icon name="event" class="cursor-pointer" color="primary"
                                                        @click="togglePopover" />
                                                    </template>
                                                  </q-input>
                                                </template>
                                              </DatePicker>
                                            </div>

                                            <!-- Separador visual -->
                                            <div class="col-auto gt-xs">
                                              <q-icon name="arrow_forward" color="grey-6" size="sm" />
                                            </div>

                                            <!-- Selector de fecha de fin -->
                                            <div class="col-12 col-sm-auto">
                                              <DatePicker v-model="fechaFin" mode="date" is24hr>
                                                <template v-slot="{ togglePopover }">
                                                  <q-input outlined v-model="fechaFinInput"
                                                    @update:model-value="onFechaFinInput" dense label="Fecha de fin"
                                                    style="min-width: 160px" class="date-input" mask="##/##/####"
                                                    placeholder="DD/MM/AAAA">
                                                    <template v-slot:append>
                                                      <q-icon name="event" class="cursor-pointer" color="primary"
                                                        @click="togglePopover" />
                                                    </template>
                                                  </q-input>
                                                </template>
                                              </DatePicker>
                                            </div>

                                            <!-- Separador vertical -->
                                            <div class="col-auto gt-xs">
                                              <q-separator vertical inset class="separator-vertical" />
                                            </div>

                                            <!-- Botones de acción -->
                                            <div class="col-12 col-sm-auto">
                                              <div class="row q-gutter-sm justify-center">
                                                <q-btn unelevated color="primary" icon="search" label="Buscar"
                                                  @click="buscarPorFecha" class="action-btn" />
                                                <q-btn unelevated color="secondary" icon="visibility" label="Todos"
                                                  @click="mostrarTodos" class="action-btn" />
                                                <q-btn outline color="grey-7" icon="clear" label="Limpiar"
                                                  @click="limpiarFiltro" class="action-btn" />
                                              </div>
                                            </div>
                                          </div>

                                          <!-- Mensaje de filtro activo -->
                                          <div v-if="mensajeFiltroActivo" class="q-mt-sm">
                                            <q-banner dense rounded class="bg-info text-white">
                                              <template v-slot:avatar>
                                                <q-icon name="filter_alt" color="white" />
                                              </template>
                                              {{ mensajeFiltroActivo }}
                                            </q-banner>
                                          </div>

                                          <!-- Expansion para filtros avanzados -->
                                          <q-expansion-item v-model="filtrosAvanzadosExpanded" icon="filter_list"
                                            label="Filtros Avanzados" dense header-class="text-primary text-caption"
                                            class="q-mt-sm expansion-compact">
                                            <q-card flat bordered class="q-mt-xs">
                                              <q-card-section class="q-pa-sm">
                                                <div class="row q-col-gutter-sm">
                                                  <!-- Selector múltiple de imputados -->
                                                  <div class="col-12">
                                                    <q-select v-model="imputadosSeleccionados"
                                                      :options="opcionesImputadosFiltradas" option-label="nombre"
                                                      option-value="id" multiple outlined dense use-chips stack-label
                                                      label="Seleccionar Imputados"
                                                      hint="Selecciona uno o varios imputados" class="imputados-select"
                                                      use-input input-debounce="0" @filter="filtrarImputados"
                                                      fill-input>
                                                      <template
                                                        v-slot:option="{ itemProps, opt, selected, toggleOption }">
                                                        <q-item v-bind="itemProps" dense>
                                                          <q-item-section side>
                                                            <q-checkbox :model-value="selected"
                                                              @update:model-value="toggleOption(opt)" size="xs" />
                                                          </q-item-section>
                                                          <q-item-section>
                                                            <q-item-label class="text-caption">{{ opt.nombre
                                                            }}</q-item-label>
                                                            <q-item-label caption v-if="opt.dni"
                                                              class="text-caption">DNI: {{ opt.dni }}</q-item-label>
                                                          </q-item-section>
                                                        </q-item>
                                                      </template>
                                                      <template v-slot:selected-item="scope">
                                                        <q-chip removable dense size="sm"
                                                          @remove="scope.removeAtIndex(scope.index)"
                                                          :tabindex="scope.tabindex" color="primary" text-color="white"
                                                          class="q-ma-xs">
                                                          {{ scope.opt.nombre }}
                                                        </q-chip>
                                                      </template>
                                                    </q-select>
                                                  </div>

                                                  <!-- Botones de acción para filtro de imputados -->
                                                  <div class="col-12">
                                                    <div class="row q-gutter-xs justify-end">
                                                      <q-btn unelevated color="primary" icon="filter_alt"
                                                        label="Aplicar" size="sm" @click="filtrarPorImputados"
                                                        :disable="imputadosSeleccionados.length === 0"
                                                        class="action-btn-sm" />
                                                      <q-btn outline color="grey-7" icon="clear" label="Limpiar"
                                                        size="sm" @click="limpiarImputados" class="action-btn-sm" />
                                                    </div>
                                                  </div>
                                                </div>
                                              </q-card-section>
                                            </q-card>
                                          </q-expansion-item>
                                        </q-card-section>
                                      </q-card>
                                    </div>

                                    <!-- Modal para cambiar año -->
                                    <q-dialog v-model="dialogAño">
                                      <q-card class="year-dialog-card">
                                        <q-card-section class="row items-center q-gutter-sm">
                                          <q-icon name="event" color="primary" size="sm" />
                                          <div class="text-h6 q-mb-none">Seleccionar año</div>
                                        </q-card-section>
                                        <q-separator />
                                        <q-card-section>
                                          <q-select v-model="añoModal" outlined :options="opcionesAño" emit-value
                                            map-options label="Año" class="year-select-modal"
                                            popup-content-class="year-select-popup" />
                                        </q-card-section>
                                        <q-card-actions align="right">
                                          <q-btn flat label="Cancelar" color="primary" v-close-popup />
                                          <q-btn unelevated color="primary" label="Aplicar"
                                            @click="aplicarAñoSeleccionado" />
                                        </q-card-actions>
                                      </q-card>
                                    </q-dialog>
                                  </q-page-container>
                                </q-layout>
                              </template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
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
const fechaInicio = ref<Date | null>(null);
const fechaFin = ref<Date | null>(null);
const fechaInicioInput = ref('');
const fechaFinInput = ref('');
const añoSeleccionadoLocal = ref<number>(gisStore.añoSeleccionado);
const dialogAño = ref(false);
const añoModal = ref<number>(gisStore.añoSeleccionado);
const filtrosAvanzadosExpanded = ref(false);
const imputadosSeleccionados = ref<Array<{ id: number; nombre: string; dni: string | null }>>([]);
const mensajeFiltroActivo = ref('');
const opcionesImputadosFiltradas = ref<Array<{ id: number; nombre: string; dni: string | null }>>([]);

// Computed para obtener la lista de imputados únicos
const listaImputados = computed(() => gisStore.obtenerImputadosUnicos());

// Inicializar opciones filtradas
opcionesImputadosFiltradas.value = listaImputados.value;

// Función para filtrar imputados mientras se escribe
const filtrarImputados = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === '') {
      opcionesImputadosFiltradas.value = listaImputados.value;
    } else {
      const needle = val.toLowerCase();
      opcionesImputadosFiltradas.value = listaImputados.value.filter(
        v => v.nombre.toLowerCase().indexOf(needle) > -1 ||
          (v.dni && v.dni.toLowerCase().indexOf(needle) > -1)
      );
    }
  });
};

// Definir años manualmente (puedes editar este array según necesites)
const añosDisponibles = [2026, 2025];

const opcionesAño = computed(() =>
  añosDisponibles.map((year) => ({ label: year.toString(), value: year }))
);

watch(
  () => gisStore.añoSeleccionado,
  (nuevo) => {
    añoSeleccionadoLocal.value = nuevo;
  }
);

// Sincronizar el input cuando cambia la fecha del picker
watch(fechaInicio, (newDate) => {
  if (newDate) {
    const day = String(newDate.getDate()).padStart(2, '0');
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const year = newDate.getFullYear();
    fechaInicioInput.value = `${day}/${month}/${year}`;
  }
});

watch(fechaFin, (newDate) => {
  if (newDate) {
    const day = String(newDate.getDate()).padStart(2, '0');
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const year = newDate.getFullYear();
    fechaFinInput.value = `${day}/${month}/${year}`;
  }
});

const parseFechaManual = (fechaStr: string): Date | null => {
  if (!fechaStr || fechaStr.length < 10) return null;
  const [day, month, year] = fechaStr.split('/');
  if (!day || !month || !year) return null;
  const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return isNaN(fecha.getTime()) ? null : fecha;
};

const onFechaInicioInput = (val: string | number | null) => {
  if (typeof val !== 'string') return;
  fechaInicioInput.value = val;
  const fecha = parseFechaManual(val);
  if (fecha) {
    fechaInicio.value = fecha;
  }
};

const onFechaFinInput = (val: string | number | null) => {
  if (typeof val !== 'string') return;
  fechaFinInput.value = val;
  const fecha = parseFechaManual(val);
  if (fecha) {
    fechaFin.value = fecha;
  }
};

onMounted(async () => {
  await gisStore.cargarDatosBase();
  await gisStore.mostrarTodos();
});

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
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
  imputadosSeleccionados.value = [];
  mensajeFiltroActivo.value = '';
  gisStore.limpiarFiltroDeFechas();
  $q.notify({ type: 'info', message: 'Filtro limpiado.' });
};

const abrirModalAño = () => {
  añoModal.value = añoSeleccionadoLocal.value;
  dialogAño.value = true;
};

const aplicarAñoSeleccionado = () => {
  gisStore.añoSeleccionado = añoModal.value;
  añoSeleccionadoLocal.value = añoModal.value;
  fechaInicio.value = null;
  fechaFin.value = null;
  imputadosSeleccionados.value = [];
  mensajeFiltroActivo.value = '';
  filtrosAvanzadosExpanded.value = false;
  gisStore.limpiarFiltroDeFechas();
  dialogAño.value = false;
  $q.notify({ type: 'info', message: `Año ${añoModal.value} seleccionado. Usa los filtros para ver marcadores.` });
};

const mostrarTodos = async () => {
  fechaInicio.value = null;
  fechaFin.value = null;
  await gisStore.mostrarTodos();
  $q.notify({ type: 'positive', message: 'Mostrando todos los marcadores.' });
};

const imprimirMapa = () => {
  // Emitir evento para que el componente del mapa prepare la vista completa
  window.dispatchEvent(new CustomEvent('print-full-map'));
};

const filtrarPorImputados = async () => {
  if (imputadosSeleccionados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecciona al menos un imputado.',
    });
    return;
  }

  const ids = imputadosSeleccionados.value.map((imp) => imp.id);
  await gisStore.filtrarMarcadoresPorImputados(ids);

  // Contraer el expansion
  filtrosAvanzadosExpanded.value = false;

  // Mostrar mensaje de filtro activo
  const nombresImputados = imputadosSeleccionados.value.map(imp => imp.nombre).join(', ');
  mensajeFiltroActivo.value = `Mostrando marcadores de: ${nombresImputados}`;

  $q.notify({
    type: 'positive',
    message: `Filtro aplicado correctamente`,
  });
};

const limpiarImputados = () => {
  imputadosSeleccionados.value = [];
  mensajeFiltroActivo.value = '';
  void mostrarTodos();
  $q.notify({
    type: 'info',
    message: 'Filtro de imputados limpiado.',
  });
};
</script>

<style scoped>
.floating-filter-container {
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  width: 90%;
  max-width: 900px;
}

.filter-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.date-input :deep(.q-field__control) {
  border-radius: 8px;
  background-color: white;
}

.date-input :deep(.q-field__control):hover {
  border-color: var(--q-primary);
}

.separator-vertical {
  height: 40px;
  background-color: rgba(0, 0, 0, 0.12);
}

.action-btn {
  min-width: 100px;
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.imputados-select :deep(.q-field__control) {
  border-radius: 8px;
  background-color: white;
}

.imputados-select :deep(.q-field__control):hover {
  border-color: var(--q-primary);
}

.expansion-compact :deep(.q-item__label) {
  font-size: 0.875rem;
}

.expansion-compact :deep(.q-expansion-item__container) {
  font-size: 0.875rem;
}

.action-btn-sm {
  border-radius: 6px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;
  padding: 4px 12px;
}

.action-btn-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.year-select :deep(.q-field__control) {
  border-radius: 8px;
  background-color: white;
}

.year-select-popup {
  max-height: 200px;
}

.year-select-header :deep(.q-field__control) {
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.year-select-header :deep(.q-field__native),
.year-select-header :deep(.q-field__label) {
  color: white;
}

.year-dialog-card {
  min-width: 300px;
  border-radius: 12px;
}

.year-select-modal :deep(.q-field__control) {
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .floating-filter-container {
    width: 95%;
    top: 60px;
  }

  .action-btn {
    min-width: auto;
    flex: 1;
  }

  .separator-vertical {
    display: none;
  }
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
  .floating-filter-container {
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
