import { useEffect, useState } from 'react';
import { Image, PenLine, CalendarDays, MessageSquare } from 'lucide-react';
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
              fontSize: '13px',
              color: 'var(--studio-ink-4)',
              marginBottom: '1px',
              lineHeight: 1,
            }}
          >
            ↗
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
                border: active ? '1px solid var(--studio-border)' : '1px solid transparent',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    backgroundColor: active ? 'var(--studio-ink)' : 'transparent',
                    border: active ? 'none' : '1px solid var(--studio-border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon
                    size={12}
                    color={active ? '#ffffff' : 'var(--studio-ink-3)'}
                    strokeWidth={active ? 2 : 1.5}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--studio-ink)' : '#888',
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
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

      {/* Footer — status widget */}
      <div
        className="mx-3 mb-5 rounded-lg px-3 py-3"
        style={{
          backgroundColor: 'var(--studio-panel)',
          border: '1px solid var(--studio-border)',
        }}
      >
        <div className="flex items-center gap-2">
          {connected === null ? (
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'var(--studio-border-light)',
              }}
            />
          ) : connected ? (
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 0 2px rgba(34,197,94,0.2)',
              }}
            />
          ) : (
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
              }}
            />
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
          <p style={{ fontSize: '10px', color: 'var(--studio-ink-3)', marginTop: 4, lineHeight: 1.4 }}>
            Set VITE_POSTIZ_URL in .env
          </p>
        )}
      </div>
    </aside>
  );
}
