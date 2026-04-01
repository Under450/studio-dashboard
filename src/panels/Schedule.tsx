import { useState, useEffect, useContext } from 'react';
import { CalendarDays, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { PanelShell, FieldLabel, PrimaryButton } from '../components/PanelShell';
import { getChannels, getScheduledPosts, createPost } from '../lib/postiz';
import type { PostizChannel, ScheduledPost } from '../types';
import { AppContext } from '../App';
import { loadAccounts, loadActiveAccountId } from '../lib/accounts';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';

export function SchedulePanel() {
  const { currentPost } = useContext(AppContext);
  const accounts = loadAccounts();
  const activeId = loadActiveAccountId();
  const account = accounts.find(a => a.id === activeId) ?? accounts[0] ?? null;
  const hasPostiz = !!(account?.postizUrl && account?.postizApiKey);
  const [channels, setChannels] = useState<PostizChannel[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [fetchError, setFetchError] = useState('');

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (!hasPostiz) return;
    Promise.all([getChannels(), getScheduledPosts()])
      .then(([ch, posts]) => { setChannels(ch); setScheduled(posts); })
      .catch(() => setFetchError('Could not reach Postiz — check VITE_POSTIZ_URL in .env'));
  }, []);

  const toggleChannel = (id: string) =>
    setSelectedChannels((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleQueue = async () => {
    if (!currentPost.caption || selectedChannels.length === 0) return;
    setLoading(true);
    try {
      const publishDate = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`);
      await createPost({
        content: [currentPost.caption, currentPost.hashtags.map((h) => `#${h}`).join(' ')].filter(Boolean).join('\n\n'),
        publishDate: publishDate.toISOString(),
        channels: selectedChannels,
      });
      setToast({ type: 'success', message: `Queued · ${format(publishDate, 'EEE d MMM')} at ${selectedTime}` });
      getScheduledPosts().then(setScheduled);
      setTimeout(() => setToast(null), 4000);
    } catch {
      setToast({ type: 'error', message: 'Failed to queue — check Postiz connection.' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid var(--studio-border)',
    borderRadius: 7,
    fontSize: '13px',
    color: 'var(--studio-ink)',
    backgroundColor: 'var(--studio-panel)',
    fontFamily: 'var(--studio-sans)',
    outline: 'none',
  };

  return (
    <PanelShell
      eyebrow="Step 3 of 4"
      title="Schedule"
      subtitle="Choose your channels, pick date and time, push to Postiz."
    >
      {!hasPostiz && (
        <div style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #fde68a', backgroundColor: '#fffbeb', marginBottom: 24 }}>
          <p style={{ fontSize: '13px', color: '#92400e' }}>
            Postiz not configured — add <code style={{ fontFamily: 'monospace', fontSize: 11 }}>VITE_POSTIZ_URL</code> and <code style={{ fontFamily: 'monospace', fontSize: 11 }}>VITE_POSTIZ_API_KEY</code> to <code style={{ fontFamily: 'monospace', fontSize: 11 }}>.env</code>
          </p>
        </div>
      )}
      {fetchError && (
        <div style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #fecaca', backgroundColor: '#fef2f2', marginBottom: 24 }}>
          <p style={{ fontSize: '13px', color: '#b91c1c' }}>{fetchError}</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 18px',
          borderRadius: 10,
          backgroundColor: toast.type === 'success' ? 'var(--studio-ink)' : '#dc2626',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          zIndex: 50,
        }}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.message}
        </div>
      )}

      <div className="flex gap-10">
        {/* Week calendar */}
        <div style={{ flex: 1 }}>
          <div className="flex items-center justify-between mb-3">
            <FieldLabel>This Week</FieldLabel>
            <button
              onClick={() => getScheduledPosts().then(setScheduled)}
              style={{ color: 'var(--studio-ink-4)', cursor: 'pointer', display: 'flex' }}
            >
              <RefreshCw size={13} />
            </button>
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
                const dayPosts = scheduled.filter((p) => {
                  try { return isSameDay(parseISO(p.publishDate), day); } catch { return false; }
                });
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
                  >
                    {dayPosts.map((p) => (
                      <div key={p.id} style={{
                        fontSize: '10px',
                        padding: '3px 6px',
                        borderRadius: 5,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        fontWeight: 600,
                        marginBottom: 3,
                        whiteSpace: 'nowrap' as const,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {format(parseISO(p.publishDate), 'HH:mm')}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — form */}
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
            {channels.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--studio-ink-4)', lineHeight: 1.5 }}>
                {hasPostiz ? 'No channels found in Postiz.' : 'Connect Postiz to see channels.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {channels.map((ch) => (
                  <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedChannels.includes(ch.id)} onChange={() => toggleChannel(ch.id)} style={{ accentColor: 'var(--studio-ink)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--studio-ink-2)' }}>{ch.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
            <FieldLabel>Date & Time</FieldLabel>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--studio-ink)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--studio-border)')}
            />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--studio-ink)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--studio-border)')}
            />
          </div>

          <PrimaryButton
            onClick={handleQueue}
            disabled={loading || !currentPost.caption || selectedChannels.length === 0 || !hasPostiz}
            icon={<CalendarDays size={14} />}
          >
            {loading ? 'Queuing…' : 'Queue Post'}
          </PrimaryButton>
        </div>
      </div>
    </PanelShell>
  );
}
