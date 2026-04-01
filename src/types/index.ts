export type Platform = 'instagram-post' | 'instagram-story' | 'linkedin' | 'twitter' | 'tiktok' | 'facebook';
export type PanelId = 'create-image' | 'create-post' | 'schedule' | 'engagement';

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

/** @deprecated Postiz integration removed — kept for compatibility */
export interface PostizChannel {
  id: string;
  name: string;
  platform: string;
  avatar?: string;
}

export interface Account {
  id: string;
  name: string;
  postizUrl: string;
  postizApiKey: string;
  claudeApiKey: string;
  createdAt: number;
}

export interface AppContextType {
  currentPost: PostDraft;
  setCurrentPost: (post: PostDraft) => void;
  activePanel: PanelId;
  setActivePanel: (panel: PanelId) => void;

  activeAccount: Account | null;
  accounts: Account[];
  setActiveAccount: (account: Account) => void;
  openAccountManager: () => void;
}
