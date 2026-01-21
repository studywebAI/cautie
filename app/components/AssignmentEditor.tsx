'use client';

import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  CheckSquare,
  MessageSquare,
  Type,
  Move,
  ListOrdered,
  Link,
  Minus,
  Save,
  Eye,
  Plus,
  GripVertical,
  PenTool,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/contexts/app-context';

interface BlockTemplate {
  id: string;
  type: string;
  icon: string;
  label: string;
  defaultData: any;
}

interface AssignmentBlock {
  id: string;
  type: string;
  position: number; // Now just the order/index
  data: any;
}

interface AssignmentEditorProps {
  assignmentId: string;
  subjectId: string;
  chapterId: string;
  paragraphId: string;
  initialBlocks?: AssignmentBlock[];
  onSave?: (blocks: AssignmentBlock[]) => void;
  onPreview?: () => void;
}

const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    id: 'text',
    type: 'text',
    icon: 'T',
    label: 'Text',
    defaultData: { content: 'Enter your text here...', style: 'normal' }
  },
  {
    id: 'multiple_choice',
    type: 'multiple_choice',
    icon: 'MC',
    label: 'Multiple Choice',
    defaultData: {
      question: 'Enter your question?',
      options: [
        { id: 'a', text: 'Option A', correct: false },
        { id: 'b', text: 'Option B', correct: false },
        { id: 'c', text: 'Option C', correct: true },
        { id: 'd', text: 'Option D', correct: false }
      ],
      multiple_correct: false,
      shuffle: true
    }
  },
  {
    id: 'open_question',
    type: 'open_question',
    icon: 'OQ',
    label: 'Open Question',
    defaultData: {
      question: 'Enter your question?',
      ai_grading: true,
      grading_criteria: 'Grammar, completeness, accuracy',
      max_score: 5
    }
  },
  {
    id: 'fill_in_blank',
    type: 'fill_in_blank',
    icon: 'FB',
    label: 'Fill in Blank',
    defaultData: {
      text: 'The ___ is the powerhouse of the cell.',
      answers: ['mitochondria'],
      case_sensitive: false
    }
  },
  {
    id: 'drag_drop',
    type: 'drag_drop',
    icon: 'DD',
    label: 'Drag & Drop',
    defaultData: {
      prompt: 'Match the items:',
      pairs: [
        { left: 'Word', right: 'Definition' },
        { left: 'Term', right: 'Explanation' }
      ]
    }
  },
  {
    id: 'ordering',
    type: 'ordering',
    icon: 'OR',
    label: 'Ordering',
    defaultData: {
      prompt: 'Put these in order:',
      items: ['First', 'Second', 'Third'],
      correct_order: [0, 1, 2]
    }
  },
  {
    id: 'media_embed',
    type: 'media_embed',
    icon: 'ME',
    label: 'Media Embed',
    defaultData: {
      embed_url: 'https://www.youtube.com/watch?v=...',
      description: 'Media description'
    }
  },
  {
    id: 'divider',
    type: 'divider',
    icon: '—',
    label: 'Divider',
    defaultData: { style: 'line' }
  }
];

export function AssignmentEditor({
  assignmentId,
  subjectId,
  chapterId,
  paragraphId,
  initialBlocks = [],
  onSave,
  onPreview
}: AssignmentEditorProps) {
  const [blocks, setBlocks] = useState<AssignmentBlock[]>(initialBlocks);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useContext(AppContext) as any;

  // Get subject name - for now using subjectId, should be fetched from API
  const subjectName = "Subject Name"; // TODO: Fetch from API

  const addBlock = (template: BlockTemplate) => {
    const newBlock: AssignmentBlock = {
      id: `block-${Date.now()}`,
      type: template.type,
      position: blocks.length,
      data: { ...template.defaultData }
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (blockId: string, newData: any) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? { ...block, data: newData } : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];

    // Update positions
    newBlocks.forEach((block, index) => {
      block.position = index;
    });

    setBlocks(newBlocks);
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    const newBlocks = [...blocks];
    const [draggedBlockData] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlockData);

    // Update positions
    newBlocks.forEach((block, index) => {
      block.position = index;
    });

    setBlocks(newBlocks);
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    try {
      // Save all blocks to the database
      for (const block of blocks) {
        const response = await fetch(
          `/api/subjects/${subjectId}/chapters/${chapterId}/paragraphs/${paragraphId}/assignments/${assignmentId}/blocks`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: block.type,
              position: block.position,
              data: block.data
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to save block ${block.id}`);
        }
      }

      toast({
        title: 'Assignment Saved',
        description: 'All blocks have been saved successfully.',
      });

      if (onSave) onSave(blocks);
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save assignment.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main content - Paper-like layout */}
      <div className="flex-1 flex flex-col">
        {/* Header like a test paper */}
        <div className="bg-white border-b p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-600">Name: {user?.email || 'Student Name'}</div>
                <div className="text-sm text-gray-600">Class: {subjectName}</div>
              </div>
              <div className="text-sm text-gray-600">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
            <div className="border-t-2 border-black pt-4">
              <h1 className="text-2xl font-bold text-center">Assignment</h1>
            </div>
          </div>
        </div>

        {/* Paper content area */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-2 border-gray-300 min-h-[800px] p-8 shadow-sm">
              {blocks.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No content yet</p>
                    <p className="text-sm">Add blocks from the sidebar to create your assignment</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, block.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`relative group border-2 transition-colors ${
                        draggedBlock === block.id ? 'opacity-50' : ''
                      } ${
                        dragOverIndex === index ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                      }`}
                    >
                      {/* Block controls */}
                      <div className="absolute -left-20 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                          {/* Move handle */}
                          <div className="cursor-move p-1 hover:bg-gray-100 rounded">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          {/* Edit button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBlock(block.id)}
                            className="h-6 w-6 p-0"
                            title="Edit block"
                          >
                            <PenTool className="h-3 w-3" />
                          </Button>
                        </div>
                        {/* Quick actions */}
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveBlock(block.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                            title="Move up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveBlock(block.id, 'down')}
                            disabled={index === blocks.length - 1}
                            className="h-6 w-6 p-0"
                            title="Move down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBlock(block.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            title="Delete block"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Block number */}
                      <div className="absolute -left-8 top-0 text-gray-400 font-medium">
                        {index + 1}.
                      </div>

                      {/* Block content with inline editing */}
                      <div className="border-b border-gray-200 pb-4 pl-4">
                        {block.type === 'text' && (
                          <div className="space-y-2">
                            <Textarea
                              value={block.data.content}
                              onChange={(e) => updateBlock(block.id, { ...block.data, content: e.target.value })}
                              placeholder="Enter your text here..."
                              className="min-h-[60px] border-none shadow-none p-0 text-base resize-none focus:ring-0"
                            />
                          </div>
                        )}

                        {block.type === 'multiple_choice' && (
                          <div className="space-y-4">
                            <Input
                              value={block.data.question}
                              onChange={(e) => updateBlock(block.id, { ...block.data, question: e.target.value })}
                              placeholder="Enter your question..."
                              className="text-lg font-medium border-none shadow-none p-0 focus:ring-0"
                            />
                            <div className="space-y-2 pl-4">
                              {block.data.options?.map((option: any, optionIndex: number) => (
                                <div key={option.id} className="flex items-center gap-3">
                                  <Checkbox
                                    checked={option.correct}
                                    onCheckedChange={(checked) => {
                                      const newOptions = [...block.data.options];
                                      newOptions[optionIndex] = { ...newOptions[optionIndex], correct: checked };
                                      updateBlock(block.id, { ...block.data, options: newOptions });
                                    }}
                                  />
                                  <Input
                                    value={option.text}
                                    onChange={(e) => {
                                      const newOptions = [...block.data.options];
                                      newOptions[optionIndex] = { ...newOptions[optionIndex], text: e.target.value };
                                      updateBlock(block.id, { ...block.data, options: newOptions });
                                    }}
                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    className="flex-1 border-none shadow-none p-0 focus:ring-0"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'open_question' && (
                          <div className="space-y-4">
                            <Input
                              value={block.data.question}
                              onChange={(e) => updateBlock(block.id, { ...block.data, question: e.target.value })}
                              placeholder="Enter your question..."
                              className="text-lg font-medium border-none shadow-none p-0 focus:ring-0"
                            />
                            <div className="pl-4 space-y-2">
                              <div className="text-sm text-gray-600">
                                (Answer space below - {block.data.max_score} points)
                              </div>
                              <div className="border-b-2 border-gray-300 min-h-[80px] pb-4"></div> {/* Answer space */}
                            </div>
                          </div>
                        )}

                        {block.type === 'fill_in_blank' && (
                          <div className="space-y-2">
                            <div className="text-lg">
                              {block.data.text.split('___').map((part: string, partIndex: number) => (
                                <React.Fragment key={partIndex}>
                                  {part}
                                  {partIndex < block.data.text.split('___').length - 1 && (
                                    <Input
                                      value={block.data.answers?.[partIndex] || ''}
                                      onChange={(e) => {
                                        const newAnswers = [...(block.data.answers || [])];
                                        newAnswers[partIndex] = e.target.value;
                                        updateBlock(block.id, { ...block.data, answers: newAnswers });
                                      }}
                                      className="inline-block w-32 mx-1 border-b-2 border-gray-400 rounded-none"
                                      placeholder="..."
                                    />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'divider' && (
                          <hr className="border-t-2 border-gray-300 my-4" />
                        )}

                        {/* Other block types show as JSON for now */}
                        {!['text', 'multiple_choice', 'open_question', 'fill_in_blank', 'divider'].includes(block.type) && (
                          <div className="text-sm text-gray-500 italic">
                            {BLOCK_TEMPLATES.find(t => t.type === block.type)?.label} block - content will be rendered here
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Panel */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Edit {BLOCK_TEMPLATES.find(t => t.type === blocks.find(b => b.id === editingBlock)?.type)?.label}
                </h3>
                <Button variant="ghost" onClick={() => setEditingBlock(null)}>
                  ×
                </Button>
              </div>

              {(() => {
                const block = blocks.find(b => b.id === editingBlock);
                if (!block) return null;

                return (
                  <div className="space-y-4">
                    {block.type === 'text' && (
                      <div>
                        <Label>Content</Label>
                        <Textarea
                          value={block.data.content}
                          onChange={(e) => updateBlock(block.id, { ...block.data, content: e.target.value })}
                          rows={6}
                          className="mt-1"
                        />
                      </div>
                    )}

                    {block.type === 'multiple_choice' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Question</Label>
                          <Input
                            value={block.data.question}
                            onChange={(e) => updateBlock(block.id, { ...block.data, question: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Options</Label>
                          {block.data.options?.map((option: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 mt-2">
                              <input
                                type="radio"
                                name={`correct-${block.id}`}
                                checked={option.correct}
                                onChange={() => {
                                  const newOptions = block.data.options.map((opt: any, i: number) => ({
                                    ...opt,
                                    correct: i === index
                                  }));
                                  updateBlock(block.id, { ...block.data, options: newOptions });
                                }}
                              />
                              <Input
                                value={option.text}
                                onChange={(e) => {
                                  const newOptions = [...block.data.options];
                                  newOptions[index] = { ...newOptions[index], text: e.target.value };
                                  updateBlock(block.id, { ...block.data, options: newOptions });
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.type === 'open_question' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Question</Label>
                          <Input
                            value={block.data.question}
                            onChange={(e) => updateBlock(block.id, { ...block.data, question: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Grading Criteria</Label>
                          <Input
                            value={block.data.grading_criteria}
                            onChange={(e) => updateBlock(block.id, { ...block.data, grading_criteria: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Max Score</Label>
                          <Input
                            type="number"
                            min="1"
                            value={block.data.max_score}
                            onChange={(e) => updateBlock(block.id, { ...block.data, max_score: parseInt(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {block.type === 'fill_in_blank' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Text with Blanks</Label>
                          <Textarea
                            value={block.data.text}
                            onChange={(e) => updateBlock(block.id, { ...block.data, text: e.target.value })}
                            placeholder="Use ___ for blanks"
                            rows={4}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Correct Answers (one per blank)</Label>
                          {block.data.text.split('___').slice(0, -1).map((_: string, index: number) => (
                            <Input
                              key={index}
                              value={block.data.answers?.[index] || ''}
                              onChange={(e) => {
                                const newAnswers = [...(block.data.answers || [])];
                                newAnswers[index] = e.target.value;
                                updateBlock(block.id, { ...block.data, answers: newAnswers });
                              }}
                              placeholder={`Answer for blank ${index + 1}`}
                              className="mt-2"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setEditingBlock(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setEditingBlock(null)}>
                        Done
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Mini sidebar on the right with small icons */}
      <div className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-2">
        {BLOCK_TEMPLATES.map((template) => (
          <Button
            key={template.id}
            variant="ghost"
            size="sm"
            onClick={() => addBlock(template)}
            className="w-10 h-10 p-0 flex items-center justify-center text-xs font-medium hover:bg-gray-100"
            title={template.label}
          >
            {template.icon}
          </Button>
        ))}

        <div className="flex-1"></div>

        <Button onClick={handleSave} className="w-10 h-10 p-0" title="Save">
          <Save className="h-4 w-4" />
        </Button>

        {onPreview && (
          <Button onClick={onPreview} variant="outline" className="w-10 h-10 p-0" title="Preview">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}