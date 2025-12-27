// Block-based content system types
// Following LearnBeat specification exactly

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

// Base block interface
export interface BaseBlock {
  id: string;
  assignment_id: string;
  type: BlockType;
  position: number;
  data: BlockData;
  created_at: string;
  updated_at: string;
}

// Union type for all block data
export type BlockData =
  | TextBlockData
  | ImageBlockData
  | VideoBlockData
  | MultipleChoiceBlockData
  | OpenQuestionBlockData
  | FillInBlankBlockData
  | DragDropBlockData
  | OrderingBlockData
  | MediaEmbedBlockData
  | DividerBlockData;

// Text Block
export interface TextBlockData {
  content: string;
  style: 'normal' | 'heading' | 'subheading' | 'quote' | 'note' | 'warning';
}

// Image Block
export interface ImageBlockData {
  url: string;
  caption: string;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}

// Video Block
export interface VideoBlockData {
  url: string;
  provider: 'youtube' | 'vimeo' | 'upload';
  start_seconds: number;
  end_seconds: number | null;
}

// Multiple Choice Block
export interface MultipleChoiceBlockData {
  question: string;
  options: Array<{
    id: string;
    text: string;
    correct: boolean;
  }>;
  multiple_correct: boolean;
  shuffle: boolean;
}

// Open Question Block
export interface OpenQuestionBlockData {
  question: string;
  ai_grading: boolean;
  grading_criteria: string;
  max_score: number;
}

// Fill-in-the-Blank Block
export interface FillInBlankBlockData {
  text: string; // e.g., "Ik ___ naar school."
  answers: string[]; // e.g., ["ga", "loop"]
  case_sensitive: boolean;
}

// Drag & Drop Block
export interface DragDropBlockData {
  prompt: string;
  pairs: Array<{
    left: string;
    right: string;
  }>;
}

// Ordering Block
export interface OrderingBlockData {
  prompt: string;
  items: string[];
  correct_order: number[];
}

// Media Embed Block
export interface MediaEmbedBlockData {
  embed_url: string;
  description: string;
}

// Divider Block
export interface DividerBlockData {
  style: 'line' | 'space' | 'page_break';
}

// Student Answer types
export interface StudentAnswer {
  id: string;
  student_id: string;
  block_id: string;
  answer_data: AnswerData;
  is_correct: boolean | null;
  score: number | null;
  feedback: string | null;
  graded_by_ai: boolean;
  graded_at: string | null;
  submitted_at: string;
}

// Union type for answer data (matches block types)
export type AnswerData =
  | TextAnswerData
  | MultipleChoiceAnswerData
  | FillInBlankAnswerData
  | DragDropAnswerData
  | OrderingAnswerData;

// Text answer (for open questions)
export interface TextAnswerData {
  text: string;
}

// Multiple choice answer
export interface MultipleChoiceAnswerData {
  selected_options: string[]; // array of option IDs
}

// Fill-in-the-blank answer
export interface FillInBlankAnswerData {
  answers: string[]; // filled blanks
}

// Drag & drop answer
export interface DragDropAnswerData {
  mapping: Record<string, string>; // left -> right mapping
}

// Ordering answer
export interface OrderingAnswerData {
  order: number[]; // indices in user's order
}

// Progress tracking
export interface ProgressSnapshot {
  student_id: string;
  paragraph_id: string;
  completion_percent: number;
  updated_at: string;
}

// Session logging
export interface SessionLog {
  id: string;
  student_id: string;
  paragraph_id: string;
  started_at: string;
  finished_at: string | null;
  created_at: string;
}

// Assignment with full data
export interface AssignmentWithBlocks {
  id: string;
  paragraph_id: string;
  assignment_index: number;
  title: string;
  answers_enabled: boolean;
  created_at: string;
  updated_at: string;
  blocks: BaseBlock[];
}

// Utility functions for block operations
export function isInteractiveBlock(type: BlockType): boolean {
  return ['multiple_choice', 'open_question', 'fill_in_blank', 'drag_drop', 'ordering'].includes(type);
}

export function requiresGrading(type: BlockType): boolean {
  return type === 'open_question';
}

export function assignmentIndexToLetter(index: number): string {
  if (index < 26) {
    return String.fromCharCode(97 + index); // a-z
  }

  // Multi-letter indexing (aa, ab, etc.)
  let result = '';
  let remainder: number;
  let idx = index;

  while (idx >= 0) {
    remainder = idx % 26;
    result = String.fromCharCode(97 + remainder) + result;
    idx = Math.floor(idx / 26) - 1;
    if (idx < 0) break;
  }

  return result;
}

export function letterToAssignmentIndex(letter: string): number {
  if (letter.length === 1) {
    return letter.charCodeAt(0) - 97;
  }

  // Multi-letter (aa = 26, ab = 27, etc.)
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 97 + 1);
  }
  return result - 1;
}

// Type guards for block data
export function isTextBlockData(data: BlockData): data is TextBlockData {
  return 'content' in data && 'style' in data;
}

export function isImageBlockData(data: BlockData): data is ImageBlockData {
  return 'url' in data && 'transform' in data;
}

export function isVideoBlockData(data: BlockData): data is VideoBlockData {
  return 'url' in data && 'provider' in data;
}

export function isMultipleChoiceBlockData(data: BlockData): data is MultipleChoiceBlockData {
  return 'question' in data && 'options' in data;
}

export function isOpenQuestionBlockData(data: BlockData): data is OpenQuestionBlockData {
  return 'question' in data && 'ai_grading' in data;
}

export function isFillInBlankBlockData(data: BlockData): data is FillInBlankBlockData {
  return 'text' in data && 'answers' in data && Array.isArray((data as any).answers);
}

export function isDragDropBlockData(data: BlockData): data is DragDropBlockData {
  return 'prompt' in data && 'pairs' in data;
}

export function isOrderingBlockData(data: BlockData): data is OrderingBlockData {
  return 'prompt' in data && 'items' in data && 'correct_order' in data;
}

export function isMediaEmbedBlockData(data: BlockData): data is MediaEmbedBlockData {
  return 'embed_url' in data && 'description' in data;
}

export function isDividerBlockData(data: BlockData): data is DividerBlockData {
  return 'style' in data;
}