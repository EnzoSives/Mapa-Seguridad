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

    <q-card v-if="gisStore.marcadorSeleccionado" class="info-panel q-mx-auto">
      <q-card-section class="bg-primary text-white q-pa-md">
        <div class="row items-center no-wrap">
          <div class="col">
            <q-avatar color="white" text-color="primary" icon="person" class="q-mr-md" />
            <div>
              <div class="text-h6 ellipsis">
                {{ gisStore.marcadorSeleccionado.nombre }}
                {{ gisStore.marcadorSeleccionado.apellido }}
              </div>
              <div class="text-subtitle2">
                DNI: {{ gisStore.marcadorSeleccionado.dni || 'No especificado' }}
              </div>
            </div>
          </div>
          <div class="col-auto">
            <q-btn icon="close" flat round dense @click="gisStore.cerrarInfo" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-list separator>

          <q-item>
            <q-item-section avatar>
              <q-icon color="grey-7" name="event_available" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Fecha de Inicio</q-item-label>
              <q-item-label>{{
                formatDisplayDate(gisStore.marcadorSeleccionado.fecha_inicio)
              }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon color="grey-7" name="place" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Dirección</q-item-label>
              <q-item-label>{{
                gisStore.marcadorSeleccionado.direccion || 'No especificada'
              }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon color="grey-7" name="phone" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Teléfono</q-item-label>
              <q-item-label>{{
                gisStore.marcadorSeleccionado.telefono || 'No especificado'
              }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon color="grey-7" name="report" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Número de IPP</q-item-label>
              <q-item-label>{{
                gisStore.marcadorSeleccionado.numero_denuncia || 'No especificado'
              }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon color="grey-7" name="gavel" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Fiscal</q-item-label>
              <q-item-label>{{
                gisStore.marcadorSeleccionado.fiscal || 'No especificado'
              }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon color="grey-7" name="location_city" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Barrio</q-item-label>
              <q-item-label>{{
                gisStore.marcadorSeleccionado.barrio || 'No especificado'
              }}</q-item-label>
            </q-item-section>
          </q-item>


          <q-item v-if="gisStore.marcadorSeleccionado.fecha_fin">
            <q-item-section avatar>
              <q-icon color="grey-7" name="event_busy" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Fecha de Fin</q-item-label>
              <q-item-label>{{
                formatDisplayDate(gisStore.marcadorSeleccionado.fecha_fin)
              }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="gisStore.marcadorSeleccionado.notas">
            <q-item-section avatar>
              <q-icon color="grey-7" name="notes" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Notas</q-item-label>
              <q-item-label class="text-body2" style="white-space: pre-wrap">{{
                gisStore.marcadorSeleccionado.notas
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section v-if="
        gisStore.marcadorSeleccionado.delitos &&
        gisStore.marcadorSeleccionado.delitos.length > 0
      " class="q-pt-none">
        <q-expansion-item expand-separator icon="warning" label="Delitos Asociados"
          header-class="text-subtitle1 text-weight-medium">
          <q-list bordered separator class="q-mt-sm">
            <div v-for="(delito, index) in gisStore.marcadorSeleccionado.delitos" :key="index">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Tipo de Delito</q-item-label>
                  <q-item-label class="text-weight-medium">{{
                    delito.tipoDelito || 'No especificado'
                  }}</q-item-label>
                  <q-item-label caption class="q-mt-sm">Artículo</q-item-label>
                  <q-item-label>{{ delito.articulo || 'N/A' }}</q-item-label>
                  <q-item-label caption class="q-mt-sm">Inciso</q-item-label>
                  <q-item-label>{{ delito.inciso || 'N/A' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator v-if="
                index < gisStore.marcadorSeleccionado.delitos.length - 1
              " />
            </div>
          </q-list>
        </q-expansion-item>
      </q-card-section>

      <q-card-section v-if="
        gisStore.marcadorSeleccionado.delincuentes &&
        gisStore.marcadorSeleccionado.delincuentes.length > 0
      " class="q-pt-none">
        <q-expansion-item expand-separator icon="person_search" label="Imputados Asociados"
          header-class="text-subtitle1 text-weight-medium">
          <q-list bordered separator class="q-mt-sm">
            <div v-for="(imputado, index) in gisStore.marcadorSeleccionado.delincuentes" :key="index">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Nombre</q-item-label>
                  <q-item-label class="text-weight-medium">{{
                    imputado.nombre || 'No especificado'
                  }}</q-item-label>
                  <q-item-label caption class="q-mt-sm">DNI</q-item-label>
                  <q-item-label>{{ imputado.dni || 'N/A' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator v-if="
                index < gisStore.marcadorSeleccionado.delincuentes.length - 1
              " />
            </div>
          </q-list>
        </q-expansion-item>
      </q-card-section>

      <q-separator />

      <q-card-actions class="q-pa-md q-gutter-sm row justify-end">
        <q-btn v-if="authStore.canPrint" icon="print" color="secondary" flat @click="imprimirCard" />
        <q-btn v-if="authStore.canEdit" label="Editar" icon="edit" color="primary" unelevated
          @click="abrirModalEdicion" />
        <q-btn v-if="authStore.canDelete" label="Eliminar" icon="delete" color="negative" unelevated
          @click="confirmarEliminar" />
      </q-card-actions>
    </q-card>
    <q-drawer v-model="modalVisible" side="right" overlay bordered :width="400" class="bg-grey-1">
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6">
              {{ isEditing ? 'Editar Marcador' : 'Agregar Marcador' }}
            </div>
            <q-btn icon="close" flat round dense @click="cerrarModal" />
          </div>

          <q-input v-model="nuevoMarcador.nombre" label="Nombre (Obligatorio)" outlined class="q-mb-md" :rules="[
            val => !!val || 'El nombre es obligatorio',
            val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras'
          ]" lazy-rules />
          <q-input v-model="nuevoMarcador.apellido" label="Apellido (Obligatorio)" outlined class="q-mb-md" :rules="[
            val => !!val || 'El apellido es obligatorio',
            val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras'
          ]" lazy-rules />
          <q-input v-model="nuevoMarcador.dni" label="DNI" outlined class="q-mb-md" type="text"
            @keypress="(evt: KeyboardEvent) => { if (!/[0-9]/.test(evt.key)) evt.preventDefault(); }" :rules="[
              val => !val || /^\d+$/.test(val) || 'Solo se permiten números',
              val => !val || (val.length >= 7 && val.length <= 8) || 'El DNI debe tener 7 u 8 dígitos'
            ]" lazy-rules />
          <q-input v-model="nuevoMarcador.telefono" label="Teléfono" outlined class="q-mb-md" type="text"
            @keypress="(evt: KeyboardEvent) => { if (!/[0-9]/.test(evt.key)) evt.preventDefault(); }" :rules="[
              val => !val || /^\d+$/.test(val) || 'Solo se permiten números'
            ]" lazy-rules />
          <q-input v-model="nuevoMarcador.direccion" label="Dirección del hecho (Obligatorio)" outlined class="q-mb-md"
            :rules="[val => !!val || 'La dirección es obligatoria']" lazy-rules />
          <q-input v-model="nuevoMarcador.numero_denuncia" label="Número de IPP (Obligatorio)" outlined class="q-mb-md"
            type="text" @keypress="(evt: KeyboardEvent) => { if (!/[0-9]/.test(evt.key)) evt.preventDefault(); }"
            :rules="[
              val => !!val || 'El número de IPP es obligatorio',
              val => /^\d+$/.test(val) || 'Solo se permiten números'
            ]" lazy-rules />
          <q-input v-model="nuevoMarcador.fiscal" label="Fiscal" outlined class="q-mb-md" :rules="[
            val => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+$/.test(val) || 'Solo se permiten letras'
          ]" lazy-rules />
          <q-select v-model="nuevoMarcador.barrio" :options="opcionesBarrios" label="Barrio (Obligatorio)" outlined
            class="q-mb-md" :rules="[val => !!val || 'El barrio es obligatorio']" lazy-rules />
          <q-input v-model="nuevoMarcador.notas" label="Notas" type="textarea" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.fecha_inicio" label="Fecha (Obligatorio)" type="date" outlined class="q-mb-md"
            stack-label :rules="[val => !!val || 'La fecha es obligatoria']" lazy-rules />


          <div class="text-subtitle1 q-mb-sm">Delitos (al menos uno requerido)</div>
          <div v-for="(delito, index) in nuevoMarcador.delitos" :key="index" class="q-mb-md q-pa-sm"
            style="border: 1px solid #ccc; border-radius: 4px;">
            <q-select v-model="delito.tipoDelito" :options="tipoDelitoOptions" label="Tipo de Delito (Obligatorio)"
              outlined dense @update:model-value="onTipoDelitoChange(delito)"
              :rules="[val => !!val || 'El tipo de delito es obligatorio']" lazy-rules />
            <q-select v-model="delito.articulo" :options="articuloOptions" label="Artículo" outlined dense
              @update:model-value="onArticuloChange(delito)" class="q-mb-sm" lazy-rules />
            <q-input v-model="delito.inciso" label="Inciso" outlined dense readonly class="q-mt-sm" />
            <q-btn label="Eliminar Delito" color="negative" @click="eliminarDelito(index)" class="q-mt-sm" flat dense />
          </div>
          <q-btn label="Agregar Delito" color="primary" @click="agregarDelito" class="q-mb-md" />

          <div class="text-subtitle1 q-mb-sm q-mt-md">Imputados (opcional)</div>
          <div v-for="(imputado, index) in nuevoMarcador.delincuentes" :key="index" class="q-mb-md q-pa-sm"
            style="border: 1px solid #ccc; border-radius: 4px;">
            <q-input v-model="imputado.nombre" label="Nombre (Obligatorio)" outlined dense class="q-mb-sm"
              :readonly="true" :rules="[
                val => !!val || 'El nombre es obligatorio',
                val => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras'
              ]" lazy-rules />
            <q-input v-model="imputado.dni" label="DNI" outlined dense class="q-mb-sm" type="text" :readonly="true"
              @keypress="(evt: KeyboardEvent) => { if (!/[0-9]/.test(evt.key)) evt.preventDefault(); }" :rules="[
                val => !val || /^\d+$/.test(val) || 'Solo se permiten números',
                val => !val || (val.length >= 7 && val.length <= 8) || 'El DNI debe tener 7 u 8 dígitos'
              ]" lazy-rules />
            <q-btn label="Eliminar Imputado" color="negative" @click="eliminarImputado(index)" class="q-mt-sm" flat
              dense />
          </div>
          <q-btn label="Agregar Imputado" color="primary" @click="abrirSelectorImputado" class="q-mb-md" />

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" color="negative" @click="cerrarModal" />
            <q-btn label="Guardar" color="positive" @click="guardarMarcador" />
          </div>
        </div>
      </q-scroll-area>
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
import { useGisStore, type MarcadorSeg, type Delito, type Delincuente } from 'src/stores/gisStore';
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
    scale: 0.2,
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
  background-color: white;
  padding: 5px 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: none;
}

.info-panel {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 999;
  width: 350px;
  max-height: 80%;
  overflow-y: auto;

  /* Ocultar la barra de desplazamiento para navegadores Webkit (Chrome, Safari) */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Ocultar la barra de desplazamiento para IE, Edge */
  -ms-overflow-style: none;
  /* Ocultar la barra de desplazamiento para Firefox */
  scrollbar-width: none;
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
