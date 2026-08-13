// src/pages/MapVue.vue
<template>
  <q-page class="absolute-full no-scroll">
    <div ref="mapContainer" class="fit"></div>

    <div v-if="tooltipVisible" class="tooltip-marcador" :style="{
      left: tooltipPosition.x + 'px',
      top: tooltipPosition.y + 'px',
    }">
      {{ tooltipContent }}
    </div>

    <!-- Ficha del marcador seleccionado -->
    <div v-if="marcador" class="info-panel">
      <header class="ficha-header">
        <div class="ficha-avatar">{{ iniciales }}</div>
        <div class="ficha-header__texto">
          <div class="ficha-nombre">{{ marcador.nombre }} {{ marcador.apellido }}</div>
          <div class="ficha-dni">DNI {{ marcador.dni || '—' }}</div>
        </div>
        <q-btn flat dense round size="sm" icon="close" color="white" aria-label="Cerrar ficha"
          @click="gisStore.cerrarInfo" />
      </header>

      <div class="ficha-body">
        <span v-if="marcador.estado_causa" class="estado-badge"
          :class="marcador.estado_causa === EstadoCausa.ESCLARECIDO ? 'is-esclarecido' : 'is-pendiente'">
          <i class="estado-dot"></i>
          {{ marcador.estado_causa === EstadoCausa.ESCLARECIDO ? 'Esclarecido' : 'No esclarecido' }}
        </span>

        <!-- Datos del hecho -->
        <div class="dato-grid">
          <div class="dato">
            <q-icon name="event_available" size="16px" class="dato__icono is-azul" />
            <div class="dato__texto">
              <div class="dato__label">Fecha de inicio</div>
              <div class="dato__valor">{{ formatDisplayDate(marcador.fecha_inicio) }}</div>
            </div>
          </div>
          <div v-if="marcador.fecha_fin" class="dato">
            <q-icon name="event_busy" size="16px" class="dato__icono is-azul" />
            <div class="dato__texto">
              <div class="dato__label">Fecha de fin</div>
              <div class="dato__valor">{{ formatDisplayDate(marcador.fecha_fin) }}</div>
            </div>
          </div>
          <div class="dato dato--full">
            <q-icon name="place" size="16px" class="dato__icono is-rosa" />
            <div class="dato__texto">
              <div class="dato__label">Dirección</div>
              <div class="dato__valor">{{ marcador.direccion || '—' }}</div>
            </div>
          </div>
          <div class="dato">
            <q-icon name="location_city" size="16px" class="dato__icono is-violeta" />
            <div class="dato__texto">
              <div class="dato__label">Barrio</div>
              <div class="dato__valor">{{ marcador.barrio || '—' }}</div>
            </div>
          </div>
          <div class="dato">
            <q-icon name="phone" size="16px" class="dato__icono is-verde" />
            <div class="dato__texto">
              <div class="dato__label">Teléfono</div>
              <div class="dato__valor">{{ marcador.telefono || '—' }}</div>
            </div>
          </div>
          <div class="dato">
            <q-icon name="description" size="16px" class="dato__icono is-ambar" />
            <div class="dato__texto">
              <div class="dato__label">N.° de IPP</div>
              <div class="dato__valor">{{ marcador.numero_denuncia || '—' }}</div>
            </div>
          </div>
          <div class="dato">
            <q-icon name="balance" size="16px" class="dato__icono is-teal" />
            <div class="dato__texto">
              <div class="dato__label">Fiscal</div>
              <div class="dato__valor">{{ marcador.fiscal || '—' }}</div>
            </div>
          </div>
        </div>

        <!-- Delitos -->
        <section v-if="marcador.delitos && marcador.delitos.length" class="ficha-seccion">
          <div class="ficha-label is-rosa">
            <q-icon name="warning" size="14px" />
            Delitos <span class="ficha-count is-rosa">{{ marcador.delitos.length }}</span>
          </div>
          <ul class="lista">
            <li v-for="(delito, index) in marcador.delitos" :key="index"
              class="lista__item lista__item--delito">
              <div class="lista__titulo">{{ delito.tipoDelito || 'Sin tipificar' }}</div>
              <div class="lista__meta">
                Art. {{ delito.articulo || '—' }} · Inc. {{ delito.inciso || '—' }}
              </div>
            </li>
          </ul>
        </section>

        <!-- Imputados -->
        <section v-if="marcador.delincuentes && marcador.delincuentes.length" class="ficha-seccion">
          <div class="ficha-label is-indigo">
            <q-icon name="person_search" size="14px" />
            Imputados <span class="ficha-count is-indigo">{{ marcador.delincuentes.length }}</span>
          </div>
          <ul class="lista">
            <li v-for="(imputado, index) in marcador.delincuentes" :key="index"
              class="lista__item lista__item--imputado">
              <div class="lista__titulo">{{ imputado.nombre || 'Sin nombre' }}</div>
              <div class="lista__meta">DNI {{ imputado.dni || '—' }}</div>
            </li>
          </ul>
        </section>

        <!-- Notas -->
        <section v-if="marcador.notas" class="ficha-seccion">
          <div class="ficha-label is-ambar">
            <q-icon name="sticky_note_2" size="14px" />
            Notas
          </div>
          <p class="ficha-notas">{{ marcador.notas }}</p>
        </section>
      </div>

      <footer v-if="authStore.canPrint || authStore.canEdit || authStore.canDelete" class="ficha-footer">
        <q-btn v-if="authStore.canPrint" unelevated no-caps icon="print" class="app-btn app-btn--neutro"
          aria-label="Imprimir ficha" @click="imprimirCard">
          <q-tooltip>Imprimir ficha</q-tooltip>
        </q-btn>
        <q-space />
        <q-btn v-if="authStore.canDelete" unelevated no-caps icon="delete" label="Eliminar"
          class="app-btn app-btn--peligro" @click="confirmarEliminar" />
        <q-btn v-if="authStore.canEdit" unelevated no-caps icon="edit" label="Editar"
          class="app-btn app-btn--principal" @click="abrirModalEdicion" />
      </footer>
    </div>
    <q-drawer v-model="modalVisible" side="right" overlay :width="400" class="form-drawer">
      <div class="column full-height">
        <div class="form-topbar row items-center">
          <div class="form-titulo">
            {{ isEditing ? 'Editar marcador' : 'Agregar marcador' }}
          </div>
          <q-space />
          <q-btn flat dense round size="sm" icon="close" color="grey-7" aria-label="Cerrar"
            @click="cerrarModal" />
        </div>

        <q-scroll-area class="col">
          <div class="form-body">
            <!-- Datos de la persona -->
            <section class="form-seccion">
              <div class="form-label">Denunciante</div>
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-input v-model="nuevoMarcador.nombre" label="Nombre *" outlined dense class="campo" :rules="[
                    val => !!val || 'El nombre es obligatorio',
                    val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras'
                  ]" lazy-rules />
                </div>
                <div class="col-6">
                  <q-input v-model="nuevoMarcador.apellido" label="Apellido *" outlined dense class="campo" :rules="[
                    val => !!val || 'El apellido es obligatorio',
                    val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras'
                  ]" lazy-rules />
                </div>
                <div class="col-6">
                  <q-input v-model="nuevoMarcador.dni" label="DNI" outlined dense class="campo" type="text"
                    @keypress="(evt: KeyboardEvent) => { if (!/[0-9]/.test(evt.key)) evt.preventDefault(); }" :rules="[
                      val => !val || /^\d+$/.test(val) || 'Solo se permiten números',
                      val => !val || (val.length >= 7 && val.length <= 8) || 'El DNI debe tener 7 u 8 dígitos'
                    ]" lazy-rules />
                </div>
                <div class="col-6">
                  <q-input v-model="nuevoMarcador.telefono" label="Teléfono" outlined dense class="campo" type="text"
                    @keypress="(evt: KeyboardEvent) => { if (!/[0-9]/.test(evt.key)) evt.preventDefault(); }" :rules="[
                      val => !val || /^\d+$/.test(val) || 'Solo se permiten números'
                    ]" lazy-rules />
                </div>
              </div>
            </section>

            <!-- Datos del hecho -->
            <section class="form-seccion">
              <div class="form-label">Hecho</div>
              <q-input v-model="nuevoMarcador.fecha_inicio" label="Fecha *" type="date" outlined dense stack-label
                class="campo q-mb-sm" :rules="[val => !!val || 'La fecha es obligatoria']" lazy-rules />
              <q-input v-model="nuevoMarcador.direccion" label="Dirección del hecho *" outlined dense
                class="campo q-mb-sm" :rules="[val => !!val || 'La dirección es obligatoria']" lazy-rules />
              <q-select v-model="nuevoMarcador.barrio" :options="opcionesBarrios" label="Barrio *" outlined dense
                class="campo q-mb-sm" :rules="[val => !!val || 'El barrio es obligatorio']" lazy-rules />
              <div class="row q-col-gutter-sm q-mb-sm">
                <div class="col-6">
                  <q-input v-model="nuevoMarcador.numero_denuncia" label="N.° de IPP *" outlined dense class="campo"
                    type="text"
                    @keypress="(evt: KeyboardEvent) => { if (!/[0-9]/.test(evt.key)) evt.preventDefault(); }" :rules="[
                      val => !!val || 'El número de IPP es obligatorio',
                      val => /^\d+$/.test(val) || 'Solo se permiten números'
                    ]" lazy-rules />
                </div>
                <div class="col-6">
                  <q-input v-model="nuevoMarcador.fiscal" label="Fiscal" outlined dense class="campo" :rules="[
                    val => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+$/.test(val) || 'Solo se permiten letras'
                  ]" lazy-rules />
                </div>
              </div>
              <q-select v-model="nuevoMarcador.estado_causa" :options="opcionesEstadoCausa"
                label="Estado de la causa *" outlined dense class="campo q-mb-sm"
                :rules="[val => !!val || 'El estado de la causa es obligatorio']" lazy-rules emit-value map-options />
              <q-input v-model="nuevoMarcador.notas" label="Notas" type="textarea" outlined dense class="campo"
                autogrow />
            </section>

            <!-- Delitos -->
            <section class="form-seccion">
              <div class="form-label">
                Delitos <span class="form-count">{{ nuevoMarcador.delitos.length }}</span>
              </div>
              <p v-if="!nuevoMarcador.delitos.length" class="form-vacio">
                Se requiere al menos un delito.
              </p>
              <div v-for="(delito, index) in nuevoMarcador.delitos" :key="index" class="bloque">
                <div class="bloque__head">
                  <span class="bloque__titulo">Delito {{ index + 1 }}</span>
                  <q-btn flat dense round size="xs" icon="close" color="grey-6"
                    :aria-label="`Eliminar delito ${index + 1}`" @click="eliminarDelito(index)" />
                </div>
                <q-select v-model="delito.tipoDelito" :options="tipoDelitoOptions" label="Tipo de delito *" outlined
                  dense class="campo q-mb-sm" @update:model-value="onTipoDelitoChange(delito)"
                  :rules="[val => !!val || 'El tipo de delito es obligatorio']" lazy-rules />
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-select v-model="delito.articulo" :options="articuloOptions" label="Artículo" outlined dense
                      class="campo" @update:model-value="onArticuloChange(delito)" lazy-rules />
                  </div>
                  <div class="col-6">
                    <q-input v-model="delito.inciso" label="Inciso" outlined dense readonly class="campo" />
                  </div>
                </div>
              </div>
              <button class="btn-agregar" @click="agregarDelito">+ Agregar delito</button>
            </section>

            <!-- Imputados -->
            <section class="form-seccion">
              <div class="form-label">
                Imputados <span class="form-count">{{ nuevoMarcador.delincuentes.length }}</span>
              </div>
              <p v-if="!nuevoMarcador.delincuentes.length" class="form-vacio">
                Opcional. Podés asociar imputados existentes o crear uno nuevo.
              </p>
              <div v-for="(imputado, index) in nuevoMarcador.delincuentes" :key="index" class="bloque">
                <div class="bloque__head">
                  <span class="bloque__titulo">{{ imputado.nombre || `Imputado ${index + 1}` }}</span>
                  <q-btn flat dense round size="xs" icon="close" color="grey-6"
                    :aria-label="`Eliminar imputado ${index + 1}`" @click="eliminarImputado(index)" />
                </div>
                <div class="bloque__meta">DNI {{ imputado.dni || '—' }}</div>
              </div>
              <button class="btn-agregar" @click="abrirSelectorImputado">+ Agregar imputado</button>
            </section>
          </div>
        </q-scroll-area>

        <div class="form-footer">
          <q-btn unelevated no-caps label="Cancelar" class="app-btn app-btn--neutro col" @click="cerrarModal" />
          <q-btn unelevated no-caps icon="save" label="Guardar" class="app-btn app-btn--principal col"
            @click="guardarMarcador" />
        </div>
      </div>
    </q-drawer>

    <q-dialog v-model="imputadoSelectorVisible">
      <q-card style="min-width: 360px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Seleccionar imputado</div>
        </q-card-section>

        <q-card-section>
          <div v-if="imputadoOptions.length > 0">
            <q-select v-model="imputadoSeleccionadoId" :options="imputadoOptionsFiltradas" label="Imputados existentes"
              outlined emit-value map-options use-input input-debounce="0" @filter="filtrarImputados" />
          </div>
          <div v-else class="text-body2 text-grey-7">
            No hay imputados registrados. Puedes crear uno nuevo.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Crear nuevo" color="primary" @click="abrirModalNuevoImputado" />
          <q-btn v-if="imputadoOptions.length > 0" unelevated label="Usar seleccionado" color="positive"
            @click="usarImputadoSeleccionado" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="imputadoNuevoVisible">
      <q-card style="min-width: 360px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Nuevo imputado</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="imputadoNuevo.nombre" label="Nombre (Obligatorio)" outlined class="q-mb-sm" :rules="[
            val => !!val || 'El nombre es obligatorio',
            val => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras'
          ]" lazy-rules />
          <q-input v-model="imputadoNuevo.dni" label="DNI" outlined type="text"
            @keypress="(evt: KeyboardEvent) => { if (!/[0-9]/.test(evt.key)) evt.preventDefault(); }" :rules="[
              val => !val || /^\d+$/.test(val) || 'Solo se permiten números',
              val => !val || (val.length >= 7 && val.length <= 8) || 'El DNI debe tener 7 u 8 dígitos'
            ]" lazy-rules />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn unelevated label="Agregar" color="positive" @click="guardarNuevoImputado" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, type Ref } from 'vue';
import { useGisStore, type MarcadorSeg, type Delito, type Delincuente, EstadoCausa } from 'src/stores/gisStore';
import { useAuthStore } from 'src/stores/authStore';
import { useQuasar } from 'quasar';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { fromLonLat, toLonLat } from 'ol/proj';
import type { Geometry } from 'ol/geom';
import { date } from 'quasar';

const $q = useQuasar();
const gisStore = useGisStore();
const authStore = useAuthStore();

// Atajo para la ficha del marcador seleccionado
const marcador = computed(() => gisStore.marcadorSeleccionado);

// Iniciales para el avatar de la ficha
const iniciales = computed(() => {
  const m = marcador.value;
  if (!m) return '';
  const inicial = (texto: string | null) => (texto || '').trim().charAt(0).toUpperCase();
  return `${inicial(m.nombre)}${inicial(m.apellido)}` || '?';
});

const mapContainer = ref<HTMLDivElement | null>(null);
let map: Map | null = null;
const vectorSource = new VectorSource();
const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipPosition = ref({ x: 0, y: 0 });
const modalVisible = ref(false);
const isEditing = ref(false);
const imputadoSelectorVisible = ref(false);
const imputadoNuevoVisible = ref(false);
const imputadoSeleccionadoId = ref<number | null>(null);
const imputadoNuevo = ref<Partial<Delincuente>>({ nombre: '', dni: '' });

// Opciones para el estado de la causa
const opcionesEstadoCausa = [
  { label: 'Esclarecido', value: EstadoCausa.ESCLARECIDO },
  { label: 'No Esclarecido', value: EstadoCausa.NO_ESCLARECIDO }
];

// START: DELITOS DATA AND LOGIC
const delitosOptions = [
  { articulo: '149', inciso: 'BIS', tipoDelito: 'AMENAZAS' },
  { articulo: '162', inciso: '', tipoDelito: 'HURTO' },
  { articulo: '163', inciso: '1', tipoDelito: 'ABIGEATO' },
  { articulo: '164', inciso: '', tipoDelito: 'ROBO' },
  { articulo: '168', inciso: '', tipoDelito: 'EXTORSION' },
  { articulo: '172', inciso: '', tipoDelito: 'ESTAFA' },
  { articulo: '173', inciso: '', tipoDelito: 'DEFRAUDACION' },
  { articulo: '181', inciso: '1', tipoDelito: 'USURPACION' },
  { articulo: '183', inciso: '', tipoDelito: 'DAÑOS' },
  { articulo: '79', inciso: '', tipoDelito: 'HOMICIDIO' },
  { articulo: '89', inciso: '', tipoDelito: 'LESIONES' },
  { articulo: '', inciso: '', tipoDelito: 'AVERIGUACION DE ILICITO' },
  { articulo: '', inciso: '', tipoDelito: 'ENCUBRIMIENTO' },
  { articulo: '', inciso: '', tipoDelito: 'LEY-23727' },
  { articulo: '', inciso: '', tipoDelito: 'DESOBEDIENCIA' },
  { articulo: '', inciso: '', tipoDelito: 'OTRO' },
];

const articuloOptions = delitosOptions.map(d => d.articulo);
const tipoDelitoOptions = delitosOptions.map(d => d.tipoDelito);

// Mapa de iconos por tipo de delito
const iconosPorDelito: Record<string, string> = {
  'AMENAZAS': '/icons/marker-icon-2.png',
  'HURTO': '/icons/marker-icon-4.png',
  'ABIGEATO': '/icons/marker-icon-3.png',
  'ROBO': '/icons/marker-icon.png',
  'EXTORSION': '/icons/marker-icon-5.png',
  'ESTAFA': '/icons/marker-icon-6.png',
  'DEFRAUDACION': '/icons/marker-icon-7.png',
  'USURPACION': '/icons/marker-icon-5.png',
  'DAÑOS': '/icons/marker-icon-2.png',
  'HOMICIDIO': '/icons/marker-icon-3.png',
  'LESIONES': '/icons/marker-icon-6.png',
  'AVERIGUACION DE ILICITO': '/icons/marker-icon-3.png',
  'ENCUBRIMIENTO': '/icons/marker-icon-2.png',
  'LEY-23727': '/icons/marker-icon-2.png',
  'DESOBEDIENCIA': '/icons/marker-icon-2.png',
  'OTRO': '/icons/marker-icon-4.png',
};

// Función para obtener el icono según los delitos
function obtenerIconoPorDelitos(delitos: Partial<Delito>[]): string {
  if (!delitos || delitos.length === 0) return defaultIcon;
  const primerDelito = delitos[0];
  if (!primerDelito || !primerDelito.tipoDelito) return defaultIcon;
  return iconosPorDelito[primerDelito.tipoDelito] || defaultIcon;
}

function onArticuloChange(delito: Partial<Delito>) {
  const selectedDelito = delitosOptions.find(d => d.articulo === delito.articulo);
  if (selectedDelito) {
    delito.inciso = selectedDelito.inciso || 'N/A';
    delito.tipoDelito = selectedDelito.tipoDelito;
  } else {
    delito.inciso = '';
    delito.tipoDelito = '';
  }
}

function onTipoDelitoChange(delito: Partial<Delito>) {
  const selectedDelito = delitosOptions.find(d => d.tipoDelito === delito.tipoDelito);
  if (selectedDelito) {
    delito.articulo = selectedDelito.articulo;
    delito.inciso = selectedDelito.inciso || 'N/A';
  } else {
    delito.articulo = '';
    delito.inciso = '';
  }
}
// END: DELITOS DATA AND LOGIC


interface IconOption {
  label: string;
  value: string;
}

const opcionesBarrios = [
  'Barrio San Martin A',
  'Barrio San Martin B',
  'Barrio Kennedy',
  'Barrio Los Pinos',
  'Barrio Belgrano',
  'Barrio Islas Malvinas',
  'Barrio Norte',
  'Barrio Centro',
  'Barrio Quintanilla',
  'Barrio Martín Fierro',
  'Barrio El Ceibo',
  'Barrio Ramón Carrillo',
  'Barrio El Modelo',
  'Barrio El Progreso',
  'Zona Rural',
  'Frente de Ruta',
  'Otro',
];

const iconOptions: IconOption[] = [
  { label: 'Ícono por Defecto', value: '/icons/marker-icon.png' },
  { label: 'Ícono 2', value: '/icons/marker-icon-2.png' },
  { label: 'Ícono 3', value: '/icons/marker-icon-3.png' },
  { label: 'Ícono 4', value: '/icons/marker-icon-4.png' },
  { label: 'Ícono 5', value: '/icons/marker-icon-5.png' },
  { label: 'Ícono 6', value: '/icons/marker-icon-6.png' },
  { label: 'Ícono 7', value: '/icons/marker-icon-7.png' },
];

const defaultIcon = iconOptions[0]?.value ?? '';

// Tamaño de los íconos en el mapa. Subilo o bajalo para agrandar/achicar los marcadores.
const ESCALA_ICONO_MARCADOR = 0.12;

const getInitialFormState = () => ({
  id: undefined as number | undefined,
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  direccion: '',
  notas: '',
  latitud: 0,
  longitud: 0,
  icono: defaultIcon,
  fecha_inicio: '',
  fecha_fin: '',
  delitos: [] as Partial<Delito>[],
  delincuentes: [] as Partial<Delincuente>[],
  numero_denuncia: '',
  fiscal: '',
  barrio: '',
  estado_causa: '' as EstadoCausa | '',
});

const nuevoMarcador = ref(getInitialFormState());
const tempMarker: Ref<Feature<Geometry> | null> = ref(null);

const imputadoOptions = computed(() =>
  gisStore.obtenerImputadosUnicos().map((imputado) => ({
    label: imputado.dni ? `${imputado.nombre} - DNI ${imputado.dni}` : imputado.nombre,
    value: imputado.id,
    nombre: imputado.nombre,
    dni: imputado.dni,
  }))
);

const imputadoOptionsFiltradas = ref(imputadoOptions.value);

watch(imputadoOptions, (nuevas) => {
  imputadoOptionsFiltradas.value = nuevas;
});

const MADARIAGA_CENTER = fromLonLat([-57.139606022200695, -36.99809055471363]);
const MADARIAGA_EXTENT = fromLonLat([-57.45, -37.22]).concat(
  fromLonLat([-56.83, -36.78])
);

// Carga inicial de marcadores al montar el mapa
onMounted(async () => {
  if (mapContainer.value) {
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    map = new Map({
      target: mapContainer.value,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: MADARIAGA_CENTER,
        zoom: 14,
        minZoom: 8,
        extent: MADARIAGA_EXTENT,
      }),
      controls: [],
    });

    map.on('singleclick', (event) => {
      const feature = map?.forEachFeatureAtPixel(
        event.pixel,
        (feat) => feat as Feature<Geometry>
      );

      if (feature && feature.get('id')) {
        const marcadorId = feature.get('id') as number;
        void gisStore.seleccionarMarcador(marcadorId);
      } else {
        // Solo permitir crear marcadores si tiene permisos
        if (!authStore.canCreate) {
          $q.notify({
            type: 'warning',
            message: 'No tienes permisos para crear marcadores',
          });
          return;
        }

        const coords = toLonLat(event.coordinate);
        if (tempMarker.value) {
          vectorSource.removeFeature(tempMarker.value);
        }
        tempMarker.value = new Feature({
          geometry: new Point(fromLonLat(coords)),
        });
        tempMarker.value.setStyle(
          new Style({
            image: new Circle({
              radius: 7,
              fill: new Fill({ color: 'rgba(255, 0, 0, 0.5)' }),
              stroke: new Stroke({ color: 'red', width: 2 }),
            }),
          })
        );
        vectorSource.addFeature(tempMarker.value);
        abrirModal(coords as [number, number]);
      }
    });

    map.on('pointermove', (event) => {
      const pixel = map?.getEventPixel(event.originalEvent);
      if (pixel && mapContainer.value) {
        const feature = map?.forEachFeatureAtPixel(pixel, (feat) => feat, {
          hitTolerance: 5,
        });

        if (feature && feature.get('id')) {
          mapContainer.value.style.cursor = 'pointer';
          tooltipContent.value = `${feature.get('nombre')} ${feature.get(
            'apellido'
          )}`;
          if (event.originalEvent instanceof PointerEvent) {
            tooltipPosition.value = {
              x: event.originalEvent.clientX,
              y: event.originalEvent.clientY,
            };
            tooltipVisible.value = true;
          }
        } else {
          mapContainer.value.style.cursor = '';
          tooltipVisible.value = false;
        }
      }
    });

    // Cargar la base de datos pero NO mostrar marcadores al iniciar
    try {
      await gisStore.cargarDatosBase(); // Solo carga allMarcadores, NO actualiza marcadores
      // El mapa inicia vacío hasta que el usuario filtre o presione "Mostrar Todos"
    } catch (e) {
      console.error('No se pudieron cargar los marcadores iniciales:', e);
    }

    // Escuchar evento de impresión del mapa completo
    window.addEventListener('print-full-map', imprimirMapaCompleto);
  }
});

// Función para imprimir el mapa completo con todos los marcadores visibles
const imprimirMapaCompleto = () => {
  if (!map) {
    $q.notify({
      type: 'warning',
      message: 'El mapa no está disponible para imprimir.',
    });
    return;
  }

  // Cerrar el panel de información si está abierto
  const wasOpen = gisStore.marcadorSeleccionado !== null;
  if (wasOpen) {
    gisStore.cerrarInfo();
  }

  // Cerrar el modal si está abierto
  const wasModalOpen = modalVisible.value;
  if (wasModalOpen) {
    cerrarModal();
  }

  // Ocultar el tooltip
  tooltipVisible.value = false;

  // Esperar un momento para que se oculten los elementos
  setTimeout(() => {
    // Forzar actualización del tamaño del mapa
    map?.updateSize();

    // Renderizar completamente antes de imprimir
    map?.once('rendercomplete', () => {
      setTimeout(() => {
        window.print();
      }, 100);
    });
    map?.render();
  }, 200);
};

// Limpiar el event listener al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('print-full-map', imprimirMapaCompleto);
});

// Redibuja cada vez que cambia la lista de marcadores visibles
watch(
  () => gisStore.marcadores,
  (marcadoresNuevos) => {
    console.log('Recargando marcadores en el mapa...');
    vectorSource.clear();
    marcadoresNuevos.forEach(agregarMarcadorAlMapa);
  },
  { immediate: true }
);

/**
 * Formatea una fecha del store para ser usada en un q-input type="date".
 * @param dateValue La fecha (Date, string, o undefined) a formatear.
 * @returns La fecha formateada como YYYY-MM-DD, o una cadena vacía.
 */
const formatDateForInput = (dateValue: Date | string | undefined): string => {
  if (!dateValue) return '';
  const iso = new Date(dateValue).toISOString();
  const parts = iso.split('T');
  return parts[0] ?? '';
};

/**
 * Formatea una fecha para ser mostrada en el panel de información.
 * @param dateValue La fecha (Date, string, o undefined) a formatear.
 * @returns La fecha formateada como DD/MM/YYYY, o 'No especificada'.
 */
function formatDisplayDate(dateValue: Date | string | undefined): string {
  if (!dateValue) return 'No especificada';
  try {
    return date.formatDate(dateValue, 'DD/MM/YYYY');
  } catch (e) {
    console.error('Error al formatear la fecha para visualización:', e);
    return 'Error de formato';
  }
}

function agregarMarcadorAlMapa(marcador: MarcadorSeg) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([marcador.longitud, marcador.latitud])),
    id: marcador.id,
    nombre: marcador.nombre,
    apellido: marcador.apellido,
  });

  const iconSrc = marcador.icono || defaultIcon;
  const icon = new Icon({
    src: iconSrc,
    scale: ESCALA_ICONO_MARCADOR,
  });

  feature.setStyle(new Style({ image: icon }));
  vectorSource.addFeature(feature);
}

function abrirModal(coords: [number, number]) {
  const [lon, lat] = coords;
  nuevoMarcador.value = {
    ...getInitialFormState(),
    latitud: lat,
    longitud: lon,
  };
  isEditing.value = false;
  modalVisible.value = true;
}

function abrirModalEdicion() {
  if (!authStore.canEdit) {
    $q.notify({
      type: 'warning',
      message: 'No tienes permisos para editar marcadores',
    });
    return;
  }

  if (gisStore.marcadorSeleccionado) {
    nuevoMarcador.value = {
      id: gisStore.marcadorSeleccionado.id,
      nombre: gisStore.marcadorSeleccionado.nombre || '',
      apellido: gisStore.marcadorSeleccionado.apellido || '',
      dni: gisStore.marcadorSeleccionado.dni || '',
      telefono: gisStore.marcadorSeleccionado.telefono || '',
      direccion: gisStore.marcadorSeleccionado.direccion || '',
      notas: gisStore.marcadorSeleccionado.notas || '',
      latitud: gisStore.marcadorSeleccionado.latitud,
      longitud: gisStore.marcadorSeleccionado.longitud,
      icono: gisStore.marcadorSeleccionado.icono || defaultIcon,
      fecha_inicio: formatDateForInput(
        gisStore.marcadorSeleccionado.fecha_inicio
      ),
      fecha_fin: formatDateForInput(gisStore.marcadorSeleccionado.fecha_fin),
      delitos: gisStore.marcadorSeleccionado.delitos || [],
      delincuentes: gisStore.marcadorSeleccionado.delincuentes || [],
      numero_denuncia: gisStore.marcadorSeleccionado.numero_denuncia || '',
      fiscal: gisStore.marcadorSeleccionado.fiscal || '',
      barrio: gisStore.marcadorSeleccionado.barrio || '',
      estado_causa: gisStore.marcadorSeleccionado.estado_causa || '',
    };
    isEditing.value = true;
    modalVisible.value = true;
  }
}

function cerrarModal() {
  modalVisible.value = false;
  isEditing.value = false;
  if (tempMarker.value) {
    vectorSource.removeFeature(tempMarker.value);
    tempMarker.value = null;
  }
}

function agregarDelito() {
  if (!nuevoMarcador.value.delitos) {
    nuevoMarcador.value.delitos = [];
  }
  nuevoMarcador.value.delitos.push({
    articulo: '',
    inciso: '',
    tipoDelito: '',
  });
}

function eliminarDelito(index: number) {
  nuevoMarcador.value.delitos?.splice(index, 1);
}

function eliminarImputado(index: number) {
  nuevoMarcador.value.delincuentes?.splice(index, 1);
}

function abrirSelectorImputado() {
  imputadoSeleccionadoId.value = null;
  imputadoOptionsFiltradas.value = imputadoOptions.value;
  imputadoSelectorVisible.value = true;
}

function filtrarImputados(val: string, update: (callback: () => void) => void) {
  update(() => {
    if (!val) {
      imputadoOptionsFiltradas.value = imputadoOptions.value;
      return;
    }
    const needle = val.toLowerCase();
    imputadoOptionsFiltradas.value = imputadoOptions.value.filter((option) =>
      option.label.toLowerCase().includes(needle)
    );
  });
}

function usarImputadoSeleccionado() {
  if (!imputadoSeleccionadoId.value) {
    $q.notify({ type: 'warning', message: 'Selecciona un imputado' });
    return;
  }

  const seleccionado = imputadoOptions.value.find(
    (option) => option.value === imputadoSeleccionadoId.value
  );
  if (!seleccionado) {
    $q.notify({ type: 'warning', message: 'Imputado no encontrado' });
    return;
  }

  const yaAgregado = (nuevoMarcador.value.delincuentes || []).some(
    (imputado) => imputado.id === seleccionado.value
  );
  if (yaAgregado) {
    $q.notify({ type: 'warning', message: 'El imputado ya esta agregado' });
    return;
  }

  nuevoMarcador.value.delincuentes = nuevoMarcador.value.delincuentes || [];
  nuevoMarcador.value.delincuentes.push({
    id: seleccionado.value,
    nombre: seleccionado.nombre,
    dni: seleccionado.dni || '',
  });

  imputadoSelectorVisible.value = false;
}

function abrirModalNuevoImputado() {
  imputadoNuevo.value = { nombre: '', dni: '' };
  imputadoSelectorVisible.value = false;
  imputadoNuevoVisible.value = true;
}

function guardarNuevoImputado() {
  if (!imputadoNuevo.value.nombre || !imputadoNuevo.value.nombre.trim()) {
    $q.notify({ type: 'warning', message: 'El nombre es obligatorio' });
    return;
  }

  nuevoMarcador.value.delincuentes = nuevoMarcador.value.delincuentes || [];
  nuevoMarcador.value.delincuentes.push({
    nombre: imputadoNuevo.value.nombre.trim(),
    dni: imputadoNuevo.value.dni || '',
  });
  imputadoNuevoVisible.value = false;
}

async function guardarMarcador() {
  try {
    // Validar que todos los campos obligatorios estén completos
    if (!nuevoMarcador.value.nombre || !nuevoMarcador.value.nombre.trim()) {
      $q.notify({ type: 'warning', message: 'El nombre es obligatorio' });
      return;
    }
    if (!nuevoMarcador.value.apellido || !nuevoMarcador.value.apellido.trim()) {
      $q.notify({ type: 'warning', message: 'El apellido es obligatorio' });
      return;
    }

    if (!nuevoMarcador.value.direccion || !nuevoMarcador.value.direccion.trim()) {
      $q.notify({ type: 'warning', message: 'La dirección es obligatoria' });
      return;
    }
    if (!nuevoMarcador.value.numero_denuncia || !nuevoMarcador.value.numero_denuncia.trim()) {
      $q.notify({ type: 'warning', message: 'El número de IPP es obligatorio' });
      return;
    }

    if (!nuevoMarcador.value.barrio || !nuevoMarcador.value.barrio.trim()) {
      $q.notify({ type: 'warning', message: 'El barrio es obligatorio' });
      return;
    }

    if (!nuevoMarcador.value.fecha_inicio || !nuevoMarcador.value.fecha_inicio.trim()) {
      $q.notify({ type: 'warning', message: 'La fecha es obligatoria' });
      return;
    }

    if (!nuevoMarcador.value.estado_causa || !nuevoMarcador.value.estado_causa.trim()) {
      $q.notify({ type: 'warning', message: 'El estado de la causa es obligatorio' });
      return;
    }
    // Validar que haya al menos un delito
    if (!nuevoMarcador.value.delitos || nuevoMarcador.value.delitos.length === 0) {
      $q.notify({ type: 'warning', message: 'Debe agregar al menos un delito' });
      return;
    }
    // Validar que todos los delitos estén completos
    for (let i = 0; i < nuevoMarcador.value.delitos.length; i++) {
      const delito = nuevoMarcador.value.delitos[i];
      if (!delito || !delito.tipoDelito) {
        $q.notify({ type: 'warning', message: `Complete el tipo de delito ${i + 1}` });
        return;
      }
    }

    // Limpiar delitos: convertir campos vacíos a null
    const delitosLimpios = (nuevoMarcador.value.delitos || []).map((d) => {
      const cleaned: Partial<Delito> = {
        tipoDelito: d.tipoDelito || null,
        articulo: d.articulo || null,
        inciso: d.inciso || null,
      };
      if (d.id !== undefined) cleaned.id = d.id;
      return cleaned as Delito;
    });

    // Limpiar imputados: convertir campos vacíos a null y preservar ids existentes sin enviar undefined
    const delincuentesLimpios = (nuevoMarcador.value.delincuentes || []).map((d) => {
      const cleaned: Partial<Delincuente> = {
        nombre: d.nombre || null,
        dni: d.dni || null,
      };
      if (d.id !== undefined) cleaned.id = d.id;
      return cleaned as Delincuente;
    });

    const payload: Partial<MarcadorSeg> = {
      nombre: nuevoMarcador.value.nombre || null,
      apellido: nuevoMarcador.value.apellido || null,
      dni: nuevoMarcador.value.dni || null,
      telefono: nuevoMarcador.value.telefono || null,
      direccion: nuevoMarcador.value.direccion || null,
      notas: nuevoMarcador.value.notas || null,
      latitud: nuevoMarcador.value.latitud,
      longitud: nuevoMarcador.value.longitud,
      icono: obtenerIconoPorDelitos(nuevoMarcador.value.delitos || []),
      delitos: delitosLimpios,
      delincuentes: delincuentesLimpios,
      numero_denuncia: nuevoMarcador.value.numero_denuncia || null,
      fiscal: nuevoMarcador.value.fiscal || null,
      barrio: nuevoMarcador.value.barrio || null,
      estado_causa: nuevoMarcador.value.estado_causa || null,
    };

    if (nuevoMarcador.value.fecha_inicio) {
      // Crear fecha local sin conversión de zona horaria
      const [year, month, day] = nuevoMarcador.value.fecha_inicio.split('-').map(Number);
      if (year !== undefined && month !== undefined && day !== undefined) {
        payload.fecha_inicio = new Date(year, month - 1, day, 12, 0, 0);
      }
    }
    if (nuevoMarcador.value.fecha_fin) {
      // Crear fecha local sin conversión de zona horaria
      const [year, month, day] = nuevoMarcador.value.fecha_fin.split('-').map(Number);
      if (year !== undefined && month !== undefined && day !== undefined) {
        payload.fecha_fin = new Date(year, month - 1, day, 12, 0, 0);
      }
    }

    if (isEditing.value && nuevoMarcador.value.id) {
      payload.id = nuevoMarcador.value.id;
      await gisStore.actualizarMarcador(payload as MarcadorSeg);
      $q.notify({
        type: 'positive',
        message: 'Marcador actualizado correctamente',
      });
    } else {
      await gisStore.agregarMarcador(payload as Omit<MarcadorSeg, 'id'>);
      $q.notify({
        type: 'positive',
        message: 'Marcador agregado correctamente',
      });
    }
    cerrarModal();
  } catch (error) {
    console.error('Error al guardar el marcador:', error);

    // Detectar si es un error de duplicado
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Duplicate entry') || errorMessage.includes('ER_DUP_ENTRY')) {
      $q.notify({
        type: 'negative',
        message: 'Algunos datos están mal cargados o duplicados. Verifica que el número de IPP no exista.',
      });
    } else {
      $q.notify({
        type: 'negative',
        message: 'Algunos datos están mal cargados o duplicados. Verifica que el número de IPP no exista.',
      });
    }
  }
}

function confirmarEliminar() {
  if (!authStore.canDelete) {
    $q.notify({
      type: 'warning',
      message: 'No tienes permisos para eliminar marcadores',
    });
    return;
  }

  $q.dialog({
    title: 'Confirmación',
    message: '¿Estás seguro de que quieres eliminar este marcador?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void eliminarMarcador();
  });
}

async function eliminarMarcador() {
  try {
    if (gisStore.marcadorSeleccionado && gisStore.marcadorSeleccionado.id) {
      await gisStore.eliminarMarcador(gisStore.marcadorSeleccionado.id);
      $q.notify({
        type: 'negative',
        message: 'Marcador eliminado correctamente',
      });
    }
  } catch (error) {
    console.error('Error al eliminar el marcador:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar el marcador. Inténtalo de nuevo.',
    });
  }
}

function imprimirCard() {
  if (!gisStore.marcadorSeleccionado) return;

  const marcador = gisStore.marcadorSeleccionado;

  // Crear contenido HTML para imprimir
  let contenido = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Información del Delito</title>
      <style>
        @page {
          margin: 0;
          size: auto;
        }
        body {
          font-family: Arial, sans-serif;
          padding: 15px;
          max-width: 800px;
          margin: 0 auto;
          font-size: 11px;
        }
        h1 {
          color: #1976d2;
          border-bottom: 2px solid #1976d2;
          padding-bottom: 8px;
          font-size: 18px;
          margin-bottom: 15px;
        }
        h2 {
          font-size: 14px;
          margin-top: 15px;
          margin-bottom: 10px;
        }
        .seccion {
          margin: 15px 0;
        }
        .campo {
          margin: 6px 0;
          padding: 6px;
          background-color: #f5f5f5;
          border-radius: 3px;
        }
        .label {
          font-weight: bold;
          color: #666;
          font-size: 9px;
          text-transform: uppercase;
        }
        .valor {
          color: #000;
          font-size: 11px;
          margin-top: 2px;
        }
        .delitos {
          margin-top: 15px;
        }
        .delito-item {
          border: 1px solid #ddd;
          padding: 8px;
          margin: 8px 0;
          border-radius: 3px;
          background-color: #fff9e6;
        }
        .delincuentes {
          margin-top: 15px;
        }
        .delincuente-item {
          border: 1px solid #ddd;
          padding: 8px;
          margin: 8px 0;
          border-radius: 3px;
          background-color: #ffe6e6;
        }
        @media print {
          body {
            padding: 10px;
            font-size: 10px;
          }
          .valor {
            font-size: 10px;
          }
        }
      </style>
    </head>
    <body>
      <h1>Información del Marcador</h1>

      <div class="seccion">
        <div class="campo">
          <div class="label">Nombre Completo</div>
          <div class="valor">${marcador.nombre} ${marcador.apellido}</div>
        </div>

        <div class="campo">
          <div class="label">DNI</div>
          <div class="valor">${marcador.dni || 'No especificado'}</div>
        </div>

        <div class="campo">
          <div class="label">Fecha de Inicio</div>
          <div class="valor">${formatDisplayDate(marcador.fecha_inicio)}</div>
        </div>

        ${marcador.fecha_fin ? `
        <div class="campo">
          <div class="label">Fecha de Fin</div>
          <div class="valor">${formatDisplayDate(marcador.fecha_fin)}</div>
        </div>
        ` : ''}

        <div class="campo">
          <div class="label">Dirección</div>
          <div class="valor">${marcador.direccion || 'No especificada'}</div>
        </div>

        <div class="campo">
          <div class="label">Barrio</div>
          <div class="valor">${marcador.barrio || 'No especificado'}</div>
        </div>

        <div class="campo">
          <div class="label">Teléfono</div>
          <div class="valor">${marcador.telefono || 'No especificado'}</div>
        </div>

        <div class="campo">
          <div class="label">Número de IPP</div>
          <div class="valor">${marcador.numero_denuncia || 'No especificado'}</div>
        </div>

        <div class="campo">
          <div class="label">Fiscal</div>
          <div class="valor">${marcador.fiscal || 'No especificado'}</div>
        </div>

        ${marcador.estado_causa ? `
        <div class="campo">
          <div class="label">Estado de la Causa</div>
          <div class="valor">${marcador.estado_causa === EstadoCausa.ESCLARECIDO ? 'Esclarecido' : 'No Esclarecido'}</div>
        </div>
        ` : ''}

        ${marcador.notas ? `
        <div class="campo">
          <div class="label">Notas</div>
          <div class="valor" style="white-space: pre-wrap;">${marcador.notas}</div>
        </div>
        ` : ''}
      </div>
  `;

  // Agregar delitos si existen
  if (marcador.delitos && marcador.delitos.length > 0) {
    contenido += `
      <div class="delitos">
        <h2 style="color: #d32f2f;">Delitos Asociados</h2>
    `;

    marcador.delitos.forEach((delito) => {
      contenido += `
        <div class="delito-item">
          <div class="campo">
            <div class="label">Tipo de Delito</div>
            <div class="valor">${delito.tipoDelito || 'No especificado'}</div>
          </div>
          <div class="campo">
            <div class="label">Artículo</div>
            <div class="valor">${delito.articulo || 'N/A'}</div>
          </div>
          <div class="campo">
            <div class="label">Inciso</div>
            <div class="valor">${delito.inciso || 'N/A'}</div>
          </div>
        </div>
      `;
    });

    contenido += `</div>`;
  }

  // Agregar delincuentes si existen
  if (marcador.delincuentes && marcador.delincuentes.length > 0) {
    contenido += `
      <div class="delincuentes">
        <h2 style="color: #c62828;">Delincuentes Asociados</h2>
    `;

    marcador.delincuentes.forEach((delincuente) => {
      contenido += `
        <div class="delincuente-item">
          <div class="campo">
            <div class="label">Nombre</div>
            <div class="valor">${delincuente.nombre || 'No especificado'}</div>
          </div>
          <div class="campo">
            <div class="label">DNI</div>
            <div class="valor">${delincuente.dni || 'N/A'}</div>
          </div>
        </div>
      `;
    });

    contenido += `</div>`;
  }

  contenido += `
    </body>
    </html>
  `;

  // Abrir ventana de impresión
  const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
  if (ventanaImpresion) {
    ventanaImpresion.document.write(contenido);
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    ventanaImpresion.print();
  }
}
</script>

<style scoped>
.tooltip-marcador {
  position: absolute;
  z-index: 1000;
  padding: 5px 10px;
  background-color: #0f172a;
  color: #fff;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.3);
  pointer-events: none;
}

.info-panel {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 999;
  display: flex;
  flex-direction: column;
  width: 340px;
  max-height: 82%;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

/* ── Cabecera ── */
.ficha-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px 12px 14px 16px;
  background: #1976d2;
  color: #fff;
}

.ficha-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  color: #1976d2;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ficha-header__texto {
  flex: 1;
  min-width: 0;
}

.ficha-nombre {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.ficha-dni {
  margin-top: 1px;
  font-size: 0.73rem;
  color: #cfe3f7;
}

/* ── Cuerpo scrolleable ── */
.ficha-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px 16px;
}

.ficha-body::-webkit-scrollbar {
  width: 6px;
}

.ficha-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

/* ── Estado de la causa ── */
.estado-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 15px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.estado-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.estado-badge.is-esclarecido {
  background: #16a34a;
  color: #fff;
}

.estado-badge.is-pendiente {
  background: #d97706;
  color: #fff;
}

/* ── Datos en dos columnas ── */
.dato-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px 12px;
}

.dato {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.dato--full {
  grid-column: 1 / -1;
}

.dato__icono {
  margin-top: 2px;
  flex-shrink: 0;
}

.dato__texto {
  min-width: 0;
}

.dato__label {
  margin-bottom: 1px;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #94a3b8;
}

.dato__valor {
  font-size: 0.85rem;
  line-height: 1.35;
  color: #1e293b;
  word-break: break-word;
}

/* Paleta de acentos */
.is-azul {
  color: #2563eb;
}

.is-rosa {
  color: #e11d48;
}

.is-violeta {
  color: #7c3aed;
}

.is-verde {
  color: #16a34a;
}

.is-ambar {
  color: #d97706;
}

.is-teal {
  color: #0d9488;
}

.is-indigo {
  color: #4f46e5;
}

/* ── Secciones (delitos, imputados, notas) ── */
.ficha-seccion {
  margin-top: 22px;
}

.ficha-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ficha-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 0.65rem;
  letter-spacing: 0;
  color: #fff;
}

.ficha-count.is-rosa {
  background: #e11d48;
  color: #fff;
}

.ficha-count.is-indigo {
  background: #4f46e5;
  color: #fff;
}


.lista {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lista__item {
  padding: 9px 12px;
  border-radius: 8px;
}

.lista__item--delito {
  background: #ffe4e6;
}

.lista__item--imputado {
  background: #e0e7ff;
}

.lista__titulo {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.lista__meta {
  margin-top: 1px;
  font-size: 0.72rem;
  color: #64748b;
}

.ficha-notas {
  margin: 0;
  padding: 9px 12px;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #78350f;
  white-space: pre-wrap;
}

/* ── Pie de acciones ── */
.ficha-footer {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  background: #f1f5f9;
}

/* ── Drawer de alta / edición ── */
.form-drawer {
  box-shadow: -4px 0 24px rgba(15, 23, 42, 0.1);
}

.form-topbar {
  padding: 14px 12px 14px 16px;
  background: #1976d2;
  color: #fff;
}

.form-titulo {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.form-topbar :deep(.q-btn) {
  color: #fff;
}

.form-body {
  padding: 4px 16px 16px;
}

.form-seccion {
  padding: 16px 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #94a3b8;
}

.form-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #1976d2;
  color: #fff;
  font-size: 0.65rem;
  letter-spacing: 0;
}

.form-vacio {
  margin: 0 0 8px;
  font-size: 0.76rem;
  color: #94a3b8;
}

.campo :deep(.q-field__control) {
  border-radius: 8px;
  background: #fff;
}

/* Bloques repetibles de delito e imputado */
.bloque {
  margin-bottom: 8px;
  padding: 10px 12px 12px;
  background: #f1f5f9;
  border-radius: 10px;
}

.bloque__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.bloque__titulo {
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
}

.bloque__meta {
  font-size: 0.74rem;
  color: #64748b;
}

/* Botón de agregar ítem */
.btn-agregar {
  width: 100%;
  padding: 9px;
  background: transparent;
  border: 1.5px dashed #cbd5e1;
  border-radius: 9px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

.btn-agregar:hover {
  background: #f8fafc;
  border-color: #1976d2;
  color: #1976d2;
}

.form-footer {
  display: flex;
  gap: 8px;
  padding: 11px 12px;
  background: #f1f5f9;
}

/* Sistema de botones: misma altura y radio, jerarquía por color de fondo */
.app-btn {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.app-btn :deep(.q-icon) {
  font-size: 16px;
}

.app-btn :deep(.q-btn__content) {
  gap: 5px;
}

/* Secundario neutro (imprimir) */
.app-btn--neutro {
  padding: 0 9px;
  background: #e2e8f0;
  color: #475569;
}

.app-btn--neutro:hover {
  background: #cbd5e1;
  color: #0f172a;
}

/* Destructivo, en tono suave para no competir con la acción principal */
.app-btn--peligro {
  background: #fee2e2;
  color: #dc2626;
}

.app-btn--peligro:hover {
  background: #fecaca;
  color: #b91c1c;
}

/* Acción principal */
.app-btn--principal {
  background: #1976d2;
  color: #fff;
}

.app-btn--principal:hover {
  background: #1565c0;
}

@media (max-width: 599px) {
  .info-panel {
    left: 12px;
    right: 12px;
    width: auto;
  }
}

/* Estilos para impresión */
@media print {

  /* Resetear estilos globales para impresión */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-sizing: border-box !important;
  }

  /* Configurar tamaño de página A4 */
  @page {
    size: A4 landscape;
    margin: 0;
  }

  html {
    height: 100% !important;
    overflow: hidden !important;
  }

  body {
    margin: 0 !important;
    padding: 10mm !important;
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
    background: #fff !important;
  }

  /* Ocultar todo el contenido del body excepto el mapa */
  body>* {
    display: none !important;
  }

  /* Mostrar solo el contenedor del mapa */
  body>#q-app {
    display: block !important;
  }

  #q-app>* {
    display: none !important;
  }

  #q-app>.q-layout {
    display: block !important;
  }

  .q-layout>* {
    display: none !important;
  }

  .q-layout>.q-page-container {
    display: block !important;
  }

  .info-panel,
  .q-drawer,
  .tooltip-marcador {
    display: none !important;
  }

  .q-page-container,
  .q-page {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  /* Asegurar que el mapa ocupe toda la página */
  div[ref="mapContainer"] {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Estilos para el canvas de OpenLayers */
  .ol-viewport,
  .ol-viewport canvas {
    width: 100% !important;
    height: 100% !important;
  }

  /* Ocultar controles de OpenLayers si los hay */
  .ol-control {
    display: none !important;
  }

  /* Evitar saltos de página */
  * {
    page-break-before: avoid !important;
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
  }
}
</style>
