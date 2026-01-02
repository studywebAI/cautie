// Block types for the hierarchical learning platform

export type BlockType =
  | 'text'
  | 'image'
  | 'video'
  | 'multiple_choice'
  | 'open_question'
  | 'fill_in_blank'
  | 'drag_drop'
  | 'ordering'
  | 'media_embed'
  | 'divider';

export interface BaseBlock {
  id: string;
  type: BlockType;
  content: any; // JSON content specific to each block type
  order_index: number;
  created_at: string;
  updated_at: string;
}

// 1. TextBlock
export interface TextBlockContent {
  content: string;
  style: 'normal' | 'heading' | 'subheading' | 'quote' | 'note' | 'warning';
}

// 2. ImageBlock
export interface ImageBlockContent {
  url: string;
  caption: string;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}

// 3. VideoBlock
export interface VideoBlockContent {
  url: string;
  provider: 'youtube' | 'vimeo' | 'upload';
  start_seconds: number;
  end_seconds: number | null;
}

// 4. MultipleChoiceBlock
export interface MultipleChoiceContent {
  question: string;
  options: Array<{
    id: string;
    text: string;
    correct: boolean;
  }>;
  multiple_correct: boolean;
  shuffle: boolean;
}

// 5. OpenQuestionBlock (AI grading enabled)
export interface OpenQuestionContent {
  question: string;
  ai_grading: boolean;
  grading_criteria: string;
  max_score: number;
}

// 6. FillInBlankBlock
export interface FillInBlankContent {
  text: string; // e.g., "Ik ___ naar school."
  answers: string[]; // e.g., ["ga", "loop"]
  case_sensitive: boolean;
}

// 7. DragDropBlock
export interface DragDropContent {
  prompt: string;
  pairs: Array<{
    left: string;
    right: string;
  }>;
}

// 8. OrderingBlock
export interface OrderingContent {
  prompt: string;
  items: string[];
  correct_order: number[];
}

// 9. MediaEmbedBlock
export interface MediaEmbedContent {
  embed_url: string;
  description: string;
}

// 10. DividerBlock
export interface DividerContent {
  style: 'line' | 'space' | 'page_break';
}

// Union type for all block contents
export type BlockContent =
  | TextBlockContent
  | ImageBlockContent
  | VideoBlockContent
  | MultipleChoiceContent
  | OpenQuestionContent
  | FillInBlankContent
  | DragDropContent
  | OrderingContent
  | MediaEmbedContent
  | DividerContent;

// Props for block components
export interface BlockProps {
  block: BaseBlock;
  onUpdate?: (content: BlockContent) => void;
  onDelete?: () => void;
  isEditing?: boolean;
  className?: string;
}