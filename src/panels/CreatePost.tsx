import { useState, useContext } from 'react';
import { Sparkles, X, ArrowRight, Save } from 'lucide-react';
import { PanelShell, FieldLabel, PrimaryButton, GhostButton } from '../components/PanelShell';
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

  const setCaption = (c: string) => setCurrentPost({ ...currentPost, caption: c });
  const setPlatforms = (p: Platform[]) => setCurrentPost({ ...currentPost, platforms: p });
  const setHashtags = (h: string[]) => setCurrentPost({ ...currentPost, hashtags: h });

  const primaryLimit = platforms.length > 0
    ? Math.min(...platforms.map((p) => PLATFORM_LIMITS[p] ?? 9999))
    : 9999;
  const pct = primaryLimit < 9999 ? (caption.length / primaryLimit) * 100 : 0;
  const counterColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : 'var(--studio-ink-4)';

  const togglePlatform = (p: Platform) =>
    setPlatforms(platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p]);

  const handleGenerateHashtags = async () => {
    if (!caption.trim()) return;
    setLoadingHashtags(true);
    setHashtagError('');
    try {
      const tags = await generateHashtags(caption, platforms);
      setHashtags(tags);
    } catch {
      setHashtagError('Could not generate — check your Claude API key in .env');
    } finally {
      setLoadingHashtags(false);
    }
  };

  return (
    <PanelShell
      eyebrow="Step 2 of 4"
      title="Create Post"
      subtitle="Write your caption, choose platforms, and let AI generate the right hashtag mix."
    >
      <div className="flex gap-10">
        {/* Left — caption + hashtags */}
        <div className="flex-1 space-y-7">
          {/* Caption */}
          <div>
            <FieldLabel>Caption</FieldLabel>
            <div style={{ position: 'relative' }}>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write something worth stopping the scroll…"
                style={{
                  width: '100%',
                  minHeight: 180,
                  padding: '16px',
                  border: '1px solid var(--studio-border)',
                  borderRadius: 10,
                  fontSize: '14px',
                  lineHeight: 1.65,
                  color: 'var(--studio-ink)',
                  backgroundColor: 'var(--studio-panel)',
                  fontFamily: 'var(--studio-sans)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--studio-ink)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--studio-border)')}
              />
              {platforms.length > 0 && primaryLimit < 9999 && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 12,
                    fontSize: '11px',
                    fontWeight: 500,
                    color: counterColor,
                  }}
                >
                  {caption.length}/{primaryLimit}
                </span>
              )}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Hashtags</FieldLabel>
              <button
                onClick={handleGenerateHashtags}
                disabled={loadingHashtags || !caption.trim() || !isConfigured.claude}
                title={!isConfigured.claude ? 'Add VITE_CLAUDE_API_KEY to .env' : ''}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  border: '1px solid var(--studio-border)',
                  borderRadius: 7,
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--studio-ink-2)',
                  backgroundColor: 'var(--studio-panel)',
                  cursor: loadingHashtags || !caption.trim() || !isConfigured.claude ? 'not-allowed' : 'pointer',
                  opacity: loadingHashtags || !caption.trim() || !isConfigured.claude ? 0.45 : 1,
                  fontFamily: 'var(--studio-sans)',
                }}
              >
                <Sparkles size={12} />
                {loadingHashtags ? 'Generating…' : 'Generate with AI'}
              </button>
            </div>
            {hashtagError && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: 8 }}>{hashtagError}</p>
            )}
            {hashtags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 10px',
                      border: '1px solid var(--studio-border)',
                      borderRadius: 6,
                      fontSize: '12px',
                      color: 'var(--studio-ink-2)',
                      backgroundColor: 'var(--studio-sidebar)',
                      fontWeight: 400,
                    }}
                  >
                    #{tag}
                    <button
                      onClick={() => setHashtags(hashtags.filter((h) => h !== tag))}
                      style={{ cursor: 'pointer', display: 'flex', opacity: 0.5 }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '14px 16px',
                  border: '1px dashed var(--studio-border)',
                  borderRadius: 10,
                  backgroundColor: '#fdfcfa',
                }}
              >
                <p style={{ fontSize: '13px', color: 'var(--studio-ink-4)' }}>
                  {isConfigured.claude
                    ? 'Write a caption first, then click Generate with AI.'
                    : 'Add VITE_CLAUDE_API_KEY to .env to enable AI hashtags.'}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <GhostButton icon={<Save size={13} />}>Save Draft</GhostButton>
            <PrimaryButton
              onClick={() => setActivePanel('schedule')}
              disabled={!caption.trim() || platforms.length === 0}
              icon={<ArrowRight size={13} />}
            >
              Move to Schedule
            </PrimaryButton>
          </div>
        </div>

        {/* Right — platforms + image */}
        <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: 24 }}>
          <div>
            <FieldLabel>Post to</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              {PLATFORM_OPTIONS.map(({ id, label }) => {
                const checked = platforms.includes(id);
                return (
                  <label
                    key={id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: `1px solid ${checked ? 'var(--studio-ink)' : 'var(--studio-border)'}`,
                      backgroundColor: checked ? '#fafaf9' : 'transparent',
                      transition: 'all 0.12s',
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: `1.5px solid ${checked ? 'var(--studio-ink)' : 'var(--studio-border)'}`,
                        backgroundColor: checked ? 'var(--studio-ink)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.12s',
                      }}
                      onClick={() => togglePlatform(id)}
                    >
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: checked ? 500 : 400,
                        color: checked ? 'var(--studio-ink)' : 'var(--studio-ink-2)',
                      }}
                      onClick={() => togglePlatform(id)}
                    >
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {currentPost.imagePreviewUrl && (
            <div>
              <FieldLabel>Attached Image</FieldLabel>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--studio-border)' }}>
                <img
                  src={currentPost.imagePreviewUrl}
                  alt="Post"
                  style={{ width: '100%', display: 'block', maxHeight: 160, objectFit: 'cover' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
