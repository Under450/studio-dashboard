import { useState } from 'react';
import { Sparkles, Copy, CopyCheck, AlertCircle } from 'lucide-react';
import { PanelShell } from '../components/PanelShell';
import { draftReplies } from '../lib/claude';
import { isConfigured } from '../config';

interface Reply { comment: string; reply: string; copied: boolean; }

export function EngagementPanel() {
  const [input, setInput] = useState('');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allCopied, setAllCopied] = useState(false);

  const handleDraft = async () => {
    const comments = input.split('\n').map((c) => c.trim()).filter(Boolean);
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
    setReplies((prev) => prev.map((r, i) => ({ ...r, copied: i === idx ? true : r.copied })));
    setTimeout(() => setReplies((prev) => prev.map((r, i) => ({ ...r, copied: i === idx ? false : r.copied }))), 2000);
  };

  const copyAll = () => {
    const text = replies.map((r) => `> ${r.comment}\n${r.reply}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <PanelShell
      title="Engagement"
      subtitle="Paste comments from any platform. Get replies drafted in your voice."
      action={
        replies.length > 0 ? (
          <button
            onClick={copyAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-md transition-all duration-150 hover:bg-[#f4f4f5]"
            style={{ borderColor: '#e4e4e7', color: '#3f3f46' }}
          >
            {allCopied ? <CopyCheck size={12} /> : <Copy size={12} />}
            {allCopied ? 'Copied!' : 'Copy All'}
          </button>
        ) : undefined
      }
    >
      <div className="max-w-2xl space-y-6">
        {!isConfigured.claude && (
          <div className="px-4 py-3 rounded-md border border-amber-200 bg-amber-50 text-sm text-amber-700 flex items-center gap-2">
            <AlertCircle size={14} />
            Add <code className="font-mono text-xs mx-1">VITE_CLAUDE_API_KEY</code> to your <code className="font-mono text-xs mx-1">.env</code> to enable reply drafting.
          </div>
        )}

        {/* Input */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-3">Comments</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your comments here — one per line\n\nExample:\nLove this post!\nHow long did this take you?\nCan you share the recipe?`}
            className="w-full border border-[#e4e4e7] rounded-md p-4 text-sm text-[#0a0a0a] resize-none focus:outline-none focus:border-[#0a0a0a] transition-colors leading-relaxed"
            style={{ minHeight: 160, backgroundColor: '#ffffff', fontFamily: 'inherit' }}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-[#a1a1aa]">
              {input.split('\n').filter((l) => l.trim()).length} comment{input.split('\n').filter((l) => l.trim()).length !== 1 ? 's' : ''} detected
            </p>
            <button
              onClick={handleDraft}
              disabled={loading || !input.trim() || !isConfigured.claude}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-150 hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}
            >
              <Sparkles size={14} />
              {loading ? 'Drafting…' : 'Draft Replies'}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-3">Drafted Replies</p>
            <div className="space-y-4">
              {replies.map((r, i) => (
                <div key={i} className="border border-[#e4e4e7] rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#e4e4e7]" style={{ backgroundColor: '#f4f4f5' }}>
                    <p className="text-xs text-[#71717a] leading-relaxed">{r.comment}</p>
                  </div>
                  <div className="px-4 py-3 flex items-start justify-between gap-4 bg-white">
                    <p className="text-sm text-[#0a0a0a] leading-relaxed flex-1">{r.reply}</p>
                    <button
                      onClick={() => copyOne(i)}
                      className="flex-shrink-0 text-[#a1a1aa] hover:text-[#0a0a0a] transition-colors mt-0.5"
                    >
                      {r.copied ? <CopyCheck size={15} /> : <Copy size={15} />}
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
