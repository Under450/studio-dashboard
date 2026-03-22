import { useEffect, useState } from 'react';
import { Image, PenLine, CalendarDays, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import type { PanelId } from '../types';
import { pingPostiz } from '../lib/postiz';
import { isConfigured } from '../config';

const NAV_ITEMS: { id: PanelId; label: string; icon: typeof Image; hint: string }[] = [
  { id: 'create-image', label: 'Create Image', icon: Image, hint: 'Design & import' },
  { id: 'create-post', label: 'Create Post', icon: PenLine, hint: 'Caption & hashtags' },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays, hint: 'Queue to Postiz' },
  { id: 'engagement', label: 'Engagement', icon: MessageSquare, hint: 'Draft replies' },
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
      style={{
        width: 220,
        backgroundColor: 'var(--studio-sidebar)',
        borderRight: '1px solid var(--studio-sidebar-border)',
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-10">
        <div className="flex items-baseline gap-1.5">
          <span
            style={{
              fontFamily: 'var(--studio-serif)',
              fontSize: '1.35rem',
              fontWeight: 400,
              color: 'var(--studio-ink)',
              letterSpacing: '-0.02em',
            }}
          >
            Studio
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'var(--studio-ink-4)',
              marginBottom: '2px',
            }}
          >
            by you
          </span>
        </div>
      </div>

      {/* Section label */}
      <div className="px-6 mb-2">
        <span className="eyebrow">Workspace</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon, hint }) => {
          const active = activePanel === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="w-full text-left mb-0.5 rounded-lg group relative"
              style={{
                padding: '10px 12px',
                backgroundColor: active ? 'var(--studio-panel)' : 'transparent',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    backgroundColor: active ? 'var(--studio-ink)' : 'transparent',
                    border: active ? 'none' : '1px solid var(--studio-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon
                    size={13}
                    color={active ? '#ffffff' : 'var(--studio-ink-3)'}
                    strokeWidth={active ? 2 : 1.5}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--studio-ink)' : 'var(--studio-ink-2)',
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: active ? 'var(--studio-ink-3)' : 'var(--studio-ink-4)',
                      marginTop: 1,
                    }}
                  >
                    {hint}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="mx-3 mb-5 rounded-lg px-3 py-3"
        style={{
          backgroundColor: connected ? '#f0fdf4' : connected === false ? '#fef2f2' : 'transparent',
          border: connected === null ? 'none' : `1px solid ${connected ? '#bbf7d0' : '#fecaca'}`,
        }}
      >
        <div className="flex items-center gap-2">
          {connected === null ? (
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-pulse" />
          ) : connected ? (
            <Wifi size={12} color="#16a34a" />
          ) : (
            <WifiOff size={12} color="#dc2626" />
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: connected === null ? 'var(--studio-ink-4)' : connected ? '#15803d' : '#b91c1c',
            }}
          >
            {connected === null ? 'Connecting…' : connected ? 'Postiz live' : 'Postiz offline'}
          </span>
        </div>
        {!connected && connected !== null && (
          <p style={{ fontSize: '10px', color: '#ef4444', marginTop: 4, lineHeight: 1.4 }}>
            Set VITE_POSTIZ_URL in .env
          </p>
        )}
      </div>
    </aside>
  );
}
