export type Platform = 'instagram-post' | 'instagram-story' | 'linkedin' | 'twitter' | 'tiktok' | 'facebook';

export interface PostDraft {
  caption: string;
  platforms: Platform[];
  hashtags: string[];
  imageFile?: File;
  imagePreviewUrl?: string;
}

export interface ScheduledPost {
  id: string;
  content: string;
  publishDate: string;
  channels: string[];
  status: 'scheduled' | 'published' | 'failed';
}

export interface PostizChannel {
  id: string;
  name: string;
  platform: string;
  avatar?: string;
}

export interface AppContextType {
  currentPost: PostDraft;
  setCurrentPost: (post: PostDraft) => void;
  activePanel: string;
  setActivePanel: (panel: string) => void;
}
