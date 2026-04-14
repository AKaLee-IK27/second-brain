import { Brain, Bot, Wrench, BookOpen, Settings, BarChart3, FolderOpen, Link, FileText, Palette, Zap, Terminal, Cpu, Shield, Search, Code2, PenTool, Database, Network, Sparkles } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

/**
 * Lucide icon map for replacing emoji icons in agents, skills, and other content.
 * 
 * Usage:
 * import { getIconForEmoji } from './AgentIcons';
 * const Icon = getIconForEmoji(agent.emoji) || Bot;
 * <Icon size={32} className="text-primary" />
 */

const emojiToIcon: Record<string, React.ComponentType<LucideProps>> = {
  // Brain / Intelligence
  '🧠': Brain,
  '🧠‍💻': Brain,
  '💡': Zap,
  '⚡': Zap,
  
  // Robot / AI Agent
  '🤖': Bot,
  '👾': Bot,
  '🦾': Bot,
  
  // Tools / Skills
  '🔧': Wrench,
  '🛠️': Wrench,
  '⚙️': Settings,
  '🔨': Wrench,
  
  // Books / Knowledge
  '📚': BookOpen,
  '📖': BookOpen,
  '📕': BookOpen,
  '📗': BookOpen,
  '📘': BookOpen,
  '📙': BookOpen,
  
  // Settings / Config
  '🔩': Settings,
  '🎛️': Settings,
  
  // Charts / Stats
  '📊': BarChart3,
  '📈': BarChart3,
  '📉': BarChart3,
  '📋': BarChart3,
  
  // Folders
  '📁': FolderOpen,
  '📂': FolderOpen,
  '🗂️': FolderOpen,
  
  // Links
  '🔗': Link,
  '🔌': Link,
  
  // Documents
  '📝': FileText,
  '📄': FileText,
  '📃': FileText,
  '📑': FileText,
  '📜': FileText,
  
  // Design / Art
  '🎨': Palette,
  '🖌️': Palette,
  '🖍️': Palette,
  '✏️': PenTool,
  
  // Code / Terminal
  '💻': Terminal,
  '🖥️': Terminal,
  '⌨️': Terminal,
  '🔮': Cpu,
  
  // Security
  '🔒': Shield,
  '🔐': Shield,
  '🛡️': Shield,
  
  // Search
  '🔍': Search,
  '🔎': Search,
  '🧐': Search,
  
  // Code
  '💾': Code2,
  '🗄️': Database,
  '🌐': Network,
  '✨': Sparkles,
};

/**
 * Get a Lucide icon component for an emoji character.
 * Falls back to the default icon if no mapping exists.
 */
export function getIconForEmoji(
  emoji: string | undefined,
  defaultIcon: React.ComponentType<LucideProps> = Bot
): React.ComponentType<LucideProps> {
  if (!emoji) return defaultIcon;
  return emojiToIcon[emoji] || defaultIcon;
}

/**
 * Icon component that renders either a Lucide icon (for known emojis)
 * or the emoji character itself (for unknown emojis).
 */
export function SmartIcon({
  emoji,
  defaultIcon: DefaultIcon = Bot,
  size = 20,
  className = '',
}: {
  emoji?: string;
  defaultIcon?: React.ComponentType<LucideProps>;
  size?: number;
  className?: string;
}) {
  if (!emoji) {
    const Icon = DefaultIcon;
    return <Icon size={size} strokeWidth={1.5} className={className} />;
  }

  const Icon = emojiToIcon[emoji];
  if (Icon) {
    return <Icon size={size} strokeWidth={1.5} className={className} />;
  }

  // Fallback: render the emoji character
  return <span className="text-2xl">{emoji}</span>;
}

// Export all icons for direct use
export {
  Brain, Bot, Wrench, BookOpen, Settings, BarChart3, FolderOpen, Link, FileText, Palette,
  Zap, Terminal, Cpu, Shield, Search, Code2, PenTool, Database, Network, Sparkles,
};
