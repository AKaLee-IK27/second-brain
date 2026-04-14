import { createElement } from 'react';
import {
  ClipboardList,
  Users,
  Wrench,
  BookOpen,
  Settings,
  BarChart3,
  ArrowLeftRight,
  PanelLeft,
  PanelLeftClose,
  Brain,
  RefreshCw,
  FolderOpen,
  Info,
  Link,
  Hexagon,
  List,
  MessageSquare,
  Bot,
  Search,
  FileText,
  Keyboard,
  X as XIcon,
  Trash2,
  Zap,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const ICON_MAP = {
  ClipboardList,
  Users,
  Wrench,
  BookOpen,
  Settings,
  BarChart3,
  ArrowLeftRight,
  PanelLeft,
  PanelLeftClose,
  Brain,
  RefreshCw,
  FolderOpen,
  Info,
  Link,
  Hexagon,
  List,
  MessageSquare,
  Bot,
  Search,
  FileText,
  Keyboard,
  X: XIcon,
  Trash2,
  Zap,
  ChevronDown,
  ChevronRight,
} as const;

export type IconName = keyof typeof ICON_MAP;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
  className?: string;
}

export function Icon({
  name,
  size = 24,
  strokeWidth = 2,
  color = 'currentColor',
  ariaLabel,
  ariaHidden,
  className,
}: IconProps) {
  const Component = ICON_MAP[name];

  if (!Component) {
    if (import.meta.env.DEV) {
      console.warn(`[Icon] Unknown icon: "${name}"`);
    }
    return null;
  }

  const isHidden = ariaHidden ?? !ariaLabel;

  return createElement(Component, {
    size,
    strokeWidth,
    color,
    'aria-label': isHidden ? undefined : ariaLabel,
    'aria-hidden': isHidden ? true : undefined,
    className,
  });
}
