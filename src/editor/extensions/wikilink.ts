import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface WikilinkOptions {
  HTMLAttributes: Record<string, any>;
  onClick?: (linkText: string) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikilink: {
      insertWikilink: (linkText: string) => ReturnType;
    };
  }
}

export const Wikilink = Node.create<WikilinkOptions>({
  name: 'wikilink',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      onClick: undefined,
    };
  },

  addAttributes() {
    return {
      linkText: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-link-text'),
        renderHTML: (attributes) => ({
          'data-link-text': attributes.linkText,
        }),
      },
      displayText: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-display-text'),
        renderHTML: (attributes) => {
          if (attributes.displayText) {
            return { 'data-display-text': attributes.displayText };
          }
          return {};
        },
      },
      resolved: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-resolved') !== 'false',
        renderHTML: (attributes) => ({
          'data-resolved': attributes.resolved,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="wikilink"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { linkText, displayText, resolved } = node.attrs;
    const classes = resolved ? 'wikilink' : 'wikilink unresolved';
    const display = displayText || linkText;
    return [
      'span',
      mergeAttributes(
        { 'data-type': 'wikilink', class: classes, contenteditable: 'false' },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      `[[${display}]]`,
    ];
  },

  renderText({ node }) {
    const { linkText, displayText } = node.attrs;
    if (displayText) {
      return `[[${linkText}|${displayText}]]`;
    }
    return `[[${linkText}]]`;
  },

  addCommands() {
    return {
      insertWikilink:
        (linkText: string, displayText?: string) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { linkText, displayText: displayText || null, resolved: true },
            })
            .run();
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('wikilink-decoration'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'wikilink') {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: node.attrs.resolved ? 'wikilink' : 'wikilink unresolved',
                  })
                );
              }
            });
            return DecorationSet.create(state.doc, decorations);
          },
          handleClick: (view, pos, event) => {
            const { state } = view;
            const resolved = state.doc.resolve(pos);
            const node = resolved.nodeAfter;
            if (node && node.type.name === 'wikilink' && this.options.onClick) {
              this.options.onClick(node.attrs.linkText);
              event.preventDefault();
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});
