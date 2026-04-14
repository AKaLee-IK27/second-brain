import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/app-store';
import { MaterialIcon } from '../shared/MaterialIcon';

interface SidebarProps {
  collapsed: boolean;
}

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

interface NavGroup {
  label: string;
  icon: string;
  path: string;
  subItems: NavItem[];
}

const navItems: NavItem[] = [
  { path: '/sessions', icon: 'history', label: 'Sessions' },
  { path: '/topics', icon: 'topic', label: 'Topics' },
  { path: '/stats', icon: 'leaderboard', label: 'Stats' },
  { path: '/migration', icon: 'move_up', label: 'Migration' },
];

const openCodeGroup: NavGroup = {
  label: 'OpenCode',
  icon: 'smart_toy',
  path: '/opencode',
  subItems: [
    { path: '/agents', icon: 'smart_toy', label: 'Agents' },
    { path: '/skills', icon: 'terminal', label: 'Skills' },
    { path: '/configs', icon: 'settings_input_component', label: 'Configs' },
  ],
};

function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { dataRoot, watcherStatus } = useAppStore();
  const [openCodeExpanded, setOpenCodeExpanded] = useState(false);

  const displayName = dataRoot
    ? dataRoot.split('/').pop() || dataRoot
    : 'Not configured';

  const isAnyOpenCodeRouteActive = openCodeGroup.subItems.some(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/')
  );

  const handleOpenCodeClick = () => {
    navigate(openCodeGroup.path);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenCodeExpanded((prev) => !prev);
  };

  const handleSubItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      className={`h-full flex flex-col bg-surface-sidebar border-r border-outline-variant/15 transition-all duration-200 ease-in-out font-mono text-xs uppercase tracking-widest ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        {/* Regular nav items */}
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-all duration-150 opacity-80 hover:opacity-100 ${
                isActive
                  ? 'text-on-surface bg-surface-topbar border-l-2 border-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-topbar/50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <MaterialIcon name={item.icon} size={18} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </a>
          );
        })}

        {/* OpenCode Collapsible Group */}
        {!collapsed && (
          <div className="mt-2">
            {/* Group Header */}
            <div
              className={`flex items-center gap-3 px-6 py-3 transition-all duration-150 opacity-80 hover:opacity-100 cursor-pointer ${
                isAnyOpenCodeRouteActive
                  ? 'text-on-surface bg-surface-topbar border-l-2 border-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-topbar/50'
              }`}
              onClick={handleOpenCodeClick}
              title="OpenCode"
            >
              <MaterialIcon name={openCodeGroup.icon} size={18} />
              <span className="truncate flex-1">{openCodeGroup.label}</span>
              <button
                onClick={handleChevronClick}
                className="p-0.5 hover:bg-surface-container rounded transition-colors"
                title={openCodeExpanded ? 'Collapse' : 'Expand'}
              >
                <MaterialIcon
                  name={openCodeExpanded ? 'expand_more' : 'chevron_right'}
                  size={12}
                />
              </button>
            </div>

            {/* Sub-items */}
            {openCodeExpanded && (
              <div className="ml-4 mt-1 space-y-0.5">
                {openCodeGroup.subItems.map((subItem) => {
                  const isActive =
                    location.pathname === subItem.path ||
                    location.pathname.startsWith(subItem.path + '/');
                  return (
                    <a
                      key={subItem.path}
                      href={subItem.path}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubItemClick(subItem.path);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'text-on-surface bg-surface-topbar/50'
                          : 'text-on-surface-variant hover:bg-surface-topbar/50'
                      }`}
                    >
                      <MaterialIcon name={subItem.icon} size={16} />
                      <span className="truncate">{subItem.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-outline-variant/15 p-6 space-y-4">
          {/* Data Root Indicator */}
          <div className="flex items-center gap-3 text-on-surface-variant">
            <MaterialIcon name="folder" size={14} />
            <span className="text-[10px] truncate" title={dataRoot || undefined}>
              {displayName}
            </span>
          </div>

          {/* File Watcher Status */}
          <div className={`flex items-center gap-3 ${watcherStatus === 'watching' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
            <MaterialIcon name="database" size={14} />
            <span className="text-[10px]">
              {watcherStatus === 'watching' ? 'Connected' : watcherStatus === 'error' ? 'Error' : 'Idle'}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
