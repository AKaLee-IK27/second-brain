import { useOutline } from '../../hooks/useOutline';

function OutlinePanel() {
  const outline = useOutline();

  if (outline.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sb-text-muted text-sm font-display">
          No headings in this note
        </p>
      </div>
    );
  }

  const handleHeadingClick = (text: string) => {
    const editor = document.querySelector('.ProseMirror');
    if (editor) {
      const headings = editor.querySelectorAll('h1, h2, h3');
      for (const h of headings) {
        if (h.textContent === text) {
          h.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
    }
  };

  return (
    <div className="space-y-0.5">
      {outline.map((item) => (
        <button
          key={item.id}
          className="w-full text-left py-1.5 px-2 text-sm font-display hover:bg-sb-yellow-tint transition-colors border-l-2 border-sb-border rounded-sm truncate text-sb-text"
          style={{ paddingLeft: `${(item.level - 1) * 16 + 8}px` }}
          onClick={() => handleHeadingClick(item.text)}
        >
          <span className="text-xs text-sb-text-muted mr-2">H{item.level}</span>
          {item.text}
        </button>
      ))}
    </div>
  );
}

export default OutlinePanel;
