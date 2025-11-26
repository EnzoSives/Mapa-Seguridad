// src/pages/DatosPage.vue
<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Sección de Filtros -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Filtros</div>
          <div class="row q-col-gutter-md">
            <!-- Filtro de Fecha Desde -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="filtroFechaDesde" label="Fecha Desde" outlined dense type="date" clearable />
            </div>

            <!-- Filtro de Fecha Hasta -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-input v-model="filtroFechaHasta" label="Fecha Hasta" outlined dense type="date" clearable />
            </div>

            <!-- Filtro de Tipo de Delito -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select v-model="filtroTipoDelito" label="Tipo de Delito" outlined dense :options="tiposDeDelito"
                clearable use-input input-debounce="0" @filter="filtrarTiposDelito" />
            </div>

            <!-- Botones de Acción -->
            <div class="col-12 col-sm-6 col-md-3 flex items-center q-gutter-sm">
              <q-btn label="Aplicar" color="primary" @click="aplicarFiltros" unelevated />
              <q-btn label="Limpiar" color="secondary" @click="limpiarFiltros" outline />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-table :rows="filasFiltradas" :columns="columns" row-key="id" :loading="cargando">
        <template v-slot:top>
          <div class="col-12 row items-center q-gutter-md">
            <div class="text-h6">Datos Cargados</div>
            <q-space />
            <q-input v-model="busquedaGeneral" outlined dense clearable placeholder="Buscar..."
              style="min-width: 300px">
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn color="primary" icon="print" label="Imprimir" @click="imprimirTabla" unelevated />
          </div>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn icon="edit" flat round dense @click="abrirModalEdicion(props.row)" />
            <q-btn icon="delete" flat round dense @click="confirmarEliminar(props.row)" class="q-ml-sm" />
          </q-td>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="modalVisible" position="right" full-height no-shadow>
      <q-card class="modal-right-panel">
        <q-card-section class="q-pa-md">
          <q-btn icon="close" flat round dense class="absolute-top-right q-ma-sm" @click="cerrarModal" />
          <div class="text-h6">Editar Marcador</div>
        </q-card-section>
        <q-card-section class="scroll q-pa-md">
          <q-input v-model="nuevoMarcador.nombre" label="Nombre" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.apellido" label="Apellido" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.dni" label="DNI" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.telefono" label="Teléfono" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.direccion" label="Dirección" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.numero_denuncia" label="Número de IPP" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.fiscal" label="Fiscal" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.barrio" label="Barrio" outlined class="q-mb-md" />
          <q-input v-model="nuevoMarcador.notas" label="Notas" type="textarea" outlined class="q-mb-md" />
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
import { ref, onMounted, computed } from 'vue';
import { useGisStore, type MarcadorSeg } from 'src/stores/gisStore';
import { useQuasar, date } from 'quasar'; // 🚀 CAMBIO 1: Importar 'date' de Quasar

const $q = useQuasar();
const gisStore = useGisStore();
const modalVisible = ref(false);
const nuevoMarcador = ref<Partial<MarcadorSeg>>({});
const cargando = ref(false);

// Variables para los filtros
const busquedaGeneral = ref<string>('');
const filtroFechaDesde = ref<string>('');
const filtroFechaHasta = ref<string>('');
const filtroTipoDelito = ref<string>('');
const tiposDeDelito = ref<string[]>([]);
const tiposDeDelitoCompletos = ref<string[]>([]);

// 🚀 FUNCIÓN DE FORMATO DE FECHA REUTILIZADA
/**
 * Formatea una fecha para ser mostrada en la tabla.
 * @param dateValue La fecha (Date, string, o undefined) a formatear.
 * @returns La fecha formateada como DD/MM/YYYY, o 'N/A'.
 */
function formatDisplayDate(dateValue: Date | string | undefined): string {
  if (!dateValue) return 'N/A';
  try {
    return date.formatDate(dateValue, 'DD/MM/YYYY');
  } catch { // 🚀 CAMBIO CLAVE: Eliminamos 'e' del catch
    // Si necesitas el error para depuración, descomenta la línea de abajo
    // y añade 'e' al catch (catch(e))
    // console.error('Error al formatear la fecha para visualización:', e);
    return 'Error de formato';
  }
}

// Computed para filtrar las filas
const filasFiltradas = computed(() => {
  let resultado = [...gisStore.marcadores];

  // Búsqueda general
  if (busquedaGeneral.value) {
    const busqueda = busquedaGeneral.value.toLowerCase().trim();
    resultado = resultado.filter((m) => {
      const nombre = m.nombre?.toLowerCase() || '';
      const apellido = m.apellido?.toLowerCase() || '';
      const dni = m.dni?.toLowerCase() || '';
      const direccion = m.direccion?.toLowerCase() || '';
      const barrio = m.barrio?.toLowerCase() || '';
      const numeroIPP = m.numero_denuncia?.toLowerCase() || '';
      const fiscal = m.fiscal?.toLowerCase() || '';

      return (
        nombre.includes(busqueda) ||
        apellido.includes(busqueda) ||
        dni.includes(busqueda) ||
        direccion.includes(busqueda) ||
        barrio.includes(busqueda) ||
        numeroIPP.includes(busqueda) ||
        fiscal.includes(busqueda)
      );
    });
  }

  // Filtro por fecha desde
  if (filtroFechaDesde.value) {
    const fechaDesde = new Date(filtroFechaDesde.value);
    resultado = resultado.filter((m) => {
      if (!m.fecha_inicio) return false;
      const fechaMarcador = new Date(m.fecha_inicio);
      return fechaMarcador >= fechaDesde;
    });
  }

  // Filtro por fecha hasta
  if (filtroFechaHasta.value) {
    const fechaHasta = new Date(filtroFechaHasta.value);
    fechaHasta.setHours(23, 59, 59, 999);
    resultado = resultado.filter((m) => {
      if (!m.fecha_inicio) return false;
      const fechaMarcador = new Date(m.fecha_inicio);
      return fechaMarcador <= fechaHasta;
    });
  }

  // Filtro por tipo de delito
  if (filtroTipoDelito.value) {
    resultado = resultado.filter((m) => {
      if (!m.delitos || m.delitos.length === 0) return false;
      return m.delitos.some((d) =>
        d.tipoDelito?.toLowerCase().includes(filtroTipoDelito.value.toLowerCase())
      );
    });
  }

  return resultado;
});

// Función para filtrar tipos de delito en el select
function filtrarTiposDelito(val: string, update: (callback: () => void) => void) {
  update(() => {
    if (val === '') {
      tiposDeDelito.value = tiposDeDelitoCompletos.value;
    } else {
      const needle = val.toLowerCase();
      tiposDeDelito.value = tiposDeDelitoCompletos.value.filter(
        (v) => v.toLowerCase().includes(needle)
      );
    }
  });
}

// Extraer tipos de delito únicos
function extraerTiposDeDelito() {
  const tipos = new Set<string>();
  gisStore.marcadores.forEach((marcador) => {
    if (marcador.delitos && marcador.delitos.length > 0) {
      marcador.delitos.forEach((delito) => {
        if (delito.tipoDelito) {
          tipos.add(delito.tipoDelito);
        }
      });
    }
  });
  tiposDeDelitoCompletos.value = Array.from(tipos).sort();
  tiposDeDelito.value = [...tiposDeDelitoCompletos.value];
}

// Aplicar filtros (en caso de querer recargar datos del store)
function aplicarFiltros() {
  $q.notify({
    type: 'info',
    message: 'Filtros aplicados',
    position: 'top',
    timeout: 1000,
  });
}

// Limpiar filtros
function limpiarFiltros() {
  busquedaGeneral.value = '';
  filtroFechaDesde.value = '';
  filtroFechaHasta.value = '';
  filtroTipoDelito.value = '';
  $q.notify({
    type: 'info',
    message: 'Filtros limpiados',
    position: 'top',
    timeout: 1000,
  });
}

function abrirModalEdicion(marcador: MarcadorSeg) {
  nuevoMarcador.value = { ...marcador };
  modalVisible.value = true;
}

function cerrarModal() {
  modalVisible.value = false;
}

async function guardarMarcador() {
  try {
    if (nuevoMarcador.value.id) {
      await gisStore.actualizarMarcador(nuevoMarcador.value as MarcadorSeg);
      $q.notify({
        type: 'positive',
        message: 'Marcador actualizado correctamente',
      });
    }
    cerrarModal();
  } catch (error) {
    console.error('Error al guardar el marcador:', error);
    $q.notify({ type: 'negative', message: 'Error al guardar el marcador.' });
  }
}

function confirmarEliminar(marcador: MarcadorSeg) {
  $q.dialog({
    title: 'Confirmación',
    message: '¿Estás seguro de que quieres eliminar este marcador?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void eliminarMarcador(marcador.id);
  });
}

async function eliminarMarcador(id: number) {
  try {
    await gisStore.eliminarMarcador(id);
    $q.notify({ type: 'negative', message: 'Marcador eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el marcador:', error);
    $q.notify({ type: 'negative', message: 'Error al eliminar el marcador.' });
  }
}

// Función para imprimir la tabla
function imprimirTabla() {
  const contenidoImpresion = generarHTMLParaImpresion();

  const ventanaImpresion = window.open('', '_blank');
  if (ventanaImpresion) {
    ventanaImpresion.document.write(contenidoImpresion);
    ventanaImpresion.document.close();
    ventanaImpresion.focus();

    // Esperar a que se cargue el contenido antes de imprimir
    ventanaImpresion.onload = () => {
      ventanaImpresion.print();
    };
  } else {
    $q.notify({
      type: 'negative',
      message: 'No se pudo abrir la ventana de impresión. Verifica los permisos del navegador.',
    });
  }
}

// Generar HTML para impresión
function generarHTMLParaImpresion(): string {
  const filas = filasFiltradas.value;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Datos de Marcadores</title>
      <style>
        @page {
          size: landscape;
          margin: 0;
        }
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          text-align: center;
          color: #1976d2;
          margin-bottom: 20px;
        }
        .info-filtros {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        .info-filtros p {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #1976d2;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .fecha-impresion {
          text-align: right;
          font-size: 11px;
          color: #666;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <h1>Datos de Marcadores</h1>
  `;

  // Agregar información de filtros si están activos
  if (filtroFechaDesde.value || filtroFechaHasta.value || filtroTipoDelito.value) {
    html += '<div class="info-filtros"><strong>Filtros aplicados:</strong>';
    if (filtroFechaDesde.value) {
      html += `<p>Fecha desde: ${formatDisplayDate(filtroFechaDesde.value)}</p>`;
    }
    if (filtroFechaHasta.value) {
      html += `<p>Fecha hasta: ${formatDisplayDate(filtroFechaHasta.value)}</p>`;
    }
    if (filtroTipoDelito.value) {
      html += `<p>Tipo de delito: ${filtroTipoDelito.value}</p>`;
    }
    html += '</div>';
  }

  html += `
      <table>
        <thead>
          <tr>
            <th>Fecha de Inicio</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Nro. IPP</th>
            <th>Fiscal</th>
            <th>Barrio</th>
            <th>Tipos de Delito</th>
          </tr>
        </thead>
        <tbody>
  `;

  filas.forEach((row) => {
    const delitos = row.delitos && row.delitos.length > 0
      ? row.delitos.map(d => d.tipoDelito).filter(Boolean).join(', ')
      : 'N/A';

    html += `
      <tr>
        <td>${formatDisplayDate(row.fecha_inicio)}</td>
        <td>${row.nombre || 'N/A'}</td>
        <td>${row.apellido || 'N/A'}</td>
        <td>${row.dni || 'N/A'}</td>
        <td>${row.telefono || 'N/A'}</td>
        <td>${row.direccion || 'N/A'}</td>
        <td>${row.numero_denuncia || 'N/A'}</td>
        <td>${row.fiscal || 'N/A'}</td>
        <td>${row.barrio || 'N/A'}</td>
        <td>${delitos}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
      <p class="fecha-impresion">Impreso el: ${date.formatDate(new Date(), 'DD/MM/YYYY HH:mm')}</p>
    </body>
    </html>
  `;

  return html;
}

onMounted(async () => {
  // Aseguramos que los datos se carguen para la tabla
  cargando.value = true;
  try {
    await gisStore.cargarDatosParaTabla();
    extraerTiposDeDelito();
  } finally {
    cargando.value = false;
  }
});

const columns = [
  // 🚀 CAMBIO 2: NUEVA COLUMNA PARA LA FECHA DE INICIO
  {
    name: 'fecha_inicio',
    label: 'Fecha de Inicio',
    align: 'left' as const,
    field: 'fecha_inicio',
    sortable: true,
    format: (val: string | Date | undefined) => formatDisplayDate(val),
  },
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left' as const,
    field: 'nombre',
    sortable: true,
  },
  {
    name: 'apellido',
    required: true,
    label: 'Apellido',
    align: 'left' as const,
    field: 'apellido',
    sortable: true,
  },
  {
    name: 'dni',
    label: 'DNI',
    align: 'left' as const,
    field: 'dni',
    sortable: true,
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    align: 'left' as const,
    field: 'telefono',
    sortable: true,
  },
  {
    name: 'direccion',
    label: 'Dirección',
    align: 'left' as const,
    field: 'direccion',
    sortable: true,
  },
  {
    name: 'numero_denuncia',
    label: 'Nro. IPP',
    align: 'left' as const,
    field: 'numero_denuncia',
    sortable: true,
  },
  {
    name: 'fiscal',
    label: 'Fiscal',
    align: 'left' as const,
    field: 'fiscal',
    sortable: true,
  },
  {
    name: 'barrio',
    label: 'Barrio',
    align: 'left' as const,
    field: 'barrio',
    sortable: true,
  },
  {
    name: 'delitos',
    label: 'Tipos de Delito',
    align: 'left' as const,
    field: (row: MarcadorSeg) => {
      if (!row.delitos || row.delitos.length === 0) return 'N/A';
      return row.delitos.map(d => d.tipoDelito).filter(Boolean).join(', ');
    },
    sortable: false,
  },

  { name: 'acciones', label: 'Acciones', align: 'right' as const, field: 'acciones' },
];
</script>

<style scoped>
/* Estilos para el modal del lado derecho, si no los tienes aún */
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
</style>
