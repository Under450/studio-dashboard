import { useState, useCallback, useContext } from 'react';
import { ExternalLink, Upload, X } from 'lucide-react';
import { PanelShell } from '../components/PanelShell';
import { openCanva, getDimensions, PLATFORM_DIMENSIONS } from '../lib/canva';
import type { Platform } from '../types';
import { AppContext } from '../App';

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'instagram-post', label: 'Instagram Post' },
  { id: 'instagram-story', label: 'Instagram Story' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'X / Twitter' },
  { id: 'tiktok', label: 'TikTok' },
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
      const url = URL.createObjectURL(file);
      setCurrentPost({ ...currentPost, imageFile: file, imagePreviewUrl: url });
    },
    [currentPost, setCurrentPost]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCurrentPost({ ...currentPost, imageFile: file, imagePreviewUrl: url });
  };

  const clearImage = () => {
    setCurrentPost({ ...currentPost, imageFile: undefined, imagePreviewUrl: undefined });
  };

  return (
    <PanelShell
      title="Create Image"
      subtitle="Design your assets in Canva, then drop them back here."
    >
      <div className="max-w-2xl space-y-8">
        {/* Platform selector */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-3">Platform</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(({ id, label }) => {
              const active = selectedPlatform === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedPlatform(id)}
                  className="px-4 py-2 text-sm font-medium border rounded-md transition-all duration-150"
                  style={{
                    backgroundColor: active ? '#0a0a0a' : '#ffffff',
                    color: active ? '#ffffff' : '#3f3f46',
                    borderColor: active ? '#0a0a0a' : '#e4e4e7',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[#a1a1aa]">
            {dims.w} × {dims.h}px
          </p>
        </div>

        {/* Canva CTA */}
        <div>
          <button
            onClick={() => openCanva(selectedPlatform)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-semibold transition-all duration-150 hover:opacity-90"
            style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}
          >
            <ExternalLink size={15} />
            Open in Canva
          </button>
          <p className="mt-2 text-xs text-[#a1a1aa]">
            Opens a new {PLATFORM_DIMENSIONS[selectedPlatform].label} canvas at the correct dimensions.
          </p>
        </div>

        {/* Drop zone */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-3">Your Image</p>
          {currentPost.imagePreviewUrl ? (
            <div className="relative inline-block">
              <img
                src={currentPost.imagePreviewUrl}
                alt="Preview"
                className="rounded-lg object-cover border border-[#e4e4e7]"
                style={{ maxWidth: 320, maxHeight: 320 }}
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-[#e4e4e7] flex items-center justify-center shadow-sm hover:bg-[#f4f4f5] transition-colors"
              >
                <X size={13} />
              </button>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-[#3f3f46]">Image ready</span>
                <button
                  onClick={() => setActivePanel('create-post')}
                  className="text-sm font-semibold underline underline-offset-2"
                  style={{ color: '#0a0a0a' }}
                >
                  Go to Create Post →
                </button>
              </div>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-all duration-150"
              style={{
                borderColor: dragging ? '#0a0a0a' : '#d4d4d8',
                backgroundColor: dragging ? '#f4f4f5' : '#fafaf9',
                minHeight: 180,
              }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              <Upload size={22} className="mb-3" style={{ color: '#a1a1aa' }} />
              <p className="text-sm font-medium text-[#3f3f46]">Drop your finished image here</p>
              <p className="text-xs text-[#a1a1aa] mt-1">or click to browse — PNG, JPG supported</p>
            </label>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
