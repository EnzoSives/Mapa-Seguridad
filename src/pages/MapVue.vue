<template>
  <q-page class="full-height no-scroll">
    <div ref="mapContainer" class="mapa"></div>

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
      </q-card-section>
    </q-card>

    <q-drawer v-model="modalVisible" side="right" :width="400" overlay bordered behavior="desktop">
      <q-card class="full-height column no-wrap">
        <q-card-section class="bg-primary text-white q-pa-md">
          <div class="text-h6">Nuevo Marcador</div>
        </q-card-section>

        <q-card-section class="scroll-y q-pa-md">
          <q-form ref="formulario" @submit="guardarMarcador">
            <q-input v-model="nuevoMarcador.nombre" label="Nombre *" dense outlined
              :rules="[(val) => !!val || 'Requerido']" />
            <q-input v-model="nuevoMarcador.apellido" label="Apellido *" dense outlined
              :rules="[(val) => !!val || 'Requerido']" />
            <q-input v-model="nuevoMarcador.dni" label="DNI *" dense outlined
              :rules="[(val) => !!val || 'Requerido']" />
            <q-input v-model="nuevoMarcador.telefono" label="Teléfono *" dense outlined
              :rules="[(val) => !!val || 'Requerido']" />
            <q-input v-model="nuevoMarcador.direccion" label="Dirección *" dense outlined
              :rules="[(val) => !!val || 'Requerido']" />
            <q-input v-model="nuevoMarcador.notas" label="Notas" dense outlined type="textarea" />
            <q-select v-model="nuevoMarcador.icono" label="Ícono *" :options="iconosDisponibles" emit-value map-options
              dense outlined :rules="[(val) => !!val || 'Requerido']" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cerrarModal" color="negative" />
          <q-btn flat label="Guardar" @click="guardarMarcador" color="positive" />
        </q-card-actions>
      </q-card>
    </q-drawer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
// 1. Se importa MarcadorSeg en lugar de Marcador
import { useGisStore, type MarcadorSeg } from 'src/stores/gisStore';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const gisStore = useGisStore();
const mapContainer = ref<HTMLElement | null>(null);
const modalVisible = ref(false);
const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipPosition = ref({ x: 0, y: 0 });

// 2. El objeto 'nuevoMarcador' ahora coincide con la estructura de MarcadorSeg
const nuevoMarcador = ref({
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  direccion: '',
  notas: '',
  latitud: null as number | null,
  longitud: null as number | null,
  icono: '',
});

const iconosDisponibles = [
  { label: 'Icono 1', value: '/marker-icon.png' },
  { label: 'Icono 2', value: '/marker-icon-2.png' },
  { label: 'Icono 3', value: '/marker-icon-3.png' },
];

let map: Map;
const vectorSource = new VectorSource();

onMounted(() => {
  // 3. Se llama a la acción renombrada en el store
  void gisStore.cargarMarcadores();
  const vectorLayer = new VectorLayer({ source: vectorSource });

  map = new Map({
    target: mapContainer.value as HTMLElement,
    layers: [new TileLayer({ source: new OSM() }), vectorLayer],
    view: new View({
      center: fromLonLat([-57.1339, -37.0017]),
      zoom: 14,
    }),
  });

  watch(
    () => gisStore.marcadores,
    (marcadores) => {
      vectorSource.clear();
      marcadores.forEach(agregarMarcadorAlMapa);
    },
    { immediate: true }
  );

  map.on('pointermove', (event) => {
    const pixel = event.pixel;
    let featureFound = false;

    map.forEachFeatureAtPixel(pixel, (feature) => {
      const nombre = feature.get('nombre');
      const apellido = feature.get('apellido');
      tooltipContent.value = `${nombre} ${apellido}`;
      tooltipPosition.value = { x: (pixel?.[0] ?? 0) + 10, y: (pixel?.[1] ?? 0) - 10 };
      tooltipVisible.value = true;
      featureFound = true;
    });

    if (!featureFound) {
      tooltipVisible.value = false;
    }
  });

  map.on('singleclick', (event) => {
    let marcadorSeleccionado = false;

    map.forEachFeatureAtPixel(event.pixel, (feature) => {
      const id = feature.get('id');
      if (id) {
        // 4. Se llama a la acción renombrada en el store
        void gisStore.seleccionarMarcador(id);
        marcadorSeleccionado = true;
      }
    });

    if (!marcadorSeleccionado) {
      const coords = toLonLat(event.coordinate) as [number, number];
      abrirModal(coords);
    }
  });
});

watch(
  () => gisStore.marcadores, // <--- Esto observa los cambios en la lista
  (marcadoresNuevos) => {
    // Esta función se ejecuta CADA VEZ que 'gisStore.marcadores' cambia
    console.log('La lista de marcadores ha cambiado, redibujando el mapa...');
    vectorSource.clear(); // Limpia el mapa
    marcadoresNuevos.forEach(agregarMarcadorAlMapa); // Agrega todos los marcadores
  },
  { immediate: true } // 'immediate' hace que se ejecute una vez al cargar el componente
);

// 5. La función ahora espera un objeto de tipo MarcadorSeg
function agregarMarcadorAlMapa(marcador: MarcadorSeg) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([marcador.longitud, marcador.latitud])),
    id: marcador.id,
    nombre: marcador.nombre,
    apellido: marcador.apellido,
  });

  const icon = new Icon({
    src: marcador.icono,
    scale: 0.2,
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
    icono: '',
  };
  modalVisible.value = true;
}

function cerrarModal() {
  modalVisible.value = false;
}

async function guardarMarcador() {
  // 6. Se llama a la acción renombrada en el store
  await gisStore.agregarMarcador({
    ...nuevoMarcador.value,
    latitud: nuevoMarcador.value.latitud ?? 0,
    longitud: nuevoMarcador.value.longitud ?? 0,
  });
  cerrarModal();
  $q.notify({
    type: 'positive',
    message: 'Marcador agregado correctamente',
  });
}
</script>

<style scoped>
.mapa {
  width: 100%;
  height: 100vh;
}

.info-panel {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 350px;
  z-index: 10;
}

.tooltip-marcador {
  position: absolute;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  pointer-events: none;
  z-index: 1000;
}
</style>