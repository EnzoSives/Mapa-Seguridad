<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-table
        title="Datos de Marcadores"
        :rows="gisStore.marcadores"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn icon="edit" flat round dense @click="abrirModalEdicion(props.row)" />
            <q-btn icon="delete" flat round dense @click="confirmarEliminar(props.row)" class="q-ml-sm"/>
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
import { useQuasar } from 'quasar';

const $q = useQuasar();
const gisStore = useGisStore();
const modalVisible = ref(false);
const nuevoMarcador = ref<Partial<MarcadorSeg>>({});

// Mapea y reutiliza la lógica de MapVue.vue aquí
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
      $q.notify({ type: 'positive', message: 'Marcador actualizado correctamente' });
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
  if (gisStore.marcadores.length === 0) {
    await gisStore.cargarMarcadores();
  }
});

const columns = [
  { name: 'nombre', required: true, label: 'Nombre', align: "left" as const, field: 'nombre', sortable: true },
  { name: 'apellido', required: true, label: 'Apellido', align: "left" as const, field: 'apellido', sortable: true },
  { name: 'dni', label: 'DNI', align: "left" as const, field: 'dni', sortable: true },
  { name: 'telefono', label: 'Teléfono', align: "left" as const, field: 'telefono', sortable: true },
  { name: 'direccion', label: 'Dirección', align: "left" as const, field: 'direccion', sortable: true },
  { name: 'latitud', label: 'Latitud', align: "left" as const, field: 'latitud' },
  { name: 'longitud', label: 'Longitud', align: "left" as const, field: 'longitud' },
  { name: 'acciones', label: 'Acciones', align: 'right' as const, field: 'acciones' }
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