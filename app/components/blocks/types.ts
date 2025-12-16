// Block types for the Notion-inspired block system

export type BlockType =
  | 'text'
  | 'list'
  | 'media'
  | 'code'
  | 'quote'
  | 'layout'
  | 'complex';

export interface BaseBlock {
  id: string;
  type: BlockType;
  content: any; // JSON content specific to each block type
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Text Block Types
export type TextBlockType = 'paragraph' | 'heading1' | 'heading2' | 'heading3';

export interface TextBlockContent {
  type: TextBlockType;
  text: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
}

// List Block Types
export type ListBlockType = 'bulleted' | 'numbered' | 'todo';

export interface ListItem {
  id: string;
  text: string;
  checked?: boolean; // For todo lists
  children?: ListItem[];
}

export interface ListBlockContent {
  type: ListBlockType;
  items: ListItem[];
}

// Media Block Types
export type MediaBlockType = 'image' | 'embed';

export interface MediaBlockContent {
  type: MediaBlockType;
  url?: string;
  alt?: string;
  caption?: string;
  embedType?: 'video' | 'audio' | 'iframe'; // For embeds
}

// Code Block
export interface CodeBlockContent {
  language: string;
  code: string;
  showLineNumbers?: boolean;
}

// Quote Block
export interface QuoteBlockContent {
  text: string;
  author?: string;
  source?: string;
}

// Layout Block Types
export type LayoutBlockType = 'divider' | 'callout';

export interface LayoutBlockContent {
  type: LayoutBlockType;
  text?: string; // For callout
  icon?: string; // For callout
}

// Complex Block (wrapping existing viewers)
export type ComplexBlockType = 'mindmap' | 'chart' | 'timeline' | 'other';

export interface ComplexBlockContent {
  type: ComplexBlockType;
  data: any; // Data specific to the viewer component
  viewerType: string; // e.g., 'mindmap-professional', 'timeline-professional'
}

// Union type for all block contents
export type BlockContent =
  | TextBlockContent
  | ListBlockContent
  | MediaBlockContent
  | CodeBlockContent
  | QuoteBlockContent
  | LayoutBlockContent
  | ComplexBlockContent;

// Props for block components
export interface BlockProps {
  block: BaseBlock;
  onUpdate?: (content: BlockContent) => void;
  onDelete?: () => void;
  isEditing?: boolean;
  className?: string;
}