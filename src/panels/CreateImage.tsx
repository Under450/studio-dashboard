import { useState, useCallback, useContext } from 'react';
import { ArrowUpRight, CloudUpload, X, CheckCircle2 } from 'lucide-react';
import { PanelShell, FieldLabel, PrimaryButton, GhostButton } from '../components/PanelShell';
import { openCanva, getDimensions, PLATFORM_DIMENSIONS } from '../lib/canva';
import type { Platform } from '../types';
import { AppContext } from '../App';

const PLATFORMS: { id: Platform; label: string; short: string }[] = [
  { id: 'instagram-post', label: 'Instagram Post', short: 'IG Post' },
  { id: 'instagram-story', label: 'Instagram Story', short: 'IG Story' },
  { id: 'linkedin', label: 'LinkedIn', short: 'LinkedIn' },
  { id: 'twitter', label: 'X / Twitter', short: 'X' },
  { id: 'tiktok', label: 'TikTok', short: 'TikTok' },
];

export function CreateImagePanel() {
  const { currentPost, setCurrentPost, setActivePanel } = useContext(AppContext);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('instagram-post');
  const [dragging, setDragging] = useState(false);

  const dims = getDimensions(selectedPlatform);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      setCurrentPost({ ...currentPost, imageFile: file, imagePreviewUrl: URL.createObjectURL(file) });
    },
    [currentPost, setCurrentPost]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCurrentPost({ ...currentPost, imageFile: file, imagePreviewUrl: URL.createObjectURL(file) });
  };

  return (
    <PanelShell
      eyebrow="Step 1 of 4"
      title="Create Image"
      subtitle="Choose your target platform, design in Canva at the exact dimensions, then drop it back here."
    >
      <div className="flex gap-12">
        {/* Left col */}
        <div className="flex-1 space-y-8">
          {/* Platform picker */}
          <div>
            <FieldLabel>Target Platform</FieldLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {PLATFORMS.map(({ id, label }) => {
                const active = selectedPlatform === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedPlatform(id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      fontSize: '13px',
                      fontWeight: active ? 600 : 400,
                      border: `1px solid ${active ? 'var(--studio-ink)' : 'var(--studio-border)'}`,
                      backgroundColor: active ? 'var(--studio-ink)' : 'var(--studio-panel)',
                      color: active ? '#ffffff' : 'var(--studio-ink-2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                backgroundColor: 'var(--studio-sidebar)',
                border: '1px solid var(--studio-border)',
                borderRadius: 6,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--studio-ink-3)' }} />
              <span style={{ fontSize: '12px', color: 'var(--studio-ink-3)', fontWeight: 500 }}>
                {dims.w} × {dims.h} px — {PLATFORM_DIMENSIONS[selectedPlatform].label}
              </span>
            </div>
          </div>

          {/* Canva CTA */}
          <div>
            <FieldLabel>Design Tool</FieldLabel>
            <div
              style={{
                padding: '20px 24px',
                backgroundColor: 'var(--studio-panel)',
                border: '1px solid var(--studio-border)',
                borderRadius: 12,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-ink)', marginBottom: 2 }}>Canva</p>
                  <p style={{ fontSize: '12px', color: 'var(--studio-ink-3)' }}>Opens at {dims.w} × {dims.h}px — ready to design</p>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: '#8B5CF6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  C
                </div>
              </div>
              <PrimaryButton onClick={() => openCanva(selectedPlatform)} icon={<ArrowUpRight size={14} />}>
                Open in Canva
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* Right col — drop zone */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <FieldLabel>Your Finished Image</FieldLabel>
          {currentPost.imagePreviewUrl ? (
            <div>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid var(--studio-border)',
                  backgroundColor: 'var(--studio-sidebar)',
                }}
              >
                <img
                  src={currentPost.imagePreviewUrl}
                  alt="Preview"
                  style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 260 }}
                />
                <button
                  onClick={() => setCurrentPost({ ...currentPost, imageFile: undefined, imagePreviewUrl: undefined })}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid var(--studio-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <X size={12} color="var(--studio-ink)" />
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 10,
                  marginBottom: 12,
                  padding: '8px 12px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                }}
              >
                <CheckCircle2 size={13} color="#16a34a" />
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#15803d' }}>Image ready to post</span>
              </div>
              <GhostButton onClick={() => setActivePanel('create-post')} icon={<span style={{ fontSize: 12 }}>→</span>}>
                Go to Create Post
              </GhostButton>
            </div>
          ) : (
            <label
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 220,
                borderRadius: 12,
                border: `2px dashed ${dragging ? 'var(--studio-ink)' : 'var(--studio-border)'}`,
                backgroundColor: dragging ? 'var(--studio-sidebar)' : '#fdfcfa',
                cursor: 'pointer',
                transition: 'all 0.15s',
                padding: 24,
                textAlign: 'center' as const,
              }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: 'var(--studio-sidebar)',
                  border: '1px solid var(--studio-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <CloudUpload size={20} color="var(--studio-ink-3)" strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-ink-2)', marginBottom: 4 }}>
                Drop image here
              </p>
              <p style={{ fontSize: '12px', color: 'var(--studio-ink-4)' }}>
                or click to browse
              </p>
              <p style={{ fontSize: '11px', color: 'var(--studio-ink-4)', marginTop: 8 }}>
                PNG, JPG supported
              </p>
            </label>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
