import type { PropsWithChildren, ReactNode } from 'react';

export type GSCardProps = PropsWithChildren<{
  title: string;
  actions?: ReactNode;
  className?: string;
}>;

export function GSCard({ title, actions, className = '', children }: GSCardProps) {
  return (
    <section className={`rounded-lg border border-border bg-surface p-4 shadow-elev-1 ${className}`.trim()}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-base text-text">{title}</h3>
        {actions ? <div className="flex gap-2 text-sm text-muted">{actions}</div> : null}
      </div>
      <div className="mt-3 text-sm text-muted">{children}</div>
    </section>
  );
}

export default GSCard;
