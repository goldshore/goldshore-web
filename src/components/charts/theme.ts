import type { ChartOptions } from 'chart.js';

export const gsChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(18,19,24,.9)',
      borderColor: 'var(--border)',
      borderWidth: 1,
      titleColor: 'var(--gs-bone)',
      bodyColor: 'var(--gs-bone)',
      padding: 10
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,.06)' },
      ticks: { color: 'var(--muted)' }
    },
    y: {
      grid: { color: 'rgba(255,255,255,.06)' },
      ticks: { color: 'var(--muted)' }
    }
  },
  elements: {
    line: { tension: 0.2 },
    point: { radius: 0 }
  }
};

export const gsColors = {
  line: 'rgba(227,179,65,.9)',
  area: 'linear-gradient(180deg, rgba(227,179,65,.35), rgba(227,179,65,0))'
};
