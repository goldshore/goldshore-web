export type KPIProps = {
  label: string;
  value: string;
  delta: number | string;
  className?: string;
};

export function KPI({ label, value, delta, className = '' }: KPIProps) {
  const numericDelta = typeof delta === 'number' ? delta : Number.parseFloat(delta);
  const isPositive = Number.isFinite(numericDelta) ? numericDelta >= 0 : String(delta).startsWith('+');
  const formattedDelta = typeof delta === 'number' ? `${delta >= 0 ? '+' : ''}${delta}%` : delta;

  return (
    <div className={`rounded-lg border border-border bg-surface/60 p-4 ${className}`.trim()}>
      <div className="text-xs uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className="mt-1 font-mono text-2xl text-text">{value}</div>
      <div className={`mt-1 text-xs ${isPositive ? 'text-success' : 'text-error'}`}>{formattedDelta}</div>
    </div>
  );
}

export default KPI;
