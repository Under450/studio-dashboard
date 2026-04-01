import React, { useState, useEffect, createContext, useContext } from 'react';
import { Sidebar } from './components/Sidebar';
import { AccountManager } from './components/AccountManager';
import { CreateImagePanel } from './panels/CreateImage';
import { CreatePostPanel } from './panels/CreatePost';
import { SchedulePanel } from './panels/Schedule';
import { EngagementPanel } from './panels/Engagement';
import type { AppContextType, PanelId, PostDraft, Account } from './types';
import {
  loadAccounts, loadActiveAccountId, saveAccounts,
  saveActiveAccountId, createAccount,
} from './lib/accounts';

const defaultPost: PostDraft = { caption: '', platforms: [], hashtags: [] };

export const AppContext = createContext<AppContextType>({
  currentPost: defaultPost,
  setCurrentPost: () => {},
  activePanel: 'create-image',
  setActivePanel: () => {},

  activeAccount: null,
  accounts: [],
  setActiveAccount: () => {},
  openAccountManager: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

export default function App() {
  const [currentPost, setCurrentPost] = useState<PostDraft>(defaultPost);
  const [activePanel, setActivePanel] = useState<PanelId>('create-image');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccountState] = useState<Account | null>(null);
  const [accountManagerOpen, setAccountManagerOpen] = useState(false);

  // Load accounts from localStorage on mount
  useEffect(() => {
    const stored = loadAccounts();
    if (stored.length === 0) {
      // Create a default account on first run
      const defaultAcc = createAccount('My Company');
      const all = [defaultAcc];
      saveAccounts(all);
      saveActiveAccountId(defaultAcc.id);
      setAccounts(all);
      setActiveAccountState(defaultAcc);
    } else {
      setAccounts(stored);
      const activeId = loadActiveAccountId();
      const found = stored.find(a => a.id === activeId) ?? stored[0];
      setActiveAccountState(found);
    }
  }, []);


  const setActiveAccount = (account: Account) => {
    setActiveAccountState(account);
    saveActiveAccountId(account.id);
  };

  const handleAccountsChange = (updated: Account[]) => {
    setAccounts(updated);
    // If active account was deleted, pick the first remaining
    if (updated.length > 0 && !updated.find(a => a.id === activeAccount?.id)) {
      setActiveAccount(updated[0]);
    }
  };

  const panels: Record<PanelId, React.ReactElement> = {
    'create-image': <CreateImagePanel />,
    'create-post': <CreatePostPanel />,
    schedule: <SchedulePanel />,
    engagement: <EngagementPanel />,
  };

  return (
    <AppContext.Provider value={{
      currentPost, setCurrentPost,
      activePanel, setActivePanel,

      activeAccount, accounts,
      setActiveAccount,
      openAccountManager: () => setAccountManagerOpen(true),
    }}>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--studio-bg)' }}>
        <Sidebar activePanel={activePanel} onNavigate={setActivePanel} />

        <main style={{ marginLeft: 220, minHeight: '100vh', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Company name header */}
          <header
            style={{
              padding: '28px 56px 22px',
              borderBottom: '1px solid var(--studio-border)',
              backgroundColor: 'var(--studio-panel)',
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--studio-serif)',
                fontSize: '2.2rem',
                fontWeight: 400,
                color: 'var(--studio-ink)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              {activeAccount?.name ?? 'Studio'}
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--studio-ink-4)',
              }}
            >
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </header>

          {/* Panel content */}
          <div style={{ flex: 1, padding: '44px 56px' }}>
            {panels[activePanel]}
          </div>
        </main>
      </div>

      {/* Account manager modal */}
      {accountManagerOpen && (
        <AccountManager
          accounts={accounts}
          activeAccount={activeAccount}
          onClose={() => setAccountManagerOpen(false)}
          onAccountsChange={handleAccountsChange}
          onActiveChange={setActiveAccount}
        />
      )}
    </AppContext.Provider>
  );
}
