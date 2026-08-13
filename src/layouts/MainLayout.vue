                              <template>
                                <q-layout view="lHh Lpr lFf">
                                  <q-header elevated class="bg-primary text-white">
                                    <q-toolbar>
                                      <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
                                      <q-toolbar-title>
                                        Mapa del Delito
                                      </q-toolbar-title>
                                      <q-space />
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

                                  <!-- Drawer de filtros: flota sobre el mapa sin achicarlo -->
                                  <q-drawer v-if="route.path === '/'" v-model="drawerFiltros" side="right" overlay
                                    :width="340" class="filtros-drawer">
                                    <div class="column full-height">
                                      <div class="filtros-topbar row items-center">
                                        <div class="filtros-titulo">Filtros</div>
                                        <q-space />
                                        <q-btn flat dense round size="sm" icon="close" color="grey-7"
                                          aria-label="Cerrar filtros" @click="drawerFiltros = false" />
                                      </div>

                                      <q-scroll-area class="col">
                                        <div class="filtros-body">
                                          <!-- Filtros aplicados -->
                                          <section v-if="chipsFiltroActivo.length" class="filtros-seccion">
                                            <div class="filtros-label">Aplicados</div>
                                            <div class="filter-chips">
                                              <q-chip v-for="chip in chipsFiltroActivo" :key="chip.key" removable dense
                                                size="sm" outline color="primary" @remove="quitarChip(chip.key)">
                                                {{ chip.label }}
                                              </q-chip>
                                            </div>
                                          </section>

                                          <!-- Año -->
                                          <section class="filtros-seccion">
                                            <div class="filtros-label">Año</div>
                                            <div class="opcion-grid">
                                              <button v-for="opcion in opcionesAñoConTodos" :key="String(opcion.value)"
                                                class="opcion-btn"
                                                :class="{ 'is-active': añoFiltro === opcion.value }"
                                                @click="seleccionarAño(opcion.value)">
                                                {{ opcion.label }}
                                              </button>
                                            </div>
                                          </section>

                                          <!-- Rango de fechas -->
                                          <section class="filtros-seccion">
                                            <div class="filtros-label">Rango de fechas</div>
                                            <DatePicker v-model="fechaInicio" mode="date" is24hr>
                                              <template v-slot="{ togglePopover }">
                                                <q-input outlined dense clearable v-model="fechaInicioInput"
                                                  @update:model-value="onFechaInicioInput" label="Desde"
                                                  class="campo q-mb-sm" mask="##/##/####" placeholder="DD/MM/AAAA">
                                                  <template v-slot:append>
                                                    <q-icon name="event" size="18px" class="cursor-pointer"
                                                      color="grey-6" @click="togglePopover" />
                                                  </template>
                                                </q-input>
                                              </template>
                                            </DatePicker>
                                            <DatePicker v-model="fechaFin" mode="date" is24hr>
                                              <template v-slot="{ togglePopover }">
                                                <q-input outlined dense clearable v-model="fechaFinInput"
                                                  @update:model-value="onFechaFinInput" label="Hasta" class="campo"
                                                  mask="##/##/####" placeholder="DD/MM/AAAA">
                                                  <template v-slot:append>
                                                    <q-icon name="event" size="18px" class="cursor-pointer"
                                                      color="grey-6" @click="togglePopover" />
                                                  </template>
                                                </q-input>
                                              </template>
                                            </DatePicker>
                                          </section>

                                          <!-- Imputados -->
                                          <section class="filtros-seccion">
                                            <div class="filtros-label">Imputados</div>
                                            <q-select v-model="imputadosSeleccionados"
                                              :options="opcionesImputadosFiltradas" option-label="nombre"
                                              option-value="nombre" multiple outlined dense use-chips class="campo"
                                              placeholder="Buscar…" use-input input-debounce="0"
                                              @filter="filtrarImputados">
                                              <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                                                <q-item v-bind="itemProps" dense>
                                                  <q-item-section side>
                                                    <q-checkbox :model-value="selected"
                                                      @update:model-value="toggleOption(opt)" size="xs" />
                                                  </q-item-section>
                                                  <q-item-section>
                                                    <q-item-label class="text-caption">{{ opt.nombre }}</q-item-label>
                                                    <q-item-label caption v-if="opt.dnis && opt.dnis.length"
                                                      class="text-caption">{{ opt.dnis.join(', ') }}</q-item-label>
                                                  </q-item-section>
                                                </q-item>
                                              </template>
                                              <template v-slot:selected-item="scope">
                                                <q-chip removable dense size="sm" outline color="primary"
                                                  @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex">
                                                  {{ scope.opt.nombre }}
                                                </q-chip>
                                              </template>
                                              <template v-slot:no-option>
                                                <q-item>
                                                  <q-item-section class="text-grey text-caption">
                                                    Sin resultados
                                                  </q-item-section>
                                                </q-item>
                                              </template>
                                            </q-select>
                                          </section>

                                          <!-- Tipo de delito -->
                                          <section class="filtros-seccion">
                                            <div class="filtros-label">Tipo de delito</div>
                                            <q-select v-model="delitosSeleccionados" :options="opcionesDelito" multiple
                                              outlined dense use-chips class="campo">
                                              <template v-slot:selected-item="scope">
                                                <q-chip removable dense size="sm" outline color="primary"
                                                  @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex">
                                                  {{ scope.opt }}
                                                </q-chip>
                                              </template>
                                              <template v-slot:no-option>
                                                <q-item>
                                                  <q-item-section class="text-grey text-caption">
                                                    Sin delitos cargados
                                                  </q-item-section>
                                                </q-item>
                                              </template>
                                            </q-select>
                                          </section>

                                          <!-- Barrio -->
                                          <section class="filtros-seccion">
                                            <div class="filtros-label">Barrio</div>
                                            <q-select v-model="barriosSeleccionados" :options="opcionesBarrio" multiple
                                              outlined dense use-chips class="campo">
                                              <template v-slot:selected-item="scope">
                                                <q-chip removable dense size="sm" outline color="primary"
                                                  @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex">
                                                  {{ scope.opt }}
                                                </q-chip>
                                              </template>
                                              <template v-slot:no-option>
                                                <q-item>
                                                  <q-item-section class="text-grey text-caption">
                                                    Sin barrios cargados
                                                  </q-item-section>
                                                </q-item>
                                              </template>
                                            </q-select>
                                          </section>

                                          <!-- Estado de causa -->
                                          <section class="filtros-seccion">
                                            <div class="filtros-label">Estado de causa</div>
                                            <div class="opcion-grid">
                                              <button v-for="opcion in opcionesEstadoCausa" :key="String(opcion.value)"
                                                class="opcion-btn"
                                                :class="{ 'is-active': estadoCausaFiltro === opcion.value }"
                                                @click="estadoCausaFiltro = opcion.value">
                                                {{ opcion.label }}
                                              </button>
                                            </div>
                                          </section>
                                        </div>
                                      </q-scroll-area>

                                      <div class="filtros-footer">
                                        <q-btn class="full-width" unelevated no-caps color="primary"
                                          label="Aplicar filtros" @click="aplicarFiltros()" />
                                        <div class="row items-center justify-between q-mt-sm">
                                          <q-btn flat dense no-caps size="sm" color="grey-7" label="Limpiar todo"
                                            @click="limpiarFiltro()" />
                                          <q-btn flat dense no-caps size="sm" color="grey-7" icon="print"
                                            label="Imprimir mapa" @click="imprimirMapa" />
                                        </div>
                                      </div>
                                    </div>
                                  </q-drawer>

                                  <q-page-container>
                                    <router-view />

                                    <!-- Pestaña anclada al borde: acceso permanente a los filtros -->
                                    <button v-if="route.path === '/'" class="filtros-handle"
                                      :class="{ 'is-hidden': drawerFiltros }" aria-label="Abrir filtros"
                                      @click="drawerFiltros = true">
                                      <q-icon name="tune" size="19px" />
                                      <span class="filtros-handle__text">Filtros</span>
                                      <span v-if="cantidadFiltrosActivos" class="filtros-handle__badge">
                                        {{ cantidadFiltrosActivos }}
                                      </span>
                                    </button>

                                  </q-page-container>
                                </q-layout>
                              </template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import { useGisStore, EstadoCausa } from 'src/stores/gisStore';
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
const añoFiltro = ref<number | null>(null);

// Drawer de filtros (derecha). Arranca cerrado: el mapa se ve completo.
const drawerFiltros = ref(false);

type Imputado = { id: number; nombre: string; dni: string | null };
type ImputadoGrupo = { nombre: string; ids: number[]; dnis: string[] };

const imputadosSeleccionados = ref<Array<ImputadoGrupo>>([]);
const opcionesImputadosFiltradas = ref<Array<ImputadoGrupo>>([]);
const delitosSeleccionados = ref<string[]>([]);
const barriosSeleccionados = ref<string[]>([]);
const estadoCausaFiltro = ref<EstadoCausa | null>(null);

// Filtros efectivamente aplicados al mapa (distinto de lo que hay tipeado en el
// formulario). Es la fuente de verdad de los chips y del contador del header.
type FiltrosAplicados = {
  rango: { inicio: Date; fin: Date } | null;
  anio: number | null;
  imputados: ImputadoGrupo[];
  delitos: string[];
  barrios: string[];
  estado: EstadoCausa | null;
};
const SIN_FILTROS: FiltrosAplicados = {
  rango: null,
  anio: null,
  imputados: [],
  delitos: [],
  barrios: [],
  estado: null,
};
const filtrosAplicados = ref<FiltrosAplicados>({ ...SIN_FILTROS });

// Computed para obtener la lista de imputados únicos
const listaImputados = computed<Imputado[]>(() => gisStore.obtenerImputadosUnicos());

// Agrupar imputados por nombre para que aparezcan como una sola opción
const opcionesImputadosAgrupadas = computed<ImputadoGrupo[]>(() => {
  const map = new Map<string, { ids: number[]; dnis: string[] }>();
  for (const imp of listaImputados.value) {
    const key = (imp.nombre || '').trim();
    if (!map.has(key)) {
      map.set(key, { ids: [], dnis: [] });
    }
    const entry = map.get(key)!;
    entry.ids.push(imp.id);
    if (imp.dni) entry.dnis.push(imp.dni);
  }
  return Array.from(map.entries()).map(([nombre, { ids, dnis }]) => ({ nombre, ids, dnis }));
});

// Inicializar opciones filtradas con la lista agrupada
opcionesImputadosFiltradas.value = opcionesImputadosAgrupadas.value;

// Mantener sincronizadas las opciones filtradas cuando cambie la fuente
watch(opcionesImputadosAgrupadas, (nuevas) => {
  opcionesImputadosFiltradas.value = nuevas;
});

// Función para filtrar imputados mientras se escribe (sobre la lista agrupada)
const filtrarImputados = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === '') {
      opcionesImputadosFiltradas.value = opcionesImputadosAgrupadas.value;
    } else {
      const needle = val.toLowerCase();
      opcionesImputadosFiltradas.value = opcionesImputadosAgrupadas.value.filter((v) =>
        v.nombre.toLowerCase().includes(needle) || v.dnis.some((dni) => dni.toLowerCase().includes(needle))
      );
    }
  });
};

// Barrios presentes en los datos cargados
const opcionesBarrio = computed(() => {
  const set = new Set<string>();
  gisStore.allMarcadores.forEach((marcador) => {
    const barrio = marcador.barrio?.trim();
    if (barrio) set.add(barrio);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

// Tipos de delito presentes en los datos cargados
const opcionesDelito = computed(() => {
  const set = new Set<string>();
  gisStore.allMarcadores.forEach((marcador) => {
    marcador.delitos?.forEach((delito) => {
      const tipo = delito.tipoDelito?.trim();
      if (tipo) set.add(tipo);
    });
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

const opcionesEstadoCausa = [
  { label: 'Todos', value: null },
  { label: 'Esclarecido', value: EstadoCausa.ESCLARECIDO },
  { label: 'No esclarecido', value: EstadoCausa.NO_ESCLARECIDO },
];

const etiquetaEstadoCausa = (estado: EstadoCausa) =>
  estado === EstadoCausa.ESCLARECIDO ? 'Esclarecido' : 'No esclarecido';

// Definir años manualmente (puedes editar este array según necesites)
const añosDisponibles = [2026, 2025, 2024];

// Año que queda aplicado al entrar al mapa
const AÑO_POR_DEFECTO = 2026;

const opcionesAñoConTodos = computed(() => [
  { label: 'Todos', value: null },
  ...añosDisponibles.map((year) => ({ label: year.toString(), value: year }))
]);

const formatearFecha = (fecha: Date) => {
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${fecha.getFullYear()}`;
};

// Sincronizar el input cuando cambia la fecha del picker
watch(fechaInicio, (newDate) => {
  fechaInicioInput.value = newDate ? formatearFecha(newDate) : '';
});

watch(fechaFin, (newDate) => {
  fechaFinInput.value = newDate ? formatearFecha(newDate) : '';
});

// Chips de los filtros aplicados, con la clave que usa quitarChip() para sacarlos
const chipsFiltroActivo = computed(() => {
  const chips: Array<{ key: string; label: string; icon: string }> = [];
  const { rango, anio, imputados, delitos, barrios, estado } = filtrosAplicados.value;

  if (rango) {
    chips.push({
      key: 'rango',
      label: `${formatearFecha(rango.inicio)} → ${formatearFecha(rango.fin)}`,
      icon: 'date_range',
    });
  }
  if (anio !== null) {
    chips.push({ key: 'anio', label: `Año ${anio}`, icon: 'event' });
  }
  imputados.forEach((imp) => {
    chips.push({ key: `imputado:${imp.nombre}`, label: imp.nombre, icon: 'person' });
  });
  delitos.forEach((delito) => {
    chips.push({ key: `delito:${delito}`, label: delito, icon: 'gavel' });
  });
  barrios.forEach((barrio) => {
    chips.push({ key: `barrio:${barrio}`, label: barrio, icon: 'place' });
  });
  if (estado !== null) {
    chips.push({ key: 'estado', label: etiquetaEstadoCausa(estado), icon: 'fact_check' });
  }

  return chips;
});

// Alimenta el badge del botón "Filtros" del header
const cantidadFiltrosActivos = computed(() => chipsFiltroActivo.value.length);

const parseFechaManual = (fechaStr: string): Date | null => {
  if (!fechaStr || fechaStr.length < 8) return null;
  if (fechaStr.includes('-')) {
    const [year, month, day] = fechaStr.split('-');
    if (!day || !month || !year) return null;
    const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(fecha.getTime()) ? null : fecha;
  }
  const [day, month, year] = fechaStr.split('/');
  if (!day || !month || !year) return null;
  const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return isNaN(fecha.getTime()) ? null : fecha;
};

const onFechaInicioInput = (val: string | number | null) => {
  // El botón de limpiar del q-input emite null
  if (val === null || val === '') {
    fechaInicioInput.value = '';
    fechaInicio.value = null;
    return;
  }
  if (typeof val !== 'string') return;
  fechaInicioInput.value = val;
  const fecha = parseFechaManual(val);
  if (fecha) {
    fechaInicio.value = fecha;
  }
};

const onFechaFinInput = (val: string | number | null) => {
  if (val === null || val === '') {
    fechaFinInput.value = '';
    fechaFin.value = null;
    return;
  }
  if (typeof val !== 'string') return;
  fechaFinInput.value = val;
  const fecha = parseFechaManual(val);
  if (fecha) {
    fechaFin.value = fecha;
  }
};

onMounted(async () => {
  await gisStore.cargarDatosBase();

  // Arrancar con el año por defecto ya aplicado (sin aviso: no es una acción del usuario)
  añoFiltro.value = AÑO_POR_DEFECTO;
  gisStore.añoSeleccionado = AÑO_POR_DEFECTO;
  await gisStore.filtrarMarcadoresPorAño(AÑO_POR_DEFECTO);
  filtrosAplicados.value = { ...SIN_FILTROS, anio: AÑO_POR_DEFECTO };
});

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleLogout = () => {
  authStore.logout();
  void router.push('/login');
};

// Aplica en una sola pasada todos los criterios activos (rango de fechas, año e
// imputados). Antes había dos botones "Aplicar" separados que se pisaban entre sí.
const aplicarFiltros = async (cerrarPanel = true) => {
  if (!fechaInicio.value && fechaInicioInput.value) {
    fechaInicio.value = parseFechaManual(fechaInicioInput.value);
  }
  if (!fechaFin.value && fechaFinInput.value) {
    fechaFin.value = parseFechaManual(fechaFinInput.value);
  }

  const inicio = fechaInicio.value;
  const fin = fechaFin.value;
  const imputados = imputadosSeleccionados.value;
  const anio = añoFiltro.value;
  const delitos = delitosSeleccionados.value;
  const barrios = barriosSeleccionados.value;
  const estado = estadoCausaFiltro.value;

  if ((inicio && !fin) || (!inicio && fin)) {
    $q.notify({ type: 'warning', message: 'Completá la fecha de inicio y la de fin.' });
    return;
  }
  if (inicio && fin && inicio > fin) {
    $q.notify({
      type: 'negative',
      message: 'La fecha de inicio no puede ser posterior a la fecha de fin.',
    });
    return;
  }

  const hayCriterios =
    (!!inicio && !!fin) ||
    anio !== null ||
    imputados.length > 0 ||
    delitos.length > 0 ||
    barrios.length > 0 ||
    estado !== null;

  if (!hayCriterios) {
    $q.notify({ type: 'warning', message: 'Elegí al menos un filtro antes de aplicar.' });
    return;
  }

  await gisStore.cargarDatosBase();

  const desde = inicio ? new Date(inicio) : null;
  const hasta = fin ? new Date(fin) : null;
  desde?.setHours(0, 0, 0, 0);
  hasta?.setHours(23, 59, 59, 999); // incluir el día completo de la fecha de fin

  const ids = new Set(imputados.flatMap((imp) => imp.ids));
  const setDelitos = new Set(delitos);
  const setBarrios = new Set(barrios);

  gisStore.marcadores = gisStore.allMarcadores.filter((marcador) => {
    const fecha = marcador.fecha_inicio ? new Date(marcador.fecha_inicio) : null;

    if (desde && hasta) {
      if (!fecha || fecha < desde || fecha > hasta) return false;
    }
    if (anio !== null) {
      if (!fecha || fecha.getFullYear() !== anio) return false;
    }
    if (ids.size > 0) {
      if (!marcador.delincuentes || marcador.delincuentes.length === 0) return false;
      if (!marcador.delincuentes.some((d) => d.id && ids.has(d.id))) return false;
    }
    if (setDelitos.size > 0) {
      if (!marcador.delitos || marcador.delitos.length === 0) return false;
      const coincide = marcador.delitos.some((d) => {
        const tipo = d.tipoDelito?.trim();
        return !!tipo && setDelitos.has(tipo);
      });
      if (!coincide) return false;
    }
    if (setBarrios.size > 0) {
      const barrio = marcador.barrio?.trim();
      if (!barrio || !setBarrios.has(barrio)) return false;
    }
    if (estado !== null) {
      if (marcador.estado_causa !== estado) return false;
    }
    return true;
  });
  gisStore.cerrarInfo();

  if (anio !== null) {
    gisStore.añoSeleccionado = anio;
  }

  filtrosAplicados.value = {
    rango: desde && hasta ? { inicio: new Date(desde), fin: new Date(hasta) } : null,
    anio,
    imputados: [...imputados],
    delitos: [...delitos],
    barrios: [...barrios],
    estado,
  };

  if (cerrarPanel) {
    drawerFiltros.value = false;
  }

  const total = gisStore.marcadores.length;
  $q.notify({
    type: total > 0 ? 'positive' : 'warning',
    message: total > 0
      ? `Filtro aplicado · ${total} marcador${total === 1 ? '' : 'es'}.`
      : 'Ningún marcador coincide con el filtro.',
  });
};

// El año se aplica al instante, sin cerrar el drawer: así se ve el cambio en el
// mapa y se puede seguir afinando el resto de los filtros.
const seleccionarAño = async (valor: number | null) => {
  añoFiltro.value = valor;

  const hayOtrosCriterios =
    (!!fechaInicio.value && !!fechaFin.value) ||
    imputadosSeleccionados.value.length > 0 ||
    delitosSeleccionados.value.length > 0 ||
    barriosSeleccionados.value.length > 0 ||
    estadoCausaFiltro.value !== null;

  // "Todos" sin ningún otro criterio: mostrar el total, sin restringir por año
  if (valor === null && !hayOtrosCriterios) {
    await gisStore.cargarDatosBase();
    gisStore.marcadores = [...gisStore.allMarcadores];
    gisStore.cerrarInfo();
    filtrosAplicados.value = { ...SIN_FILTROS };
    $q.notify({
      type: 'positive',
      message: `Mostrando los ${gisStore.marcadores.length} marcadores de todos los años.`,
    });
    return;
  }

  await aplicarFiltros(false);
};

// Quita un criterio desde su chip y vuelve a aplicar lo que quede
const quitarChip = async (key: string) => {
  if (key === 'rango') {
    fechaInicio.value = null;
    fechaFin.value = null;
  } else if (key === 'anio') {
    añoFiltro.value = null;
  } else if (key === 'estado') {
    estadoCausaFiltro.value = null;
  } else if (key.startsWith('imputado:')) {
    const nombre = key.slice('imputado:'.length);
    imputadosSeleccionados.value = imputadosSeleccionados.value.filter(
      (imp) => imp.nombre !== nombre
    );
  } else if (key.startsWith('delito:')) {
    const tipo = key.slice('delito:'.length);
    delitosSeleccionados.value = delitosSeleccionados.value.filter((d) => d !== tipo);
  } else if (key.startsWith('barrio:')) {
    const barrio = key.slice('barrio:'.length);
    barriosSeleccionados.value = barriosSeleccionados.value.filter((b) => b !== barrio);
  }

  const quedanFiltros =
    (!!fechaInicio.value && !!fechaFin.value) ||
    añoFiltro.value !== null ||
    imputadosSeleccionados.value.length > 0 ||
    delitosSeleccionados.value.length > 0 ||
    barriosSeleccionados.value.length > 0 ||
    estadoCausaFiltro.value !== null;

  if (quedanFiltros) {
    await aplicarFiltros();
    return;
  }
  limpiarFiltro(false);
};

const limpiarFormulario = () => {
  fechaInicio.value = null;
  fechaFin.value = null;
  fechaInicioInput.value = '';
  fechaFinInput.value = '';
  imputadosSeleccionados.value = [];
  delitosSeleccionados.value = [];
  barriosSeleccionados.value = [];
  estadoCausaFiltro.value = null;
  añoFiltro.value = null;
};

const limpiarFiltro = (notificar = true) => {
  limpiarFormulario();
  filtrosAplicados.value = { ...SIN_FILTROS };
  gisStore.limpiarFiltroDeFechas();
  if (notificar) {
    $q.notify({ type: 'info', message: 'Filtros limpiados.' });
  }
};

const imprimirMapa = () => {
  // Cerrar el drawer para que no quede tapando al preparar la impresión
  drawerFiltros.value = false;
  // Emitir evento para que el componente del mapa prepare la vista completa
  window.dispatchEvent(new CustomEvent('print-full-map'));
};

</script>

<style scoped>
/* ── Pestaña de acceso, anclada al borde derecho del mapa ── */
.filtros-handle {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 9px;
  background: #fff;
  color: #475569;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-right: none;
  border-radius: 10px 0 0 10px;
  box-shadow: -2px 0 14px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition: color 0.2s ease, padding 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
}

.filtros-handle:hover {
  color: var(--q-primary);
  padding-right: 13px;
}

.filtros-handle.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%) translateX(100%);
}

.filtros-handle__text {
  writing-mode: vertical-rl;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.filtros-handle__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--q-primary);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
}

/* ── Drawer ── */
.filtros-drawer {
  box-shadow: -4px 0 24px rgba(15, 23, 42, 0.1);
}

.filtros-topbar {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.07);
}

.filtros-titulo {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.filtros-body {
  padding: 4px 16px 16px;
}

.filtros-seccion {
  padding: 16px 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.filtros-seccion:last-child {
  border-bottom: none;
}

.filtros-label {
  margin-bottom: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #94a3b8;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* ── Botones de opción (año y estado de causa) ── */
.opcion-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.opcion-btn {
  padding: 7px 4px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.opcion-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.opcion-btn.is-active {
  background: var(--q-primary);
  color: #fff;
}

.opcion-btn.is-active:hover {
  background: #1565c0;
}

/* ── Campos ── */
.campo :deep(.q-field__control) {
  border-radius: 8px;
}

.campo :deep(.q-field__control):hover {
  border-color: var(--q-primary);
}

/* ── Pie fijo ── */
.filtros-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(15, 23, 42, 0.07);
  background: #fff;
}

@media (max-width: 599px) {
  .filtros-handle {
    padding: 12px 7px;
  }

  .filtros-handle__text {
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

  /* Ocultar header y drawers (menú y filtros) */
  .q-header,
  .q-drawer,
  .q-drawer__backdrop {
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
