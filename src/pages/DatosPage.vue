// src/pages/DatosPage.vue
<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-table title="Datos de Marcadores" :rows="gisStore.marcadores" :columns="columns" row-key="id">
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
import { ref, onMounted } from 'vue';
import { useGisStore, type MarcadorSeg } from 'src/stores/gisStore';
import { useQuasar, date } from 'quasar'; // 🚀 CAMBIO 1: Importar 'date' de Quasar

const $q = useQuasar();
const gisStore = useGisStore();
const modalVisible = ref(false);
const nuevoMarcador = ref<Partial<MarcadorSeg>>({});

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

onMounted(async () => {
  // Aseguramos que los datos se carguen para la tabla
  await gisStore.cargarDatosParaTabla();
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
  { name: 'latitud', label: 'Latitud', align: 'left' as const, field: 'latitud' },
  { name: 'longitud', label: 'Longitud', align: 'left' as const, field: 'longitud' },
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
