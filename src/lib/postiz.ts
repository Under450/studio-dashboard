import type { PostizChannel, ScheduledPost } from '../types';
import { loadAccounts, loadActiveAccountId } from './accounts';

// Reads active account credentials from localStorage at call time
function getActiveCredentials(): { url: string; apiKey: string } {
  const accounts = loadAccounts();
  const activeId = loadActiveAccountId();
  const account = accounts.find(a => a.id === activeId) ?? accounts[0];
  return {
    url: account?.postizUrl?.replace(/\/$/, '') ?? '',
    apiKey: account?.postizApiKey ?? '',
  };
}

// In dev mode, route through Vite proxy to avoid CORS.
// In production, use the stored URL directly.
function proxyUrl(path: string, directUrl: string): string {
  if (import.meta.env.DEV) {
    return `/postiz${path}`;
  }
  return `${directUrl}${path}`;
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
    // Try no-cors first — just check the server is reachable
    const res = await fetch(proxyUrl('/api/auth/ping', url), {
      headers: headers(apiKey),
    });
    // Any response (even 404) means server is up
    return res.status < 500;
  } catch {
    return false;
  }
}

export async function getChannels(): Promise<PostizChannel[]> {
  const { url, apiKey } = getActiveCredentials();
  const res = await fetch(proxyUrl('/api/integrations', url), { headers: headers(apiKey) });
  if (!res.ok) throw new Error('Failed to fetch channels');
  const data = await res.json();
  return data.integrations || [];
}

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  const { url, apiKey } = getActiveCredentials();
  const res = await fetch(proxyUrl('/api/posts?status=scheduled', url), { headers: headers(apiKey) });
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
  const res = await fetch(proxyUrl('/api/posts', url), {
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
