import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/app-store';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import SetupPage from './SetupPage';
import NotFoundPage from './NotFoundPage';
import SessionsPage from './SessionsPage';
import SessionDetailPage from './SessionDetailPage';
import MigrationPage from './MigrationPage';
import AgentsPage from './AgentsPage';
import AgentDetailPage from './AgentDetailPage';
import SkillsPage from './SkillsPage';
import ConfigsPage from './ConfigsPage';
import StatsPage from './StatsPage';
import TopicsPage from './TopicsPage';
import TopicDetailPage from './TopicDetailPage';

function App() {
  const { isConfigured } = useAppStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcuts: g+s, g+a, g+k, g+t, g+c, g+d, g+m
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      )
        return;
      if (e.key === 'g') {
        const nextHandler = (e2: KeyboardEvent) => {
          window.removeEventListener('keydown', nextHandler);
          const routes: Record<string, string> = {
            s: '/sessions',
            a: '/agents',
            k: '/skills',
            t: '/topics',
            c: '/configs',
            d: '/stats',
            m: '/migration',
          };
          if (routes[e2.key]) {
            e2.preventDefault();
            navigate(routes[e2.key]);
          }
        };
        window.addEventListener('keydown', nextHandler, { once: true });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  if (!isConfigured) {
    return <SetupPage />;
  }

  return (
    <div className="h-screen flex flex-col bg-sb-bg">
      <TopBar
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Breadcrumbs />
          <div className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/sessions" replace />}
              />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route
                path="/sessions/:id"
                element={<SessionDetailPage />}
              />
              <Route path="/migration" element={<MigrationPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:slug" element={<AgentDetailPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/configs" element={<ConfigsPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/topics" element={<TopicsPage />} />
              <Route path="/topics/:slug" element={<TopicDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
      </div>
      <StatusBar />
    </div>
  );
}

export default App;
