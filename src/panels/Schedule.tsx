import { useState, useEffect, useContext } from 'react';
import { CalendarDays, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { PanelShell } from '../components/PanelShell';
import { getChannels, getScheduledPosts, createPost } from '../lib/postiz';
import type { PostizChannel, ScheduledPost } from '../types';
import { AppContext } from '../App';
import { isConfigured } from '../config';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';

export function SchedulePanel() {
  const { currentPost } = useContext(AppContext);
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
    if (!isConfigured.postiz) return;
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
      setToast({ type: 'success', message: `Queued for ${format(publishDate, 'EEE d MMM')} at ${selectedTime} on ${selectedChannels.length} channel${selectedChannels.length > 1 ? 's' : ''}` });
      const posts = await getScheduledPosts();
      setScheduled(posts);
      setTimeout(() => setToast(null), 4000);
    } catch {
      setToast({ type: 'error', message: 'Failed to queue post — check your Postiz connection.' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelShell title="Schedule" subtitle="Pick your channels and push to the Postiz queue.">
      {!isConfigured.postiz && (
        <div className="mb-6 px-4 py-3 rounded-md border border-amber-200 bg-amber-50 text-sm text-amber-700">
          Postiz not configured — add <code className="font-mono text-xs">VITE_POSTIZ_URL</code> and <code className="font-mono text-xs">VITE_POSTIZ_API_KEY</code> to your <code className="font-mono text-xs">.env</code> file.
        </div>
      )}
      {fetchError && (
        <div className="mb-6 px-4 py-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-600">{fetchError}</div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-md shadow-lg text-sm font-medium z-50 ${toast.type === 'success' ? 'bg-[#0a0a0a] text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.message}
        </div>
      )}

      <div className="flex gap-8">
        {/* Calendar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">This Week</p>
            <button onClick={() => getScheduledPosts().then(setScheduled)} className="text-[#a1a1aa] hover:text-[#0a0a0a] transition-colors">
              <RefreshCw size={13} />
            </button>
          </div>
          <div className="border border-[#e4e4e7] rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[#e4e4e7]" style={{ backgroundColor: '#f4f4f5' }}>
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa]">
                  {format(day, 'EEE')}
                  <div className="text-xs font-normal text-[#71717a] mt-0.5">{format(day, 'd')}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 min-h-[120px]">
              {weekDays.map((day) => {
                const dayPosts = scheduled.filter((p) => {
                  try { return isSameDay(parseISO(p.publishDate), day); } catch { return false; }
                });
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className="p-2 border-r border-[#f4f4f5] last:border-r-0 cursor-pointer transition-colors hover:bg-[#fafaf9]"
                    style={{ backgroundColor: isSelected ? '#f0fdf0' : 'transparent' }}
                  >
                    {dayPosts.map((p) => (
                      <div key={p.id} className="text-[10px] px-1.5 py-0.5 rounded mb-1 truncate" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                        {format(parseISO(p.publishDate), 'HH:mm')}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scheduling form */}
        <div className="w-64 flex-shrink-0 space-y-5">
          {/* Post preview */}
          {currentPost.caption && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-2">Post</p>
              <div className="p-3 rounded-md border border-[#e4e4e7] bg-white text-xs text-[#3f3f46] leading-relaxed line-clamp-3">
                {currentPost.caption}
              </div>
            </div>
          )}

          {/* Channels */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-2">Channels</p>
            {channels.length === 0 ? (
              <p className="text-xs text-[#a1a1aa]">{isConfigured.postiz ? 'No channels found — connect them in Postiz.' : 'Connect Postiz to see channels.'}</p>
            ) : (
              <div className="space-y-2">
                {channels.map((ch) => (
                  <label key={ch.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedChannels.includes(ch.id)} onChange={() => toggleChannel(ch.id)} style={{ accentColor: '#0a0a0a' }} />
                    <span className="text-sm text-[#3f3f46]">{ch.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Date & time */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-2">Date & Time</p>
            <div className="space-y-2">
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
                className="w-full border border-[#e4e4e7] rounded-md px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
              />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full border border-[#e4e4e7] rounded-md px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
              />
            </div>
          </div>

          {/* Queue button */}
          <button
            onClick={handleQueue}
            disabled={loading || !currentPost.caption || selectedChannels.length === 0 || !isConfigured.postiz}
            className="w-full py-2.5 text-sm font-semibold rounded-md transition-all duration-150 hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}
          >
            <CalendarDays size={14} />
            {loading ? 'Queuing…' : 'Queue Post'}
          </button>
        </div>
      </div>
    </PanelShell>
  );
}
