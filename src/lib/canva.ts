import type { Platform } from '../types';

const PLATFORM_DIMENSIONS: Record<Platform, { w: number; h: number; label: string }> = {
  'instagram-post': { w: 1080, h: 1080, label: 'Instagram Post' },
  'instagram-story': { w: 1080, h: 1920, label: 'Instagram Story' },
  linkedin: { w: 1200, h: 627, label: 'LinkedIn' },
  twitter: { w: 1600, h: 900, label: 'X / Twitter' },
  tiktok: { w: 1080, h: 1920, label: 'TikTok' },
  facebook: { w: 1200, h: 630, label: 'Facebook' },
};

export function getDimensions(platform: Platform) {
  return PLATFORM_DIMENSIONS[platform];
}

export function openCanva(platform: Platform) {
  const dims = PLATFORM_DIMENSIONS[platform];
  // Canva deep link — opens new design at specified dimensions
  const url = `https://www.canva.com/design/new/?width=${dims.w}&height=${dims.h}&units=px`;
  window.open(url, '_blank');
}

export { PLATFORM_DIMENSIONS };
