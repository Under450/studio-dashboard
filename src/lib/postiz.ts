import { config } from '../config';
import type { PostizChannel, ScheduledPost } from '../types';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.postizApiKey}`,
});

export async function pingPostiz(): Promise<boolean> {
  try {
    const res = await fetch(`${config.postizUrl}/api/auth/ping`, { headers: headers() });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getChannels(): Promise<PostizChannel[]> {
  const res = await fetch(`${config.postizUrl}/api/integrations`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch channels');
  const data = await res.json();
  return data.integrations || [];
}

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  const res = await fetch(`${config.postizUrl}/api/posts?status=scheduled`, { headers: headers() });
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
  const res = await fetch(`${config.postizUrl}/api/posts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      content: payload.content,
      date: payload.publishDate,
      settings: payload.channels.map((id) => ({ integration: { id } })),
      ...(payload.mediaUrls?.length ? { media: payload.mediaUrls.map((url) => ({ url })) } : {}),
    }),
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}
