import type { ButtonHTMLAttributes, FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { DeathmodeLinkComponent, DeathmodeLinkProps } from './types';

export function DefaultLink({ children, ...props }: DeathmodeLinkProps) {
  return <a {...props}>{children}</a>;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: ReactNode;
  size?: 'sm' | 'md';
  tone?: 'primary' | 'neutral';
  variant?: 'primary' | 'secondary';
  width?: 'auto' | 'full';
}

export function Button({
  children,
  className,
  disabled,
  loading = false,
  loadingLabel,
  size = 'md',
  tone = 'primary',
  type = 'button',
  variant = 'primary',
  width = 'auto',
  ...props
}: ButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={[
        'duel-button', `duel-button-${variant}`, `duel-button-tone-${tone}`, `duel-button-size-${size}`,
        `duel-button-width-${width}`, loading ? 'is-loading' : '', className ?? ''
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      type={type}
    >
      <span className="duel-button-label">{loading ? loadingLabel ?? t('common.processing') : children}</span>
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  href,
  linkComponent: Link = DefaultLink,
  size = 'md',
  tone = 'primary',
  variant = 'primary'
}: {
  children: ReactNode;
  className?: string;
  href: string;
  linkComponent?: DeathmodeLinkComponent;
  size?: 'sm' | 'md';
  tone?: 'primary' | 'neutral';
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Link
      className={[
        'duel-button', `duel-button-${variant}`, `duel-button-tone-${tone}`, `duel-button-size-${size}`, className ?? ''
      ].filter(Boolean).join(' ')}
      href={href}
    >
      <span className="duel-button-label">{children}</span>
    </Link>
  );
}

export type SubmitHandler = (event: FormEvent<HTMLFormElement>) => void;
