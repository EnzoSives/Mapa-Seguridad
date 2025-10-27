<template>
    <q-page padding>
        <div v-if="mounted" class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6">Marcadores por mes</div>
                        <apexchart type="line" height="350" :options="lineChartOptions" :series="lineChartSeries" />
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6">Marcadores por barrio (Top 10)</div>
                        <apexchart type="bar" height="350" :options="barChartOptions" :series="barChartSeries" />
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6">Distribución por tipo de delito</div>
                        <apexchart type="pie" height="350" :options="pieChartOptions" :series="pieChartSeries" />
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6">Abiertos vs cerrados por mes</div>
                        <apexchart type="area" height="350" :options="areaChartOptions" :series="areaChartSeries" />
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <div v-else class="fullscreen flex flex-center">
            <q-spinner-dots color="primary" size="2em" />
        </div>

    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGisStore } from 'src/stores/gisStore'
// Composable con opciones/series listas
import { useDashboardCharts } from 'src/composables/useDashboardCharts'

// Paso 3: Flag para el renderizado en cliente
const mounted = ref(false)

// Paso 4: Llama al composable para obtener los datos
const {
    lineChartOptions,
    lineChartSeries,
    barChartOptions,
    barChartSeries,
    pieChartOptions,
    pieChartSeries,
    areaChartOptions,
    areaChartSeries
} = useDashboardCharts()

// Paso 5: Carga datos si hace falta y activa el flag cuando el componente esté montado
const gisStore = useGisStore()
onMounted(async () => {
    try {
        if (gisStore.allMarcadores.length === 0 && gisStore.marcadores.length === 0) {
            await gisStore.cargarDatosParaTabla()
        }
    } catch (e) {
        console.error('No se pudieron cargar los datos para los charts:', e)
    } finally {
        mounted.value = true
    }
})
</script>

<style scoped>
/* El fondo ahora se controla mejor desde q-page-container o layout */
.q-card {
    height: 100%;
}
</style>