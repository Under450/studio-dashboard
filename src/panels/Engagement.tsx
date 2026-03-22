import { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { PanelShell, FieldLabel, PrimaryButton, GhostButton } from '../components/PanelShell';
import { draftReplies } from '../lib/claude';
import { isConfigured } from '../config';

interface Reply { comment: string; reply: string; copied: boolean; }

export function EngagementPanel() {
  const [input, setInput] = useState('');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allCopied, setAllCopied] = useState(false);

  const comments = input.split('\n').map((c) => c.trim()).filter(Boolean);

  const handleDraft = async () => {
    if (!comments.length) return;
    setLoading(true);
    setError('');
    try {
      const drafted = await draftReplies(comments);
      setReplies(drafted.map((d) => ({ ...d, copied: false })));
    } catch {
      setError('Could not draft replies — check your Claude API key in .env');
    } finally {
      setLoading(false);
    }
  };

  const copyOne = (idx: number) => {
    navigator.clipboard.writeText(replies[idx].reply);
    setReplies((prev) => prev.map((r, i) => ({ ...r, copied: i === idx })));
    setTimeout(() => setReplies((prev) => prev.map((r, i) => ({ ...r, copied: i === idx ? false : r.copied }))), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(replies.map((r) => `> ${r.comment}\n${r.reply}`).join('\n\n'));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <PanelShell
      eyebrow="Step 4 of 4"
      title="Engagement"
      subtitle="Paste your comments. Get replies drafted in your voice — warm, genuine, never robotic."
      action={
        replies.length > 0 ? (
          <GhostButton onClick={copyAll} icon={allCopied ? <Check size={13} /> : <Copy size={13} />}>
            {allCopied ? 'Copied!' : 'Copy All'}
          </GhostButton>
        ) : undefined
      }
    >
      <div className="flex gap-10">
        {/* Input */}
        <div style={{ flex: 1 }}>
          {!isConfigured.claude && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px', borderRadius: 8, border: '1px solid #fde68a', backgroundColor: '#fffbeb', marginBottom: 20 }}>
              <AlertCircle size={14} color="#d97706" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                Add <code style={{ fontFamily: 'monospace', fontSize: 11 }}>VITE_CLAUDE_API_KEY</code> to your .env to enable reply drafting.
              </p>
            </div>
          )}

          <FieldLabel>Comments</FieldLabel>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your comments here, one per line:\n\nLove this!\nHow long did this take?\nCan you share more details?`}
            style={{
              width: '100%',
              minHeight: 200,
              padding: '16px',
              border: '1px solid var(--studio-border)',
              borderRadius: 10,
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'var(--studio-ink)',
              backgroundColor: 'var(--studio-panel)',
              fontFamily: 'var(--studio-sans)',
              outline: 'none',
              marginBottom: 12,
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--studio-ink)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--studio-border)')}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '12px', color: 'var(--studio-ink-4)' }}>
              {comments.length} comment{comments.length !== 1 ? 's' : ''} detected
            </p>
            <PrimaryButton
              onClick={handleDraft}
              disabled={loading || !input.trim() || !isConfigured.claude}
              icon={<Sparkles size={13} />}
            >
              {loading ? 'Drafting…' : 'Draft Replies'}
            </PrimaryButton>
          </div>
          {error && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: 8 }}>{error}</p>}
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div style={{ flex: 1 }}>
            <FieldLabel>Drafted Replies</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              {replies.map((r, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid var(--studio-border)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: 'var(--studio-panel)',
                  }}
                >
                  {/* Original comment */}
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--studio-sidebar)',
                    borderBottom: '1px solid var(--studio-border-light)',
                  }}>
                    <p style={{ fontSize: '12px', color: 'var(--studio-ink-3)', fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{r.comment}"
                    </p>
                  </div>
                  {/* Reply */}
                  <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <p style={{ flex: 1, fontSize: '13px', color: 'var(--studio-ink)', lineHeight: 1.6 }}>
                      {r.reply}
                    </p>
                    <button
                      onClick={() => copyOne(i)}
                      style={{
                        flexShrink: 0,
                        padding: '5px 8px',
                        border: '1px solid var(--studio-border-light)',
                        borderRadius: 6,
                        backgroundColor: r.copied ? '#f0fdf4' : 'var(--studio-panel)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '11px',
                        fontWeight: 500,
                        color: r.copied ? '#16a34a' : 'var(--studio-ink-3)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {r.copied ? <Check size={11} /> : <Copy size={11} />}
                      {r.copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
