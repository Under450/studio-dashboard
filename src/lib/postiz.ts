import type { PostizChannel, ScheduledPost } from '../types';
import { loadAccounts, loadActiveAccountId } from './accounts';

// Always reads the active account's credentials from localStorage at call time
function getActiveCredentials(): { url: string; apiKey: string } {
  const accounts = loadAccounts();
  const activeId = loadActiveAccountId();
  const account = accounts.find(a => a.id === activeId) ?? accounts[0];
  return {
    url: account?.postizUrl?.replace(/\/$/, '') ?? '',
    apiKey: account?.postizApiKey ?? '',
  };
}

function headers(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

export async function pingPostiz(): Promise<boolean> {
  const { url, apiKey } = getActiveCredentials();
  if (!url || !apiKey) return false;
  try {
    const res = await fetch(`${url}/api/auth/ping`, { headers: headers(apiKey) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getChannels(): Promise<PostizChannel[]> {
  const { url, apiKey } = getActiveCredentials();
  const res = await fetch(`${url}/api/integrations`, { headers: headers(apiKey) });
  if (!res.ok) throw new Error('Failed to fetch channels');
  const data = await res.json();
  return data.integrations || [];
}

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  const { url, apiKey } = getActiveCredentials();
  const res = await fetch(`${url}/api/posts?status=scheduled`, { headers: headers(apiKey) });
  if (!res.ok) throw new Error('Failed to fetch posts');
  const data = await res.json();
  return data.posts || [];
}

export async function createPost(payload: {
  content: string;
  publishDate: string;
  channels: string[];
  mediaUrls?: string[];
}): Promise<{ id: string }> {
  const { url, apiKey } = getActiveCredentials();
  const res = await fetch(`${url}/api/posts`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      content: payload.content,
      date: payload.publishDate,
      settings: payload.channels.map((id) => ({ integration: { id } })),
      ...(payload.mediaUrls?.length ? { media: payload.mediaUrls.map((u) => ({ url: u })) } : {}),
    }),
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}
