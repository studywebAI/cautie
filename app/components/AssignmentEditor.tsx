'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlockTemplate {
  id: string;
  type: string;
  icon: React.ReactNode;
  label: string;
  defaultData: any;
}

interface AssignmentBlock {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  width: number;
  height: number;
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
    icon: <Type className="h-6 w-6" />,
    label: 'Text',
    defaultData: { content: 'Enter your text here...' }
  },
  {
    id: 'multiple_choice',
    type: 'multiple_choice',
    icon: <CheckSquare className="h-6 w-6" />,
    label: 'Multiple Choice',
    defaultData: {
      question: 'Enter your question?',
      options: [
        { id: 'a', text: 'Option A', isCorrect: false },
        { id: 'b', text: 'Option B', isCorrect: false },
        { id: 'c', text: 'Option C', isCorrect: true },
        { id: 'd', text: 'Option D', isCorrect: false }
      ]
    }
  },
  {
    id: 'open_question',
    type: 'open_question',
    icon: <MessageSquare className="h-6 w-6" />,
    label: 'Open Question',
    defaultData: {
      question: 'Enter your question?',
      grading_criteria: 'Grammar, completeness, accuracy',
      max_score: 5
    }
  },
  {
    id: 'fill_blank',
    type: 'fill_in_blank',
    icon: <FileText className="h-6 w-6" />,
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
    icon: <Move className="h-6 w-6" />,
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
    icon: <ListOrdered className="h-6 w-6" />,
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
    icon: <Link className="h-6 w-6" />,
    label: 'Media Embed',
    defaultData: {
      embed_url: 'https://www.youtube.com/watch?v=...',
      description: 'Media description'
    }
  },
  {
    id: 'divider',
    type: 'divider',
    icon: <Minus className="h-6 w-6" />,
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
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [draggedTemplate, setDraggedTemplate] = useState<BlockTemplate | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDragStart = (template: BlockTemplate) => {
    setDraggedTemplate(template);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTemplate || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBlock: AssignmentBlock = {
      id: `block-${Date.now()}`,
      type: draggedTemplate.type,
      position: { x, y },
      data: { ...draggedTemplate.defaultData },
      width: 300,
      height: 150
    };

    setBlocks(prev => [...prev, newBlock]);
    setDraggedTemplate(null);

    toast({
      title: 'Block Added',
      description: `${draggedTemplate.label} block added to assignment.`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBlockClick = (blockId: string) => {
    setSelectedBlock(blockId);
  };

  const updateBlockData = (blockId: string, newData: any) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? { ...block, data: newData } : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlock === blockId) {
      setSelectedBlock(null);
    }
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
              position: blocks.indexOf(block), // Use array index as position
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

  const selectedBlockData = selectedBlock ? blocks.find(b => b.id === selectedBlock) : null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar with block templates */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4 text-gray-800">Block Library</h3>
        <div className="space-y-2">
          {BLOCK_TEMPLATES.map((template) => (
            <div
              key={template.id}
              draggable
              onDragStart={() => handleDragStart(template)}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-move border border-gray-200 transition-colors"
            >
              <div className="text-gray-600">{template.icon}</div>
              <span className="text-sm font-medium text-gray-700">{template.label}</span>
            </div>
          ))}
        </div>

        {/* Save and Preview buttons */}
        <div className="mt-8 space-y-2">
          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Assignment
          </Button>
          {onPreview && (
            <Button onClick={onPreview} variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          )}
        </div>
      </div>

      {/* Main canvas area */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 bg-white m-4 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Canvas background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Empty state */}
          {blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Drag blocks here to start building</p>
                <p className="text-sm">Use the library on the left to add content</p>
              </div>
            </div>
          )}

          {/* Render blocks on canvas */}
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`absolute cursor-pointer border-2 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow ${
                selectedBlock === block.id ? 'border-blue-500' : 'border-gray-300'
              }`}
              style={{
                left: block.position.x,
                top: block.position.y,
                width: block.width,
                minHeight: block.height
              }}
              onClick={() => handleBlockClick(block.id)}
            >
              <div className="text-sm font-medium text-gray-700 mb-2">
                {BLOCK_TEMPLATES.find(t => t.type === block.type)?.label}
              </div>

              {/* Simple preview of block content */}
              {block.type === 'text' && (
                <div className="text-sm text-gray-600 line-clamp-3">
                  {block.data.content}
                </div>
              )}

              {block.type === 'multiple_choice' && (
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">{block.data.question}</div>
                  <div className="text-xs">Multiple choice • {block.data.options?.length} options</div>
                </div>
              )}

              {block.type === 'open_question' && (
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">{block.data.question}</div>
                  <div className="text-xs">Open question • Max {block.data.max_score} points</div>
                </div>
              )}

              {/* Add similar previews for other block types */}

              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBlock(block.id);
                }}
              >
                ×
              </Button>
            </div>
          ))}
        </div>

        {/* Properties panel */}
        {selectedBlockData && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 text-gray-800">
              {BLOCK_TEMPLATES.find(t => t.type === selectedBlockData.type)?.label} Properties
            </h3>

            {/* Block-specific editing interface */}
            {selectedBlockData.type === 'text' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  rows={4}
                  value={selectedBlockData.data.content}
                  onChange={(e) => updateBlockData(selectedBlock!, { ...selectedBlockData.data, content: e.target.value })}
                />
              </div>
            )}

            {selectedBlockData.type === 'multiple_choice' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    value={selectedBlockData.data.question}
                    onChange={(e) => updateBlockData(selectedBlock!, {
                      ...selectedBlockData.data,
                      question: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  {selectedBlockData.data.options?.map((option: any, index: number) => (
                    <div key={option.id} className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name={`correct-${selectedBlock}`}
                        checked={option.isCorrect}
                        onChange={() => {
                          const newOptions = selectedBlockData.data.options.map((opt: any, i: number) => ({
                            ...opt,
                            isCorrect: i === index
                          }));
                          updateBlockData(selectedBlock!, {
                            ...selectedBlockData.data,
                            options: newOptions
                          });
                        }}
                      />
                      <input
                        type="text"
                        className="flex-1 p-1 border border-gray-300 rounded text-sm"
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...selectedBlockData.data.options];
                          newOptions[index] = { ...newOptions[index], text: e.target.value };
                          updateBlockData(selectedBlock!, {
                            ...selectedBlockData.data,
                            options: newOptions
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedBlockData.type === 'open_question' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    value={selectedBlockData.data.question}
                    onChange={(e) => updateBlockData(selectedBlock!, {
                      ...selectedBlockData.data,
                      question: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grading Criteria</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    value={selectedBlockData.data.grading_criteria}
                    onChange={(e) => updateBlockData(selectedBlock!, {
                      ...selectedBlockData.data,
                      grading_criteria: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Score</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    value={selectedBlockData.data.max_score}
                    onChange={(e) => updateBlockData(selectedBlock!, {
                      ...selectedBlockData.data,
                      max_score: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
            )}

            {/* Add editing interfaces for other block types as needed */}
          </div>
        )}
      </div>
    </div>
  );
}