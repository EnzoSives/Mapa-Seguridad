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
        <div class="text-caption">
          DNI: {{ gisStore.marcadorSeleccionado.dni }}
        </div>
        <div class="text-body2">
         Direccion: {{ gisStore.marcadorSeleccionado.direccion }}
        </div>
        <div class="text-body2">
          Tel: {{ gisStore.marcadorSeleccionado.telefono }}
        </div>
        <div class="text-body2" v-if="gisStore.marcadorSeleccionado.notas">
          Notas: {{ gisStore.marcadorSeleccionado.notas }}
        </div>
        <q-btn label="Editar" color="primary" @click="abrirModalEdicion" />
        <q-btn label="Eliminar" color="negative" @click="confirmarEliminar" class="q-ml-sm"/>
      </q-card-section>
    </q-card>

    <q-dialog
      v-model="modalVisible"
      position="right"
      full-height
      no-shadow
    >
      <q-card class="modal-right-panel">
        <q-card-section class="q-pa-md">
          <q-btn icon="close" flat round dense class="absolute-top-right q-ma-sm" @click="cerrarModal" />
          <div class="text-h6">{{ isEditing ? 'Editar Marcador' : 'Agregar Nuevo Marcador' }}</div>
        </q-card-section>
        <q-card-section class="scroll q-pa-md">
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
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancelar" color="negative" @click="cerrarModal" />
          <q-btn label="Guardar" color="positive" @click="guardarMarcador" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type Ref } from 'vue';
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
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { fromLonLat, toLonLat } from 'ol/proj';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import type { Geometry } from 'ol/geom';

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
  { label: 'Ícono por Defecto', value: '/icons/marker-icon.png' },
  { label: 'Ícono por Defecto', value: '/icons/marker-icon-2.png' },
  { label: 'Ícono por Defecto', value: '/icons/marker-icon-3.png' },
  { label: 'Ícono por Defecto', value: '/icons/marker-icon-4.png' },
  { label: 'Ícono por Defecto', value: '/icons/marker-icon-5.png' },
  { label: 'Ícono por Defecto', value: '/icons/marker-icon-6.png' },
  { label: 'Ícono por Defecto', value: '/icons/marker-icon-7.png' },
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

const tempMarker: Ref<Feature<Geometry> | null> = ref(null);

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
      controls: [],
    });

    map.on('click', (event) => {
      const feature = map?.forEachFeatureAtPixel(event.pixel, (feat) => feat);

      if (!feature) {
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

    const select = new Select({
      condition: click,
      style: null,
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
    icono: defaultIcon,
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
  if (tempMarker.value) {
    vectorSource.removeFeature(tempMarker.value);
    tempMarker.value = null;
  }
}

async function guardarMarcador() {
  try {
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
        icono: nuevoMarcador.value.icono ?? defaultIcon,
      });
      $q.notify({
        type: 'positive',
        message: 'Marcador agregado correctamente',
      });
    }
    cerrarModal();
  } catch (error) {
    console.error('Error al guardar el marcador:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el marcador. Inténtalo de nuevo.',
    });
  }
}

function confirmarEliminar() {
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

.modal-right-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 400px;
  max-width: 100%;
  border-radius: 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.full-height-dialog.q-dialog {
  /* Anula el comportamiento por defecto de Quasar para que el diálogo no se centre */
  padding: 0;
  margin: 0;
}

/* El selector v-deep se usa para modificar estilos de componentes internos del q-dialog */
.full-height-dialog.q-dialog :deep(.q-dialog__inner) {
  padding: 0;
  min-height: 100vh;
  justify-content: flex-end; /* Alinea el contenido a la derecha */
}
</style>