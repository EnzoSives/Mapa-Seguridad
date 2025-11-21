<template>
    <q-page padding>
        <div v-if="mounted" class="row q-col-gutter-sm">
            <div class="col-12 col-md-6 col-lg-4">
                <q-card class="chart-card">
                    <q-card-section>
                        <div class="chart-header row items-center justify-between">
                            <div class="text-h6">Marcadores por mes</div>
                            <div class="chart-actions row q-gutter-xs">
                                <q-btn dense flat round icon="download" @click="descargarGrafico('chart-marcadores-por-mes', 'marcadores-por-mes')"
                                    :aria-label="'Descargar gráfico marcadores por mes'" />
                            </div>
                        </div>
                        <apexchart type="line" :height="chartHeight" :options="lineChartOptions" :series="lineChartSeries" />
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
                <q-card class="chart-card">
                    <q-card-section>
                        <div class="chart-header row items-center justify-between">
                            <div class="text-h6">Marcadores por barrio</div>
                            <div class="chart-actions row q-gutter-xs">
                                <q-btn dense flat round icon="download" @click="descargarGrafico('chart-marcadores-por-barrio', 'marcadores-por-barrio')"
                                    :aria-label="'Descargar gráfico marcadores por barrio'" />
                            </div>
                        </div>
                        <apexchart type="bar" :height="chartHeight" :options="barChartOptions" :series="barChartSeries" />
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
                <q-card class="chart-card">
                    <q-card-section>
                        <div class="chart-header row items-center justify-between">
                            <div class="text-h6">Participación por barrio (Top 5)</div>
                            <div class="chart-actions row q-gutter-xs">
                                <q-btn dense flat round icon="download" @click="descargarGrafico('chart-radial-barrio', 'participacion-por-barrio')"
                                    :aria-label="'Descargar gráfico radial por barrio'" />
                            </div>
                        </div>
                        <apexchart type="radialBar" :height="chartHeight" :options="radialBarChartOptions" :series="radialBarChartSeries" />
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
                <q-card class="chart-card">
                    <q-card-section>
                        <div class="chart-header row items-center justify-between">
                            <div class="text-h6">Distribución por tipo de delito</div>
                            <div class="chart-actions row q-gutter-xs">
                                <q-btn dense flat round icon="download" @click="descargarGrafico('chart-delitos-pie', 'distribucion-delitos')"
                                    :aria-label="'Descargar gráfico de delitos'" />
                            </div>
                        </div>
                        <apexchart type="pie" :height="chartHeight" :options="pieChartOptions" :series="pieChartSeries" />
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
                <q-card class="chart-card">
                    <q-card-section>
                        <div class="chart-header row items-center justify-between">
                            <div class="text-h6">Marcadores por fecha</div>
                            <div class="chart-actions row q-gutter-xs">
                                <q-btn dense flat round icon="download" @click="descargarGrafico('chart-marcadores-por-fecha', 'marcadores-por-fecha')"
                                    :aria-label="'Descargar gráfico marcadores por fecha'" />
                            </div>
                        </div>
                        <apexchart type="bar" :height="chartHeight" :options="markersByDateChartOptions" :series="markersByDateChartSeries" />
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-md-6 col-lg-4">
                <q-card class="chart-card">
                    <q-card-section>
                        <div class="chart-header row items-center justify-between">
                            <div class="text-h6">Marcadores mensuales y acumulados</div>
                            <div class="chart-actions row q-gutter-xs">
                                <q-btn dense flat round icon="download" @click="descargarGrafico('chart-mensual-total', 'marcadores-mensuales-acumulado')"
                                    :aria-label="'Descargar gráfico mensual/acumulado'" />
                            </div>
                        </div>
                        <apexchart type="line" :height="chartHeight" :options="monthlyTotalsChartOptions" :series="monthlyTotalsChartSeries" />
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
import ApexCharts from 'apexcharts'
import { useGisStore } from 'src/stores/gisStore'
// Composable con opciones/series listas
import { useDashboardCharts } from 'src/composables/useDashboardCharts'

// Paso 3: Flag para el renderizado en cliente
const mounted = ref(false)
const chartHeight = 260

// Paso 4: Llama al composable para obtener los datos
const {
    lineChartOptions,
    lineChartSeries,
    barChartOptions,
    barChartSeries,
    pieChartOptions,
    pieChartSeries,
    markersByDateChartOptions,
    markersByDateChartSeries,
    radialBarChartOptions,
    radialBarChartSeries,
    monthlyTotalsChartOptions,
    monthlyTotalsChartSeries
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

const descargarGrafico = async (chartId: string, filename: string) => {
    try {
        const data = await ApexCharts.exec(chartId, 'dataURI')
        if (!data?.imgURI) {
            throw new Error('No se pudo generar la imagen')
        }
        const link = document.createElement('a')
        link.href = data.imgURI
        link.download = `${filename || chartId}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error(`No se pudo descargar el gráfico ${chartId}:`, error)
    }
}
</script>

<style scoped>
/* El fondo ahora se controla mejor desde q-page-container o layout */
.chart-card {
    height: 100%;
    min-height: 300px;
}

.chart-card :deep(.q-card__section) {
    padding: 12px;
}

.chart-header {
    gap: 8px;
}

.chart-actions {
    flex-wrap: nowrap;
}
</style>
