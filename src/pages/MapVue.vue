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
      <q-card-section>
        <q-btn icon="close" flat round dense class="absolute-top-right q-ma-sm" @click="gisStore.cerrarInfo" />
        <div class="text-h6">
          {{ gisStore.marcadorSeleccionado.nombre }}
          {{ gisStore.marcadorSeleccionado.apellido }}
        </div>
        <div class="text-caption text-grey">
          DNI: {{ gisStore.marcadorSeleccionado.dni }}
        </div>
        <div class="text-body2">
          {{ gisStore.marcadorSeleccionado.direccion }}
        </div>
        <div class="text-body2">
          Tel: {{ gisStore.marcadorSeleccionado.telefono }}
        </div>
        <div class="text-body2" v-if="gisStore.marcadorSeleccionado.notas">
          Notas: {{ gisStore.marcadorSeleccionado.notas }}
        </div>
        <q-btn label="Editar" color="primary" @click="abrirModalEdicion" />
        <q-btn label="Eliminar" color="negative" @click="eliminarMarcador" class="q-ml-sm"/>
      </q-card-section>
    </q-card>

    <q-drawer v-model="modalVisible" side="right" :width="400">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Editar Marcador' : 'Agregar Nuevo Marcador' }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="nuevoMarcador.nombre" label="Nombre" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.apellido" label="Apellido" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.dni" label="DNI" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.telefono" label="Teléfono" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.direccion" label="Dirección" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.notas" label="Notas" type="textarea" outlined class="q-mb-md" />

          <q-select
            v-model="nuevoMarcador.icono"
            :options="iconOptions"
            label="Seleccionar Ícono"
            outlined
            emit-value
            map-options
            class="q-mb-md"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <img :src="scope.opt.value" style="width: 32px; height: 32px;" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <div class="row items-center">
                <img :src="scope.opt.value" style="width: 24px; height: 24px; margin-right: 8px;" />
                <span>{{ scope.opt.label }}</span>
              </div>
            </template>
          </q-select>

        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancelar" color="negative" @click="cerrarModal" />
          <q-btn label="Guardar" color="positive" @click="guardarMarcador" />
        </q-card-actions>
      </q-card>
    </q-drawer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useGisStore, type MarcadorSeg } from 'src/stores/gisStore';
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
import { fromLonLat, toLonLat } from 'ol/proj';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';

const $q = useQuasar();
const gisStore = useGisStore();
const mapContainer = ref<HTMLDivElement | null>(null);
let map: Map | null = null;
const vectorSource = new VectorSource();
const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipPosition = ref({ x: 0, y: 0 });
const modalVisible = ref(false);
const isEditing = ref(false);

interface IconOption {
  label: string;
  value: string;
}

const iconOptions: IconOption[] = [
  { label: 'Ícono por Defecto', value: '/icons/camara-de-cctv.png' },
  { label: 'Seguridad', value: '/icons/guardia.png' },
  { label: 'Policía', value: '/icons/policia.png' },
];

const defaultIcon = iconOptions[0]?.value ?? '';

const nuevoMarcador = ref<Partial<MarcadorSeg>>({
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  direccion: '',
  notas: '',
  latitud: 0,
  longitud: 0,
  icono: defaultIcon,
});

// Coordenadas exactas de General Juan Madariaga y su "caja" de alcance
const MADARIAGA_CENTER = fromLonLat([-57.139606022200695, -36.99809055471363]);
const MADARIAGA_EXTENT = fromLonLat([-57.175, -38.999]).concat(fromLonLat([-57.09, -36.12]));

onMounted(async () => {
  if (mapContainer.value) {
    map = new Map({
      target: mapContainer.value,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      view: new View({
        center: MADARIAGA_CENTER,
        zoom: 12,
        minZoom: 12,
        extent: MADARIAGA_EXTENT,
      }),
    });

    map.on('click', (event) => {
      const coords = toLonLat(event.coordinate);
      abrirModal(coords as [number, number]);
    });

    const select = new Select({
      condition: click,
      style: null, // <-- Solución: Deshabilita el estilo de selección.
    });
    map.addInteraction(select);

    select.on('select', (event) => {
      if (event.selected.length > 0) {
        const feature = event.selected[0];
        if (feature) {
          const marcadorId = feature.get('id');
          if (marcadorId) {
            void gisStore.seleccionarMarcador(marcadorId as number);
          }
        }
      }
      // Asegura que la selección se desactive después de un clic para que el estilo del ícono no se pierda.
      select.getFeatures().clear();
    });

    map.on('pointermove', (event) => {
      const pixel = map?.getEventPixel(event.originalEvent);
      if (pixel) {
        const feature = map?.forEachFeatureAtPixel(pixel, (feat) => feat);

        if (feature && feature instanceof Feature) {
          tooltipContent.value = feature.get('nombre') + ' ' + feature.get('apellido');
          if (event.originalEvent instanceof PointerEvent) {
            tooltipPosition.value = { x: event.originalEvent.clientX, y: event.originalEvent.clientY };
            tooltipVisible.value = true;
          }
        } else {
          tooltipVisible.value = false;
        }
      }
    });

    await gisStore.cargarMarcadores();
  }
});

watch(
  () => gisStore.marcadores,
  (marcadoresNuevos) => {
    console.log('Recargando marcadores en el mapa...');
    vectorSource.clear();
    marcadoresNuevos.forEach(agregarMarcadorAlMapa);
  },
  { immediate: true }
);

function agregarMarcadorAlMapa(marcador: MarcadorSeg) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([marcador.longitud, marcador.latitud])),
    id: marcador.id,
    nombre: marcador.nombre,
    apellido: marcador.apellido,
  });

  const icon = new Icon({
    src: marcador.icono,
    scale: 0.07,
  });

  feature.setStyle(new Style({ image: icon }));
  vectorSource.addFeature(feature);
}

function abrirModal(coords: [number, number]) {
  const [lon, lat] = coords;
  nuevoMarcador.value = {
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    direccion: '',
    notas: '',
    latitud: lat,
    longitud: lon,
    icono: defaultIcon, // Usa el valor por defecto seguro
  };
  isEditing.value = false;
  modalVisible.value = true;
}

function abrirModalEdicion() {
  if (gisStore.marcadorSeleccionado) {
    nuevoMarcador.value = { ...gisStore.marcadorSeleccionado };
    isEditing.value = true;
    modalVisible.value = true;
  }
}

function cerrarModal() {
  modalVisible.value = false;
  isEditing.value = false;
}

async function guardarMarcador() {
  if (isEditing.value && nuevoMarcador.value.id) {
    await gisStore.actualizarMarcador(nuevoMarcador.value as MarcadorSeg);
    $q.notify({
      type: 'positive',
      message: 'Marcador actualizado correctamente',
    });
  } else {
    await gisStore.agregarMarcador({
      nombre: nuevoMarcador.value.nombre ?? '',
      apellido: nuevoMarcador.value.apellido ?? '',
      dni: nuevoMarcador.value.dni ?? '',
      telefono: nuevoMarcador.value.telefono ?? '',
      direccion: nuevoMarcador.value.direccion ?? '',
      notas: nuevoMarcador.value.notas ?? '',
      latitud: nuevoMarcador.value.latitud ?? 0,
      longitud: nuevoMarcador.value.longitud ?? 0,
      icono: nuevoMarcador.value.icono ?? defaultIcon, // Usa el valor por defecto seguro
    });
    $q.notify({
      type: 'positive',
      message: 'Marcador agregado correctamente',
    });
  }
  cerrarModal();
}

async function eliminarMarcador() {
  if (gisStore.marcadorSeleccionado && gisStore.marcadorSeleccionado.id) {
    await gisStore.eliminarMarcador(gisStore.marcadorSeleccionado.id);
    $q.notify({
      type: 'negative',
      message: 'Marcador eliminado correctamente',
    });
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
}
</style>
