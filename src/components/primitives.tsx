import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../lib/cn';

/* -------------------------------------------------------------------------- */
/* PersianText                                                               */
/* -------------------------------------------------------------------------- */

export interface PersianTextProps {
  children: ReactNode;
  /** Raw inline style escape hatch, used by the video for frame-driven motion. */
  style?: CSSProperties;
  className?: string;
  weight?: 400 | 500 | 600 | 700 | 800;
  size?: number | string;
  tone?: 'default' | 'muted' | 'dim' | 'amber' | 'green' | 'red';
  /** Wrap long text instead of forcing one line. */
  wrap?: boolean;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

const TONE_CLASS: Record<NonNullable<PersianTextProps['tone']>, string> = {
  default: '',
  muted: 't-muted',
  dim: 't-dim',
  amber: 't-amber',
  green: 't-green',
  red: 't-red',
};

/**
 * Every piece of Persian copy goes through here so `lang`/`dir` can never be
 * lost — which is what keeps Arabic shaping correct in both the browser and
 * the Chromium renderer used by Remotion.
 */
export function PersianText({
  children,
  style,
  className,
  weight,
  size,
  tone = 'default',
  wrap = true,
  as: Tag = 'span',
}: PersianTextProps) {
  return (
    <Tag
      lang="fa"
      dir="rtl"
      className={cn(TONE_CLASS[tone], wrap ? undefined : 't-clip', className)}
      style={{
        ...(weight ? { fontWeight: weight } : null),
        ...(size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : null),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* Panel                                                                     */
/* -------------------------------------------------------------------------- */

export interface PanelProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  variant?: 'default' | 'raised' | 'accent';
  /** Remove body padding, e.g. for tables. */
  flush?: boolean;
}

export function Panel({
  title,
  subtitle,
  actions,
  footer,
  children,
  className,
  bodyClassName,
  variant = 'default',
  flush = false,
}: PanelProps) {
  return (
    <section
      className={cn(
        'panel',
        variant === 'raised' && 'panel--raised',
        variant === 'accent' && 'panel--accent',
        className,
      )}
    >
      {(title || actions) && (
        <header className="panel__head">
          <div className="panel__heading">
            {title ? <div className="panel__title">{title}</div> : null}
            {subtitle ? <div className="panel__subtitle">{subtitle}</div> : null}
          </div>
          {actions ? <div className="panel__actions">{actions}</div> : null}
        </header>
      )}
      <div className={cn('panel__body', flush && 'panel__body--flush', bodyClassName)}>
        {children}
      </div>
      {footer ? <footer className="panel__foot">{footer}</footer> : null}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Button                                                                    */
/* -------------------------------------------------------------------------- */

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  disabled?: boolean;
  block?: boolean;
  title?: string;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  block = false,
  title,
  className,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'btn',
        variant !== 'default' && `btn--${variant}`,
        size === 'sm' && 'btn--sm',
        block && 'btn--block',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Status pill                                                               */
/* -------------------------------------------------------------------------- */

export type PillTone = 'neutral' | 'amber' | 'green' | 'red' | 'blue' | 'live';

export interface StatusPillProps {
  children: ReactNode;
  tone?: PillTone;
  dot?: boolean;
  className?: string;
}

export function StatusPill({
  children,
  tone = 'neutral',
  dot = false,
  className,
}: StatusPillProps) {
  return (
    <span className={cn('pill', `pill--${tone}`, className)}>
      {dot ? <span className="pill__dot" /> : null}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                               */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
}

export function EmptyState({ icon, title, body }: EmptyStateProps) {
  return (
    <div className="empty">
      {icon ? <div className="empty__icon">{icon}</div> : null}
      <div className="empty__title">{title}</div>
      {body ? <div className="empty__body">{body}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section head                                                              */
/* -------------------------------------------------------------------------- */

export function SectionHead({
  title,
  hint,
  actions,
}: {
  title: ReactNode;
  hint?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div className="section-head__title">{title}</div>
      <div className="row" style={{ gap: 12 }}>
        {hint ? <span className="section-head__hint">{hint}</span> : null}
        {actions}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Key / value                                                               */
/* -------------------------------------------------------------------------- */

export function KeyValue({
  label,
  value,
  total = false,
  tone,
}: {
  label: ReactNode;
  value: ReactNode;
  total?: boolean;
  tone?: 'default' | 'green' | 'red' | 'amber';
}) {
  const toneClass =
    tone === 'green' ? 't-green' : tone === 'red' ? 't-red' : tone === 'amber' ? 't-amber' : '';
  return (
    <div className={cn('kv', total && 'kv--total')}>
      <span className="kv__k">{label}</span>
      <span className={cn('kv__v', toneClass)}>{value}</span>
    </div>
  );
}
