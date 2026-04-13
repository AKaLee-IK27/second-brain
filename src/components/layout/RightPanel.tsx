import { useUIStore } from '../../state/ui-store';
import { Icon, type IconName } from '../shared/Icon';
import NoteInfoPanel from './NoteInfoPanel';
import BacklinksPanel from './BacklinksPanel';
import MiniGraph from '../graph/MiniGraph';
import OutlinePanel from './OutlinePanel';

type TabKey = 'info' | 'backlinks' | 'graph' | 'outline';

const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'info', label: 'Info', icon: 'Info' },
  { key: 'backlinks', label: 'Links', icon: 'Link' },
  { key: 'graph', label: 'Graph', icon: 'Hexagon' },
  { key: 'outline', label: 'Outline', icon: 'List' },
];

function RightPanel() {
  const { rightPanelTab, setRightPanelTab } = useUIStore();

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="flex border-b border-sb-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRightPanelTab(tab.key)}
            className={`flex-1 py-2 text-xs font-display font-medium border-r border-sb-border last:border-r-0 transition-all ${
              rightPanelTab === tab.key
                ? 'bg-sb-yellow-tint text-sb-text font-semibold'
                : 'bg-sb-surface hover:bg-sb-surface-alt text-sb-text-secondary'
            }`}
          >
            <Icon name={tab.icon} size={12} ariaHidden /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {rightPanelTab === 'info' && <NoteInfoPanel />}
        {rightPanelTab === 'backlinks' && <BacklinksPanel />}
        {rightPanelTab === 'graph' && <MiniGraph />}
        {rightPanelTab === 'outline' && <OutlinePanel />}
      </div>
    </div>
  );
}

export default RightPanel;
