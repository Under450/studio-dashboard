import { useState, useContext } from 'react';
import { Sparkles, X, ArrowRight, Save } from 'lucide-react';
import { PanelShell } from '../components/PanelShell';
import { generateHashtags } from '../lib/claude';
import type { Platform } from '../types';
import { AppContext } from '../App';
import { isConfigured } from '../config';

const PLATFORM_LIMITS: Record<Platform | 'facebook', number> = {
  twitter: 280,
  linkedin: 3000,
  'instagram-post': 2200,
  'instagram-story': 2200,
  tiktok: 2200,
  facebook: 63206,
};

const PLATFORM_OPTIONS: { id: Platform; label: string }[] = [
  { id: 'twitter', label: 'X / Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram-post', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'facebook', label: 'Facebook' },
];

export function CreatePostPanel() {
  const { currentPost, setCurrentPost, setActivePanel } = useContext(AppContext);
  const [loadingHashtags, setLoadingHashtags] = useState(false);
  const [hashtagError, setHashtagError] = useState('');

  const caption = currentPost.caption;
  const platforms = currentPost.platforms;
  const hashtags = currentPost.hashtags;

  const setCaption = (caption: string) => setCurrentPost({ ...currentPost, caption });
  const setPlatforms = (platforms: Platform[]) => setCurrentPost({ ...currentPost, platforms });
  const setHashtags = (hashtags: string[]) => setCurrentPost({ ...currentPost, hashtags });

  const primaryLimit = platforms.length > 0
    ? Math.min(...platforms.map((p) => PLATFORM_LIMITS[p] ?? 9999))
    : 9999;
  const pct = primaryLimit < 9999 ? (caption.length / primaryLimit) * 100 : 0;
  const counterColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#a1a1aa';

  const togglePlatform = (p: Platform) => {
    setPlatforms(platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p]);
  };

  const handleGenerateHashtags = async () => {
    if (!caption.trim()) return;
    setLoadingHashtags(true);
    setHashtagError('');
    try {
      const tags = await generateHashtags(caption, platforms.map((p) => p));
      setHashtags(tags);
    } catch (e) {
      setHashtagError('Could not generate hashtags — check your Claude API key in .env');
    } finally {
      setLoadingHashtags(false);
    }
  };

  const removeHashtag = (tag: string) => setHashtags(hashtags.filter((h) => h !== tag));

  return (
    <PanelShell title="Create Post" subtitle="Write your caption, pick platforms, generate hashtags.">
      <div className="flex gap-8 h-full">
        {/* Left — caption */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-3">Caption</p>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption here…"
              className="w-full border border-[#e4e4e7] rounded-md p-4 text-sm text-[#0a0a0a] resize-none focus:outline-none focus:border-[#0a0a0a] transition-colors leading-relaxed"
              style={{ minHeight: 200, backgroundColor: '#ffffff', fontFamily: 'inherit' }}
            />
            {platforms.length > 0 && primaryLimit < 9999 && (
              <div className="flex justify-end mt-1.5">
                <span className="text-xs font-medium" style={{ color: counterColor }}>
                  {caption.length} / {primaryLimit}
                </span>
              </div>
            )}
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">Hashtags</p>
              <button
                onClick={handleGenerateHashtags}
                disabled={loadingHashtags || !caption.trim() || !isConfigured.claude}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-md transition-all duration-150 disabled:opacity-40"
                style={{ borderColor: '#e4e4e7', color: '#0a0a0a', backgroundColor: '#ffffff' }}
                title={!isConfigured.claude ? 'Add VITE_CLAUDE_API_KEY to .env' : ''}
              >
                <Sparkles size={12} />
                {loadingHashtags ? 'Generating…' : 'Generate Hashtags'}
              </button>
            </div>
            {hashtagError && <p className="text-xs text-red-500 mb-2">{hashtagError}</p>}
            {hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border"
                    style={{ borderColor: '#e4e4e7', backgroundColor: '#f4f4f5', color: '#3f3f46' }}
                  >
                    #{tag}
                    <button onClick={() => removeHashtag(tag)} className="hover:text-red-400 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#a1a1aa]">
                {isConfigured.claude ? 'Write a caption first, then generate hashtags.' : 'Add VITE_CLAUDE_API_KEY to .env to enable hashtag generation.'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-md transition-all duration-150 hover:bg-[#f4f4f5]"
              style={{ borderColor: '#e4e4e7', color: '#3f3f46' }}
            >
              <Save size={14} />
              Save Draft
            </button>
            <button
              onClick={() => setActivePanel('schedule')}
              disabled={!caption.trim() || platforms.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md transition-all duration-150 hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}
            >
              Move to Schedule
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right — platforms + image */}
        <div className="w-56 flex flex-col gap-6 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-3">Platforms</p>
            <div className="space-y-2">
              {PLATFORM_OPTIONS.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={platforms.includes(id)}
                    onChange={() => togglePlatform(id)}
                    className="rounded"
                    style={{ accentColor: '#0a0a0a' }}
                  />
                  <span className="text-sm text-[#3f3f46] group-hover:text-[#0a0a0a] transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {currentPost.imagePreviewUrl && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-3">Image</p>
              <img
                src={currentPost.imagePreviewUrl}
                alt="Post image"
                className="w-full rounded-lg border border-[#e4e4e7] object-cover"
                style={{ maxHeight: 160 }}
              />
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
