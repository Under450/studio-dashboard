import type { Account } from '../types';

const KEY = 'studio_accounts';
const ACTIVE_KEY = 'studio_active_account';

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(KEY, JSON.stringify(accounts));
}

export function loadActiveAccountId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveAccountId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function createAccount(name: string, postizUrl = '', postizApiKey = '', claudeApiKey = ''): Account {
  return {
    id: crypto.randomUUID(),
    name,
    postizUrl,
    postizApiKey,
    claudeApiKey,
    createdAt: Date.now(),
  };
}

export function deleteAccount(accounts: Account[], id: string): Account[] {
  return accounts.filter(a => a.id !== id);
}

export function upsertAccount(accounts: Account[], account: Account): Account[] {
  const idx = accounts.findIndex(a => a.id === account.id);
  if (idx >= 0) {
    const next = [...accounts];
    next[idx] = account;
    return next;
  }
  return [...accounts, account];
}
