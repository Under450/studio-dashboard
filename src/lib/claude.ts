import { config } from '../config';
import { loadAccounts, loadActiveAccountId } from './accounts';

function getActiveAccount() {
  const accounts = loadAccounts();
  const activeId = loadActiveAccountId();
  return accounts.find(a => a.id === activeId) ?? accounts[0] ?? null;
}

async function callClaude(messages: { role: string; content: string }[], system: string): Promise<string> {
  const activeAccount = getActiveAccount();
  const apiKey = activeAccount?.claudeApiKey || config.claudeApiKey;
  if (!apiKey) throw new Error('No Claude API key configured. Add one in Account settings or .env');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}

export async function generateHashtags(caption: string, platforms: string[]): Promise<string[]> {
  const text = await callClaude(
    [
      {
        role: 'user',
        content: `Caption: "${caption}"\nPlatforms: ${platforms.join(', ')}\n\nGenerate 15-20 relevant hashtags as a JSON array of strings (no # prefix). Mix: 3-4 broad (>1M posts), 8-10 niche (50k-500k posts), 3-4 hyper-niche (<50k posts). Return only valid JSON array, nothing else.`,
      },
    ],
    'You are a social media hashtag expert. Return only valid JSON arrays, no markdown, no explanation.'
  );
  try {
    const parsed = JSON.parse(text.trim());
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // fallback: extract words that look like tags
    return text.match(/\b[a-zA-Z][a-zA-Z0-9_]{2,}\b/g)?.slice(0, 20) || [];
  }
}

export async function draftReplies(comments: string[]): Promise<{ comment: string; reply: string }[]> {
  if (!comments.length) return [];
  const text = await callClaude(
    [
      {
        role: 'user',
        content: `Draft a reply for each of these social media comments. Return a JSON array of objects with "comment" and "reply" keys. Be warm, genuine, concise (1-2 sentences max), never sycophantic. Match the energy of each comment.\n\nComments:\n${comments.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nReturn only valid JSON array, nothing else.`,
      },
    ],
    'You are drafting social media replies on behalf of the account owner. Replies should feel human and authentic. Return only valid JSON.'
  );
  try {
    const parsed = JSON.parse(text.trim());
    return Array.isArray(parsed) ? parsed : comments.map((c) => ({ comment: c, reply: '' }));
  } catch {
    return comments.map((c) => ({ comment: c, reply: 'Thanks for the comment!' }));
  }
}
