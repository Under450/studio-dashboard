import { useEffect, useState } from 'react';
import { Image, PenLine, CalendarDays, MessageSquare } from 'lucide-react';
import type { PanelId } from '../types';
import { pingPostiz } from '../lib/postiz';
import { isConfigured } from '../config';

const NAV_ITEMS: { id: PanelId; label: string; icon: typeof Image }[] = [
  { id: 'create-image', label: 'Create Image', icon: Image },
  { id: 'create-post', label: 'Create Post', icon: PenLine },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'engagement', label: 'Engagement', icon: MessageSquare },
];

interface SidebarProps {
  activePanel: PanelId;
  onNavigate: (panel: PanelId) => void;
}

export function Sidebar({ activePanel, onNavigate }: SidebarProps) {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isConfigured.postiz) { setConnected(false); return; }
    pingPostiz().then(setConnected);
  }, []);

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col"
      style={{ width: 240, backgroundColor: '#0a0a0a' }}
    >
      {/* Logo */}
      <div className="px-6 pt-7 pb-8">
        <span className="text-white text-sm font-semibold tracking-[0.15em] uppercase">Studio</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activePanel === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md transition-all duration-150 group relative"
              style={{
                backgroundColor: active ? '#161616' : 'transparent',
                color: active ? '#ffffff' : '#71717a',
                borderLeft: active ? '3px solid #e8ff4d' : '3px solid transparent',
              }}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status */}
      <div className="px-6 py-5 border-t" style={{ borderColor: '#1a1a1a' }}>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              backgroundColor:
                connected === null ? '#71717a' : connected ? '#22c55e' : '#ef4444',
            }}
          />
          <span className="text-xs" style={{ color: '#52525b' }}>
            {connected === null
              ? 'Checking Postiz…'
              : connected
              ? 'Postiz connected'
              : 'Postiz not connected'}
          </span>
        </div>
      </div>
    </aside>
  );
}
