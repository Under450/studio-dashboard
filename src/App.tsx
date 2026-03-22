import React, { useState, createContext, useContext } from 'react';
import { Sidebar } from './components/Sidebar';
import { CreateImagePanel } from './panels/CreateImage';
import { CreatePostPanel } from './panels/CreatePost';
import { SchedulePanel } from './panels/Schedule';
import { EngagementPanel } from './panels/Engagement';
import type { AppContextType, PanelId, PostDraft } from './types';

const defaultPost: PostDraft = {
  caption: '',
  platforms: [],
  hashtags: [],
};

export const AppContext = createContext<AppContextType>({
  currentPost: defaultPost,
  setCurrentPost: () => {},
  activePanel: 'create-image',
  setActivePanel: () => {},
  postizConnected: false,
});

export function useApp() {
  return useContext(AppContext);
}

export default function App() {
  const [currentPost, setCurrentPost] = useState<PostDraft>(defaultPost);
  const [activePanel, setActivePanel] = useState<PanelId>('create-image');
  const [postizConnected] = useState(false);

  const panels: Record<PanelId, React.ReactElement> = {
    'create-image': <CreateImagePanel />,
    'create-post': <CreatePostPanel />,
    schedule: <SchedulePanel />,
    engagement: <EngagementPanel />,
  };

  return (
    <AppContext.Provider value={{ currentPost, setCurrentPost, activePanel, setActivePanel, postizConnected }}>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--studio-bg)' }}>
        <Sidebar activePanel={activePanel} onNavigate={setActivePanel} />
        <main
          style={{
            marginLeft: 220,
            minHeight: '100vh',
            padding: '52px 56px',
            flex: 1,
          }}
        >
          {panels[activePanel]}
        </main>
      </div>
    </AppContext.Provider>
  );
}
