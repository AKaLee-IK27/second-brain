import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/app-store';
import { useUIStore } from '../state/ui-store';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import StatusBar from '../components/layout/StatusBar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import { UnifiedGraph } from '../components/graph/UnifiedGraph';
import { GraphLegend } from '../components/graph/GraphLegend';
import type { GraphNode, GraphEdge } from '../types/graph';
import SetupPage from './SetupPage';
import NotFoundPage from './NotFoundPage';
import SessionsPage from './SessionsPage';
import SessionDetailPage from './SessionDetailPage';
import MigrationPage from './MigrationPage';
import AgentsPage from './AgentsPage';
import AgentDetailPage from './AgentDetailPage';
import SkillsPage from './SkillsPage';
import SkillDetailPage from './SkillDetailPage';
import ConfigsPage from './ConfigsPage';
import StatsPage from './StatsPage';
import TopicsPage from './TopicsPage';
import TopicDetailPage from './TopicDetailPage';
import OpenCodePage from './OpenCodePage';

function App() {
  const { isConfigured } = useAppStore();
  const { graphOverlayOpen, setGraphOverlayOpen } = useUIStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const { data: graphData } = useApi(
    () => api.graph.get(),
    [],
  );
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);

  useEffect(() => {
    if (graphData) {
      setGraphNodes(graphData.nodes || []);
      setGraphEdges(graphData.edges || []);
    }
  }, [graphData]);

  // Keyboard shortcuts: g+s, g+a, g+k, g+t, g+c, g+d, g+m, g+o
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
            o: '/opencode',
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
    <div className="h-screen flex flex-col bg-background">
      <TopBar
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex-1 flex overflow-hidden mt-12 mb-6">
        <Sidebar
          collapsed={sidebarCollapsed}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Breadcrumbs />
          <div className="flex-1 overflow-y-auto">
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
              <Route path="/skills/:slug" element={<SkillDetailPage />} />
              <Route path="/configs" element={<ConfigsPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/topics" element={<TopicsPage />} />
              <Route path="/topics/:slug" element={<TopicDetailPage />} />
              <Route path="/opencode" element={<OpenCodePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
      </div>
      <StatusBar />

      {/* Full-screen Graph Overlay */}
      {graphOverlayOpen && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          {/* Header */}
          <div className="h-12 flex items-center justify-between px-4 border-b border-outline-variant/15 bg-surface-container/80 backdrop-blur-md shrink-0">
            <h2 className="font-headline font-semibold text-lg text-on-surface">Knowledge Graph</h2>
            <div className="flex items-center gap-4">
              <GraphLegend />
              <button
                onClick={() => setGraphOverlayOpen(false)}
                className="sb-btn px-3 py-1 text-sm text-on-surface-variant"
              >
                × Close
              </button>
            </div>
          </div>

          {/* Graph */}
          <div className="flex-1 overflow-hidden">
            <UnifiedGraph
              nodes={graphNodes}
              edges={graphEdges}
              width={window.innerWidth}
              height={window.innerHeight - 48}
              mode="full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
