import { type ReactNode } from 'react';

interface PanelShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PanelShell({ title, subtitle, action, children }: PanelShellProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#0a0a0a] leading-none mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-[#71717a]">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
