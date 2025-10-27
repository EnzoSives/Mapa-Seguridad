// src/composables/useDashboardCharts.ts

import { computed } from 'vue'
import { useQuasar, getCssVar } from 'quasar'
import { useGisStore, type MarcadorSeg } from 'src/stores/gisStore'
import type { ApexOptions } from 'apexcharts' // Tip-only import para satisfacer ESLint/TS

export function useDashboardCharts() {
  const $q = useQuasar()
  const gisStore = useGisStore()

  // Fuente de datos: prioriza los visibles (filtrados), si no, usa todos
  const markers = computed<MarcadorSeg[]>(() => {
    return (gisStore.marcadores && gisStore.marcadores.length > 0)
      ? gisStore.marcadores
      : gisStore.allMarcadores
  })

  // Helpers
  function countBy<T>(arr: T[], keyGetter: (item: T) => string | number | undefined | null) {
    const map = new Map<string, number>()
    for (const item of arr) {
      const keyRaw = keyGetter(item)
      const key = (keyRaw ?? 'Desconocido') + ''
      map.set(key, (map.get(key) || 0) + 1)
    }
    return map
  }

  function formatYearMonth(d: Date | string | undefined) {
    if (!d) return 'Sin fecha'
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return 'Sin fecha'
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }

  // Opciones base reactivas al tema
  const baseChartOptions = computed<ApexOptions>(() => ({
    chart: {
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      },
      // ¡Aquí está la magia!
      foreColor: $q.dark.isActive ? '#f5f5f5' : '#333' // Color del texto
    },
    // Sincroniza el tema de Apex con el de Quasar
    theme: {
      mode: $q.dark.isActive ? 'dark' : 'light'
    },
    // Usa los colores del tema actual de Quasar (CSS vars)
    colors: [
      getCssVar('primary') || '#1976d2',
      getCssVar('secondary') || '#26A69A',
      getCssVar('positive') || '#21BA45',
      getCssVar('warning') || '#F2C037',
      getCssVar('negative') || '#C10015'
    ],
    grid: {
      borderColor: $q.dark.isActive ? '#555' : '#e0e0e0',
      row: {
        colors: $q.dark.isActive ? ['transparent', 'rgba(0,0,0,0.2)'] : ['#f3f3f3', 'transparent'],
        opacity: 0.5
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    }
  }))

  // --- Line Chart: Marcadores por mes (fecha_inicio) ---
  const monthlyAgg = computed(() => {
    const counts = countBy(markers.value, m => formatYearMonth(m.fecha_inicio as unknown as Date))
    const entries = Array.from(counts.entries()).filter(([k]) => k !== 'Sin fecha')
    entries.sort(([a], [b]) => a.localeCompare(b))
    const categories = entries.map(([k]) => k)
    const data = entries.map(([, v]) => v)
    return { categories, data }
  })

  const lineChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, id: 'marcadores-por-mes' },
    xaxis: { categories: monthlyAgg.value.categories },
    title: { text: 'Marcadores por mes', align: 'left' },
  }))

  const lineChartSeries = computed(() => [{
    name: 'Marcadores',
    data: monthlyAgg.value.data
  }])

  // --- Bar Chart: Marcadores por barrio (top 10) ---
  const barriosAgg = computed(() => {
    const counts = countBy(markers.value, m => m.barrio || 'Sin barrio')
    const entries = Array.from(counts.entries())
    entries.sort((a, b) => b[1] - a[1])
    const top = entries.slice(0, 10)
    return { categories: top.map(([k]) => k), data: top.map(([, v]) => v) }
  })

  const barChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, id: 'marcadores-por-barrio' },
    plotOptions: { bar: { borderRadius: 8, horizontal: false, columnWidth: '60%' } },
    xaxis: { categories: barriosAgg.value.categories },
    yaxis: { title: { text: 'Cantidad' } },
    title: { text: 'Marcadores por barrio (Top 10)', align: 'left' },
    colors: [getCssVar('primary') || '#1976d2']
  }))

  const barChartSeries = computed(() => [{ name: 'Marcadores', data: barriosAgg.value.data }])

  // --- Pie Chart: Distribución por tipo de delito ---
  const delitosAgg = computed(() => {
    const allDelitos = markers.value.flatMap(m => (m.delitos && m.delitos.length ? m.delitos : [{ tipoDelito: 'Sin delito' }]))
    const counts = countBy(allDelitos, d => d.tipoDelito || 'Sin delito')
    const entries = Array.from(counts.entries())
    entries.sort((a, b) => b[1] - a[1])
    const top = entries.slice(0, 8)
    // Si no hay nada, crea un placeholder
    if (top.length === 0) return { labels: ['Sin datos'], series: [1] }
    return { labels: top.map(([k]) => k), series: top.map(([, v]) => v) }
  })

  const pieChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { type: 'pie', width: '100%' },
    labels: delitosAgg.value.labels,
    title: { text: 'Distribución por tipo de delito', align: 'left' },
    colors: [
      getCssVar('primary') || '#1976d2',
      getCssVar('positive') || '#21BA45',
      getCssVar('warning') || '#F2C037',
      getCssVar('negative') || '#C10015',
      getCssVar('secondary') || '#26A69A',
      '#9C27B0', '#FF9800', '#795548'
    ],
    legend: { position: 'bottom' },
    responsive: [{ breakpoint: 480, options: { chart: { width: 240 }, legend: { position: 'bottom' } } }]
  }))

  const pieChartSeries = computed(() => delitosAgg.value.series)

  // --- Area Chart: Casos abiertos vs cerrados por mes ---
  const openClosedAgg = computed(() => {
    const open = new Map<string, number>()
    const closed = new Map<string, number>()
    for (const m of markers.value) {
      const key = formatYearMonth(m.fecha_inicio as unknown as Date)
      if (!m.fecha_fin) {
        open.set(key, (open.get(key) || 0) + 1)
      } else {
        closed.set(key, (closed.get(key) || 0) + 1)
      }
    }
    const keys = Array.from(new Set([...open.keys(), ...closed.keys()])).filter(k => k !== 'Sin fecha')
    keys.sort((a, b) => a.localeCompare(b))
    const openData = keys.map(k => open.get(k) || 0)
    const closedData = keys.map(k => closed.get(k) || 0)
    return { categories: keys, openData, closedData }
  })

  const areaChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, type: 'area', height: 350, stacked: false },
    stroke: { ...baseChartOptions.value.stroke, width: [3, 3] },
    title: { text: 'Abiertos vs cerrados por mes', align: 'left' },
    xaxis: { categories: openClosedAgg.value.categories, title: { text: 'Mes' } },
    colors: [getCssVar('primary') || '#1976d2', getCssVar('secondary') || '#26A69A'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, inverseColors: false, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100, 100, 100] } },
  }))

  const areaChartSeries = computed(() => [
    { name: 'Abiertos', data: openClosedAgg.value.openData },
    { name: 'Cerrados', data: openClosedAgg.value.closedData }
  ])

  // Retornamos todo lo que el componente necesita
  return {
    lineChartOptions,
    lineChartSeries,
    barChartOptions,
    barChartSeries,
    pieChartOptions,
    pieChartSeries,
    areaChartOptions,
    areaChartSeries
  }
}