import { useState, useContext } from 'react';
import { CalendarDays } from 'lucide-react';
import { PanelShell, FieldLabel } from '../components/PanelShell';
import { AppContext } from '../App';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

export function SchedulePanel() {
  const { currentPost } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <PanelShell
      eyebrow="Step 3 of 4"
      title="Schedule"
      subtitle="Plan your content calendar and queue posts for publishing."
    >
      {/* Coming soon notice */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 10,
        border: '1px solid var(--studio-border)',
        backgroundColor: 'var(--studio-panel)',
        marginBottom: 28,
        textAlign: 'center' as const,
      }}>
        <CalendarDays size={28} color="var(--studio-ink-3)" style={{ marginBottom: 10 }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-ink)', marginBottom: 6 }}>
          Publishing coming soon
        </p>
        <p style={{ fontSize: '13px', color: 'var(--studio-ink-3)', lineHeight: 1.5 }}>
          Connect your social accounts to start scheduling posts. Platform integrations are on the way.
        </p>
      </div>

      <div className="flex gap-10">
        {/* Week calendar */}
        <div style={{ flex: 1 }}>
          <div className="flex items-center justify-between mb-3">
            <FieldLabel>This Week</FieldLabel>
          </div>
          <div style={{ border: '1px solid var(--studio-border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--studio-sidebar)', borderBottom: '1px solid var(--studio-border)' }}>
              {weekDays.map((day) => (
                <div key={day.toISOString()} style={{ padding: '10px 8px', textAlign: 'center' as const }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--studio-ink-4)', marginBottom: 2 }}>
                    {format(day, 'EEE')}
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-ink-3)' }}>{format(day, 'd')}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 100 }}>
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    style={{
                      padding: 8,
                      borderRight: '1px solid var(--studio-border-light)',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f7f5f1' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — post preview */}
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
          {currentPost.caption && (
            <div>
              <FieldLabel>Post Preview</FieldLabel>
              <div style={{
                padding: '12px 14px',
                border: '1px solid var(--studio-border)',
                borderRadius: 10,
                backgroundColor: 'var(--studio-panel)',
                fontSize: '13px',
                color: 'var(--studio-ink-2)',
                lineHeight: 1.55,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}>
                {currentPost.caption}
              </div>
            </div>
          )}

          <div>
            <FieldLabel>Channels</FieldLabel>
            <p style={{ fontSize: '12px', color: 'var(--studio-ink-4)', lineHeight: 1.5 }}>
              Social platform connections coming soon.
            </p>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
