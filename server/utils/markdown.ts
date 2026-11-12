import MarkdownIt from 'markdown-it';
import type { RenderedMarkdown } from '../../shared/types/management';
/** Raw HTML is escaped and unsafe URL schemes are rejected by markdown-it. */
const parser = new MarkdownIt({ html: false, linkify: true, breaks: false });
export function renderMarkdown(content: string): RenderedMarkdown {
  const tokens = parser.parse(content, {});
  const toc: RenderedMarkdown['toc'] = [];
  const used = new Map<string, number>();
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (token.type !== 'heading_open') continue;
    const inline = tokens[i + 1];
    const text =
      (inline?.children ?? [])
        .filter((child) => ['text', 'code_inline'].includes(child.type))
        .map((child) => child.content)
        .join('') ||
      inline?.content ||
      'Section';
    const base =
      text
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') || 'section';
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    token.attrSet('id', id);
    const depth = Number(token.tag.slice(1));
    if (depth > 1 && depth < 5) toc.push({ id, text, depth });
  }
  const words = tokens
    .filter((token) => token.type === 'inline')
    .flatMap((token) => token.children ?? [])
    .filter((token) => ['text', 'code_inline'].includes(token.type))
    .map((token) => token.content)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    source: content,
    html: parser.renderer.render(tokens, parser.options, {}),
    toc,
    readingMinutes: Math.max(1, Math.ceil(words / 250)),
  };
}
