// src/composables/useDashboardCharts.ts

import { computed } from 'vue';
import { useQuasar, getCssVar } from 'quasar';
import { useGisStore, type MarcadorSeg } from 'src/stores/gisStore';
import type { ApexOptions } from 'apexcharts'; // Tip-only import para satisfacer ESLint/TS

export function useDashboardCharts() {
  const $q = useQuasar();
  const gisStore = useGisStore();

  // Fuente de datos: prioriza los visibles (filtrados), si no, usa todos
  const markers = computed<MarcadorSeg[]>(() => {
    return gisStore.marcadores && gisStore.marcadores.length > 0
      ? gisStore.marcadores
      : gisStore.allMarcadores;
  });

  // Helpers
  function countBy<T>(arr: T[], keyGetter: (item: T) => string | number | undefined | null) {
    const map = new Map<string, number>();
    for (const item of arr) {
      const keyRaw = keyGetter(item);
      const key = (keyRaw ?? 'Desconocido') + '';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }

  function formatYearMonth(d: Date | string | undefined) {
    if (!d) return 'Sin fecha';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'Sin fecha';
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  function formatFullDate(d: Date | string | undefined) {
    if (!d) return 'Sin fecha';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'Sin fecha';
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Opciones base reactivas al tema
  const baseChartOptions = computed<ApexOptions>(() => ({
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      // ¡Aquí está la magia!
      foreColor: $q.dark.isActive ? '#f5f5f5' : '#333', // Color del texto
    },
    // Sincroniza el tema de Apex con el de Quasar
    theme: {
      mode: $q.dark.isActive ? 'dark' : 'light',
    },
    // Usa los colores del tema actual de Quasar (CSS vars)
    colors: [
      getCssVar('primary') || '#1976d2',
      getCssVar('secondary') || '#26A69A',
      getCssVar('positive') || '#21BA45',
      getCssVar('warning') || '#F2C037',
      getCssVar('negative') || '#C10015',
    ],
    grid: {
      borderColor: $q.dark.isActive ? '#555' : '#e0e0e0',
      row: {
        colors: $q.dark.isActive ? ['transparent', 'rgba(0,0,0,0.2)'] : ['#f3f3f3', 'transparent'],
        opacity: 0.5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
  }));

  // --- Line Chart: Marcadores por mes (fecha_inicio) ---
  const monthlyAgg = computed(() => {
    const counts = countBy(markers.value, (m) =>
      formatYearMonth(m.fecha_inicio as unknown as Date),
    );
    const entries = Array.from(counts.entries()).filter(([k]) => k !== 'Sin fecha');
    entries.sort(([a], [b]) => a.localeCompare(b));
    const categories = entries.map(([k]) => k);
    const data = entries.map(([, v]) => v);
    return { categories, data };
  });

  const lineChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, id: 'chart-marcadores-por-mes' },
    xaxis: { categories: monthlyAgg.value.categories },
    title: { text: 'Marcadores por mes', align: 'left' },
  }));

  const lineChartSeries = computed(() => [
    {
      name: 'Marcadores',
      data: monthlyAgg.value.data,
    },
  ]);

  // --- Bar Chart: Marcadores por barrio (top 10) ---
  const barriosAgg = computed(() => {
    const counts = countBy(markers.value, (m) => m.barrio || 'Sin barrio');
    const entries = Array.from(counts.entries());
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 10);
    return { categories: top.map(([k]) => k), data: top.map(([, v]) => v) };
  });

  const barChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, id: 'chart-marcadores-por-barrio' },
    plotOptions: { bar: { borderRadius: 8, horizontal: false, columnWidth: '60%' } },
    xaxis: { categories: barriosAgg.value.categories },
    yaxis: { title: { text: 'Cantidad' } },
    title: { text: 'Marcadores por barrio', align: 'left' },
    colors: [getCssVar('primary') || '#1976d2'],
  }));

  const barChartSeries = computed(() => [{ name: 'Marcadores', data: barriosAgg.value.data }]);

  // --- Pie Chart: Distribución por tipo de delito ---
  const delitosAgg = computed(() => {
    const allDelitos = markers.value.flatMap((m) =>
      m.delitos && m.delitos.length ? m.delitos : [{ tipoDelito: 'Sin delito' }],
    );
    const counts = countBy(allDelitos, (d) => d.tipoDelito || 'Sin delito');
    const entries = Array.from(counts.entries());
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 8);
    // Si no hay nada, crea un placeholder
    if (top.length === 0) return { labels: ['Sin datos'], series: [1] };
    return { labels: top.map(([k]) => k), series: top.map(([, v]) => v) };
  });

  const pieChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, type: 'pie', width: '100%', id: 'chart-delitos-pie' },
    labels: delitosAgg.value.labels,
    title: { text: 'Distribución por tipo de delito', align: 'left' },
    colors: [
      getCssVar('primary') || '#1976d2',
      getCssVar('positive') || '#21BA45',
      getCssVar('warning') || '#F2C037',
      getCssVar('negative') || '#C10015',
      getCssVar('secondary') || '#26A69A',
      '#9C27B0',
      '#FF9800',
      '#795548',
    ],
    legend: { position: 'bottom' },
    responsive: [
      { breakpoint: 480, options: { chart: { width: 240 }, legend: { position: 'bottom' } } },
    ],
  }));

  const pieChartSeries = computed(() => delitosAgg.value.series);

  // --- Column Chart: Marcadores por fecha ---
  const markersByDateAgg = computed(() => {
    const counts = countBy(markers.value, (m) => formatFullDate(m.fecha_inicio as unknown as Date));
    const entries = Array.from(counts.entries()).filter(([k]) => k !== 'Sin fecha');
    entries.sort(([a], [b]) => a.localeCompare(b));
    return {
      categories: entries.map(([k]) => k),
      data: entries.map(([, v]) => v),
    };
  });

  const markersByDateChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, type: 'bar', id: 'chart-marcadores-por-fecha' },
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: markersByDateAgg.value.categories,
      labels: { rotate: -45 },
    },
    yaxis: { title: { text: 'Marcadores' } },
    title: { text: 'Marcadores por fecha', align: 'left' },
  }));

  const markersByDateChartSeries = computed(() => [
    { name: 'Marcadores', data: markersByDateAgg.value.data },
  ]);

  // --- Radial Chart: Participación por barrio (Top 5) ---
  const radialBarAgg = computed(() => {
    const counts = countBy(markers.value, (m) => m.barrio || 'Sin barrio');
    const entries = Array.from(counts.entries());
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 5);
    const total = top.reduce((acc, [, value]) => acc + value, 0);
    return {
      labels: top.map(([label]) => label),
      data: top.map(([, value]) => value),
      total,
    };
  });

  const radialBarChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, type: 'radialBar', id: 'chart-radial-barrio' },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { fontSize: '14px' },
          value: { fontSize: '16px' },
          total: {
            show: true,
            label: 'Total',
            formatter: () => radialBarAgg.value.total.toString(),
          },
        },
      },
    },
    labels: radialBarAgg.value.labels,
    title: { text: 'Participación por barrio (Top 5)', align: 'left' },
  }));

  const radialBarChartSeries = computed(() => radialBarAgg.value.data);

  // --- Combo Chart: Mensuales vs acumulado ---
  const monthlyTotalsAgg = computed(() => {
    const categories = monthlyAgg.value.categories;
    const monthlyData = monthlyAgg.value.data;
    let cumulative = 0;
    const cumulativeData = monthlyData.map((value) => {
      cumulative += value;
      return cumulative;
    });
    return { categories, monthlyData, cumulativeData };
  });

  const monthlyTotalsChartOptions = computed<ApexOptions>(() => ({
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, id: 'chart-mensual-total', stacked: false },
    stroke: { ...baseChartOptions.value.stroke, width: [0, 3] },
    dataLabels: { enabled: true, enabledOnSeries: [1] },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 6 } },
    xaxis: { categories: monthlyTotalsAgg.value.categories },
    yaxis: [{ title: { text: 'Mensuales' } }, { opposite: true, title: { text: 'Acumulado' } }],
    title: { text: 'Marcadores mensuales y acumulados', align: 'left' },
    colors: [getCssVar('primary') || '#1976d2', getCssVar('secondary') || '#26A69A'],
  }));

  const monthlyTotalsChartSeries = computed(() => [
    { name: 'Mensuales', type: 'column', data: monthlyTotalsAgg.value.monthlyData },
    { name: 'Acumulado', type: 'line', data: monthlyTotalsAgg.value.cumulativeData },
  ]);

  // Retornamos todo lo que el componente necesita
  return {
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
    monthlyTotalsChartSeries,
  };
}
