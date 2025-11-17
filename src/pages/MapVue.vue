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

      <q-separator />

      <q-card-actions align="right" class="q-pa-md q-gutter-sm">
        <q-btn label="Editar" icon="edit" color="primary" unelevated @click="abrirModalEdicion" />
        <q-btn label="Eliminar" icon="delete" color="negative" unelevated @click="confirmarEliminar" />
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

          <q-input v-model="nuevoMarcador.nombre" label="Nombre" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.apellido" label="Apellido" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.dni" label="DNI" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.telefono" label="Teléfono" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.direccion" label="Dirección" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.numero_denuncia" label="Número de IPP" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.fiscal" label="Fiscal" outlined class="q-mb-md" />
          <q-select v-model="nuevoMarcador.barrio" :options="opcionesBarrios" label="Barrio" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.notas" label="Notas" type="textarea" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.fecha_inicio" label="Fecha" type="date" outlined class="q-mb-md"
            stack-label />


          <div class="text-subtitle1 q-mb-sm">Delitos</div>
          <div v-for="(delito, index) in nuevoMarcador.delitos" :key="index" class="q-mb-md q-pa-sm"
            style="border: 1px solid #ccc; border-radius: 4px;">
            <q-select v-model="delito.articulo" :options="articuloOptions" label="Artículo" outlined dense
              @update:model-value="onArticuloChange(delito)" class="q-mb-sm" />
            <q-select v-model="delito.tipoDelito" :options="tipoDelitoOptions" label="Tipo de Delito" outlined dense
              @update:model-value="onTipoDelitoChange(delito)" />
            <q-input v-model="delito.inciso" label="Inciso" outlined dense readonly class="q-mt-sm" />
            <q-btn label="Eliminar Delito" color="negative" @click="eliminarDelito(index)" class="q-mt-sm" flat dense />
          </div>
          <q-btn label="Agregar Delito" color="primary" @click="agregarDelito" class="q-mb-md" />

          <q-select v-model="nuevoMarcador.icono" :options="iconOptions" label="Seleccionar Ícono" outlined emit-value
            map-options class="q-mb-md">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <img :src="scope.opt.value" style="width: 32px; height: 32px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <div class="row items-center">
                <img :src="scope.opt.value" style="width: 24px; height: 24px; margin-right: 8px" />
                <span>{{ scope.opt.label }}</span>
              </div>
            </template>
          </q-select>
          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" color="negative" @click="cerrarModal" />
            <q-btn label="Guardar" color="positive" @click="guardarMarcador" />
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type Ref } from 'vue';
import { useGisStore, type MarcadorSeg, type Delito } from 'src/stores/gisStore';
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
const mapContainer = ref<HTMLDivElement | null>(null);
let map: Map | null = null;
const vectorSource = new VectorSource();
const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipPosition = ref({ x: 0, y: 0 });
const modalVisible = ref(false);
const isEditing = ref(false);

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
];

const articuloOptions = delitosOptions.map(d => d.articulo);
const tipoDelitoOptions = delitosOptions.map(d => d.tipoDelito);

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
  'San Martin A',
  'San Martin B',
  'Kenedy',
  'Los Pinos',
  'Belgrano',
  'Barrio Norte',
  'Barrio Centro',
  'Quintanilla',
  'Zona Rural',
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
  numero_denuncia: '',
  fiscal: '',
  barrio: '',
});

const nuevoMarcador = ref(getInitialFormState());
const tempMarker: Ref<Feature<Geometry> | null> = ref(null);

const MADARIAGA_CENTER = fromLonLat([-57.139606022200695, -36.99809055471363]);
const MADARIAGA_EXTENT = fromLonLat([-57.175, -38.999]).concat(
  fromLonLat([-57.09, -36.12])
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
        zoom: 12,
        minZoom: 12,
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

    // Cargar y mostrar marcadores al iniciar
    try {
      await gisStore.cargarDatosParaTabla(); // llena allMarcadores y marcadores
      // El watcher con immediate: true se encargará de dibujarlos
    } catch (e) {
      console.error('No se pudieron cargar los marcadores iniciales:', e);
    }
  }
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
  if (gisStore.marcadorSeleccionado) {
    nuevoMarcador.value = {
      ...gisStore.marcadorSeleccionado,
      fecha_inicio: formatDateForInput(
        gisStore.marcadorSeleccionado.fecha_inicio
      ),
      fecha_fin: formatDateForInput(gisStore.marcadorSeleccionado.fecha_fin),
      delitos: gisStore.marcadorSeleccionado.delitos || [],
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

async function guardarMarcador() {
  try {
    const payload: Partial<MarcadorSeg> = {
      nombre: nuevoMarcador.value.nombre,
      apellido: nuevoMarcador.value.apellido,
      dni: nuevoMarcador.value.dni,
      telefono: nuevoMarcador.value.telefono,
      direccion: nuevoMarcador.value.direccion,
      notas: nuevoMarcador.value.notas,
      latitud: nuevoMarcador.value.latitud,
      longitud: nuevoMarcador.value.longitud,
      icono: nuevoMarcador.value.icono,
      delitos: nuevoMarcador.value.delitos,
      numero_denuncia: nuevoMarcador.value.numero_denuncia,
      fiscal: nuevoMarcador.value.fiscal,
      barrio: nuevoMarcador.value.barrio,
    };

    if (nuevoMarcador.value.fecha_inicio) {
      payload.fecha_inicio = new Date(nuevoMarcador.value.fecha_inicio);
    }
    if (nuevoMarcador.value.fecha_fin) {
      payload.fecha_fin = new Date(nuevoMarcador.value.fecha_fin);
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

  /* Ocultar la barra de desplazamiento para navegadores Webkit (Chrome, Safari) */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Ocultar la barra de desplazamiento para IE, Edge */
  -ms-overflow-style: none;
  /* Ocultar la barra de desplazamiento para Firefox */
  scrollbar-width: none;
}
</style>
