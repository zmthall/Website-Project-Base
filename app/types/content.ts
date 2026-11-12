import type { ImageMedia } from '../../shared/types/image';
import type { Action } from '../../shared/types/action';
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; id: string; level: 2 | 3 | 4 }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'code'; text: string; language?: string }
  | { type: 'image'; image: ImageMedia }
  | { type: 'link'; action: Action }
  | { type: 'table'; caption: string; headers: string[]; rows: string[][] };
export interface ContentListItem {
  text: string;
  icon?: string;
  children?: ContentListItem[];
}
