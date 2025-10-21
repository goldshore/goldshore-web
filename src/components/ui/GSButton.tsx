import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export type GSButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function GSButton({ children, className = '', style, ...props }: GSButtonProps) {
  return (
    <button
      {...props}
      style={{
        transitionDuration: 'var(--dur)',
        transitionTimingFunction: 'var(--ease)',
        ...style
      }}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--brand)] text-[var(--brand-contrast)] shadow-elev-1 transition-[filter,transform] hover:brightness-105 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export default GSButton;
