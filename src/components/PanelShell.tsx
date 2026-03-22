import { type ReactNode } from 'react';

interface PanelShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  eyebrow?: string;
}

export function PanelShell({ title, subtitle, action, children, eyebrow }: PanelShellProps) {
  return (
    <div className="flex flex-col h-full max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          {eyebrow && (
            <p className="eyebrow mb-2">{eyebrow}</p>
          )}
          <h1 className="panel-title mb-2">{title}</h1>
          {subtitle && (
            <p style={{ fontSize: '14px', color: 'var(--studio-ink-3)', lineHeight: 1.5, maxWidth: 480 }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="ml-8 flex-shrink-0 mt-1">{action}</div>}
      </div>
      <hr className="studio-divider" />
      <div className="flex-1 pt-6">{children}</div>
    </div>
  );
}

/* Reusable label for sections within panels */
export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow mb-3">{children}</p>
  );
}

/* Reusable primary button */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        backgroundColor: disabled ? 'var(--studio-ink-4)' : 'var(--studio-ink)',
        color: '#ffffff',
        border: 'none',
        borderRadius: 8,
        fontSize: '13px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '-0.01em',
        transition: 'all 0.15s',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'var(--studio-sans)',
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2a2a2a'; }}
      onMouseLeave={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--studio-ink)'; }}
    >
      {icon}
      {children}
    </button>
  );
}

/* Ghost button */
export function GhostButton({
  children,
  onClick,
  disabled,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        backgroundColor: 'transparent',
        color: 'var(--studio-ink-2)',
        border: '1px solid var(--studio-border)',
        borderRadius: 8,
        fontSize: '13px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        letterSpacing: '-0.01em',
        fontFamily: 'var(--studio-sans)',
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--studio-sidebar)'; }}
      onMouseLeave={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
    >
      {icon}
      {children}
    </button>
  );
}
