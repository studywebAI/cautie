'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Save,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  Type,
  Image as ImageIcon,
  Play,
  CheckSquare,
  FileText,
  List,
  Video,
  Code,
  Quote
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'multiple_choice' | 'open_question' | 'fill_in_blank' | 'drag_drop' | 'ordering' | 'media_embed' | 'divider';
  position: number;
  data: any;
}

interface AssignmentEditorProps {
  assignmentId?: string;
  assignmentIndex: number;
  paragraphId: string;
  initialTitle?: string;
  initialBlocks?: Block[];
  onSave: (data: { title: string; blocks: Block[]; answers_enabled: boolean }) => Promise<void>;
  onCancel: () => void;
}

const blockTemplates = [
  { type: 'text' as const, label: 'Text', icon: Type, description: 'Rich text content' },
  { type: 'image' as const, label: 'Image', icon: ImageIcon, description: 'Image with caption' },
  { type: 'video' as const, label: 'Video', icon: Video, description: 'Embedded video' },
  { type: 'multiple_choice' as const, label: 'Multiple Choice', icon: CheckSquare, description: 'Single correct answer' },
  { type: 'open_question' as const, label: 'Open Question', icon: FileText, description: 'Free text response' },
  { type: 'fill_in_blank' as const, label: 'Fill in Blank', icon: Type, description: 'Missing word/phrase' },
  { type: 'drag_drop' as const, label: 'Drag & Drop', icon: GripVertical, description: 'Match items' },
  { type: 'ordering' as const, label: 'Ordering', icon: List, description: 'Put in correct order' },
  { type: 'media_embed' as const, label: 'Media Embed', icon: Code, description: 'Custom embed code' },
  { type: 'divider' as const, label: 'Divider', icon: Separator, description: 'Visual separator' }
];

// Sortable Block Component
function SortableBlock({
  block,
  onClick,
  onDelete,
  onUpdate,
  isSelected
}: {
  block: Block;
  onClick: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  isSelected: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`border rounded-lg p-4 ${
        isDragging ? 'shadow-lg bg-background opacity-50' : 'bg-card'
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div {...listeners} className="cursor-grab">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <Badge variant="outline">
          {blockTemplates.find(t => t.type === block.type)?.label || block.type}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-auto text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <BlockEditor
        block={block}
        onUpdate={onUpdate}
      />
    </div>
  );
}

export function AssignmentEditor({
  assignmentId,
  assignmentIndex,
  paragraphId,
  initialTitle = '',
  initialBlocks = [],
  onSave,
  onCancel
}: AssignmentEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [answersEnabled, setAnswersEnabled] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input on mount
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const generateBlockId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const createBlock = (type: Block['type']): Block => {
    const baseData = {
      id: generateBlockId(),
      type,
      position: blocks.length,
      data: {}
    };

    // Initialize block-specific data
    switch (type) {
      case 'text':
        return { ...baseData, data: { content: '' } };
      case 'image':
        return { ...baseData, data: { url: '', alt: '', caption: '' } };
      case 'video':
        return { ...baseData, data: { url: '', caption: '' } };
      case 'multiple_choice':
        return { ...baseData, data: { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' } };
      case 'open_question':
        return { ...baseData, data: { question: '', sampleAnswer: '', gradingCriteria: '' } };
      case 'fill_in_blank':
        return { ...baseData, data: { text: 'The [blank] is important.', blanks: [{ answer: '', caseSensitive: false }] } };
      case 'drag_drop':
        return { ...baseData, data: { instructions: '', items: [], targets: [] } };
      case 'ordering':
        return { ...baseData, data: { instructions: '', items: [] } };
      case 'media_embed':
        return { ...baseData, data: { code: '', caption: '' } };
      case 'divider':
        return { ...baseData, data: {} };
      default:
        return baseData;
    }
  };

  const addBlock = (type: Block['type']) => {
    const newBlock = createBlock(type);
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      // Update positions
      const updatedBlocks = newBlocks.map((block, index) => ({ ...block, position: index }));
      setBlocks(updatedBlocks);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for the assignment');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        blocks,
        answers_enabled: answersEnabled
      });
    } catch (error) {
      console.error('Failed to save assignment:', error);
      alert('Failed to save assignment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex h-screen bg-background">
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                ← Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold">
                  Assignment {String.fromCharCode(97 + assignmentIndex)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {assignmentId ? 'Editing' : 'Creating'} assignment
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Assignment'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isPreview ? (
            <AssignmentPreview blocks={blocks} title={title} />
          ) : (
            <div className="flex h-full">
              {/* Blocks Editor */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Assignment Title</Label>
                      <Input
                        ref={titleInputRef}
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter assignment title..."
                        className="text-xl font-medium"
                      />
                    </div>

                    {/* Answers Toggle */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="answers-enabled"
                        checked={answersEnabled}
                        onChange={(e) => setAnswersEnabled(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="answers-enabled">Enable student answers for this assignment</Label>
                    </div>

                    {/* Blocks */}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                          {blocks.map((block, index) => (
                            <SortableBlock
                              key={block.id}
                              block={block}
                              onClick={() => setSelectedBlockId(block.id)}
                              onDelete={() => deleteBlock(block.id)}
                              onUpdate={(updates) => updateBlock(block.id, updates)}
                              isSelected={selectedBlockId === block.id}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {/* Add Block Button */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Add content to your assignment</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {blockTemplates.map((template) => (
                          <Button
                            key={template.type}
                            variant="outline"
                            size="sm"
                            onClick={() => addBlock(template.type)}
                          >
                            <template.icon className="w-4 h-4 mr-2" />
                            {template.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Block Properties Panel */}
              {selectedBlock && (
                <div className="w-80 border-l bg-muted/50">
                  <div className="p-4">
                    <h3 className="font-medium mb-4">Block Properties</h3>
                    <BlockPropertiesPanel
                      block={selectedBlock}
                      onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Block Editor Component
function BlockEditor({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const updateData = (dataUpdates: any) => {
    onUpdate({ data: { ...block.data, ...dataUpdates } });
  };

  switch (block.type) {
    case 'text':
      return (
        <Textarea
          value={block.data.content || ''}
          onChange={(e) => updateData({ content: e.target.value })}
          placeholder="Enter text content..."
          className="min-h-[100px]"
        />
      );

    case 'image':
      return (
        <div className="space-y-3">
          <Input
            value={block.data.url || ''}
            onChange={(e) => updateData({ url: e.target.value })}
            placeholder="Image URL..."
          />
          <Input
            value={block.data.alt || ''}
            onChange={(e) => updateData({ alt: e.target.value })}
            placeholder="Alt text..."
          />
          <Input
            value={block.data.caption || ''}
            onChange={(e) => updateData({ caption: e.target.value })}
            placeholder="Caption..."
          />
        </div>
      );

    case 'multiple_choice':
      return (
        <div className="space-y-3">
          <Input
            value={block.data.question || ''}
            onChange={(e) => updateData({ question: e.target.value })}
            placeholder="Question..."
          />
          {block.data.options?.map((option: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${block.id}`}
                checked={block.data.correctIndex === index}
                onChange={() => updateData({ correctIndex: index })}
              />
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...(block.data.options || [])];
                  newOptions[index] = e.target.value;
                  updateData({ options: newOptions });
                }}
                placeholder={`Option ${index + 1}...`}
              />
            </div>
          ))}
          <Textarea
            value={block.data.explanation || ''}
            onChange={(e) => updateData({ explanation: e.target.value })}
            placeholder="Explanation (shown after answering)..."
            className="min-h-[60px]"
          />
        </div>
      );

    default:
      return <div className="text-muted-foreground">Block editor for {block.type} coming soon...</div>;
  }
}

// Block Properties Panel
function BlockPropertiesPanel({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Block Type</Label>
        <p className="text-sm text-muted-foreground mt-1 capitalize">{block.type.replace('_', ' ')}</p>
      </div>

      {/* Additional properties based on block type */}
      {block.type === 'text' && (
        <div className="space-y-2">
          <Label className="text-sm">Text Settings</Label>
          {/* Add formatting options here */}
        </div>
      )}
    </div>
  );
}

// Assignment Preview Component
function AssignmentPreview({ blocks, title }: { blocks: Block[]; title: string }) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">Assignment Preview</p>
      </div>

      <div className="space-y-6">
        {blocks.map((block) => (
          <div key={block.id} className="border rounded-lg p-4">
            <BlockPreview block={block} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Block Preview Component
function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.data.content || '' }} />;

    case 'image':
      return (
        <figure className="text-center">
          {block.data.url && (
            <img src={block.data.url} alt={block.data.alt} className="max-w-full h-auto mx-auto rounded" />
          )}
          {block.data.caption && (
            <figcaption className="text-sm text-muted-foreground mt-2">{block.data.caption}</figcaption>
          )}
        </figure>
      );

    case 'multiple_choice':
      return (
        <div className="space-y-3">
          <h3 className="font-medium">{block.data.question}</h3>
          <div className="space-y-2">
            {block.data.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
                  {block.data.correctIndex === index && <div className="w-2 h-2 bg-primary rounded-full" />}
                </div>
                <span>{option}</span>
              </div>
            ))}
          </div>
          {block.data.explanation && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <strong>Explanation:</strong> {block.data.explanation}
            </div>
          )}
        </div>
      );

    default:
      return <div className="text-muted-foreground">Preview for {block.type} block</div>;
  }
}