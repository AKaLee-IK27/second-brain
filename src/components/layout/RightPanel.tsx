import { useUIStore } from '../../state/ui-store';
import { MaterialIcon } from '../shared/MaterialIcon';
import NoteInfoPanel from './NoteInfoPanel';
import BacklinksPanel from './BacklinksPanel';
import OutlinePanel from './OutlinePanel';
import { UnifiedGraph } from '../graph/UnifiedGraph';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import { useState, useEffect } from 'react';
import type { GraphNode, GraphEdge } from '../../types/graph';

type TabKey = 'info' | 'backlinks' | 'graph' | 'outline';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'info', label: 'Info', icon: 'info' },
  { key: 'backlinks', label: 'Links', icon: 'link' },
  { key: 'graph', label: 'Graph', icon: 'hub' },
  { key: 'outline', label: 'Outline', icon: 'segment' },
];

function RightPanel() {
  const { rightPanelTab, setRightPanelTab } = useUIStore();
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

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="flex border-b border-outline-variant/15">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRightPanelTab(tab.key)}
            className={`flex-1 py-2 text-xs font-headline font-medium border-r border-outline-variant/15 last:border-r-0 transition-all flex items-center justify-center gap-1 ${
              rightPanelTab === tab.key
                ? 'bg-sb-yellow-tint text-on-surface font-semibold'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <MaterialIcon name={tab.icon} size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {rightPanelTab === 'info' && <NoteInfoPanel />}
        {rightPanelTab === 'backlinks' && <BacklinksPanel />}
        {rightPanelTab === 'graph' && (
          <UnifiedGraph
            nodes={graphNodes}
            edges={graphEdges}
            width={240}
            height={160}
            mode="mini"
          />
        )}
        {rightPanelTab === 'outline' && <OutlinePanel />}
      </div>
    </div>
  );
}

export default RightPanel;
