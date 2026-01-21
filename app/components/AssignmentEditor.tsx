'use client';

import React, { useState, useContext, useEffect } from 'react';
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
  Trash2,
  Sparkles,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/contexts/app-context';

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
    icon: <Type className="h-4 w-4" />,
    label: 'Text',
    defaultData: { content: 'Enter your text here...', style: 'normal' }
  },
  {
    id: 'multiple_choice',
    type: 'multiple_choice',
    icon: <CheckSquare className="h-4 w-4" />,
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
    icon: <MessageSquare className="h-4 w-4" />,
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
    icon: <FileText className="h-4 w-4" />,
    label: 'Fill in Blank',
    defaultData: {
      text: 'The capital of France is ___.',
      answers: ['paris'],
      case_sensitive: false
    }
  },
  {
    id: 'drag_drop',
    type: 'drag_drop',
    icon: <Move className="h-4 w-4" />,
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
    icon: <ListOrdered className="h-4 w-4" />,
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
    icon: <Link className="h-4 w-4" />,
    label: 'Media Embed',
    defaultData: {
      embed_url: 'https://www.youtube.com/watch?v=...',
      description: 'Media description'
    }
  },
  {
    id: 'divider',
    type: 'divider',
    icon: <Minus className="h-4 w-4" />,
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
  const [aiBlock, setAiBlock] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiScope, setAiScope] = useState<'block' | 'page' | 'assignment'>('block');
  const [aiTyping, setAiTyping] = useState<string>('');
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [draggedTemplate, setDraggedTemplate] = useState<BlockTemplate | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragPreview, setDragPreview] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isStudentView, setIsStudentView] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [history, setHistory] = useState<AssignmentBlock[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user } = useContext(AppContext) as any;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Undo/Redo functionality
  const saveToHistory = (newBlocks: AssignmentBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newBlocks]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setHasUnsavedChanges(true);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1]);
      setHasUnsavedChanges(true);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1]);
      setHasUnsavedChanges(true);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        handleSave();
      }, 30000); // Auto-save after 30 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, blocks]);

  // Get subject name - fetch from API
  const [subjectName, setSubjectName] = useState<string>("Mathematics");

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await fetch(`/api/subjects/${subjectId}`);
        if (response.ok) {
          const subjectData = await response.json();
          setSubjectName(subjectData.title || subjectData.name || "Mathematics");
        }
      } catch (error) {
        console.error('Failed to fetch subject:', error);
        setSubjectName("Mathematics");
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);



  const updateBlock = (blockId: string, newData: any) => {
    setBlocks(prev => {
      const newBlocks = prev.map(block =>
        block.id === blockId ? { ...block, data: newData } : block
      );
      saveToHistory(newBlocks);
      return newBlocks;
    });
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => {
      const newBlocks = prev.filter(block => block.id !== blockId);
      saveToHistory(newBlocks);
      return newBlocks;
    });
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
    saveToHistory(newBlocks);
  };

  const addBlock = (template: BlockTemplate) => {
    const newBlock: AssignmentBlock = {
      id: `block-${Date.now()}`,
      type: template.type,
      position: blocks.length,
      data: { ...template.defaultData }
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
  };

  const handleDragStart = (e: React.DragEvent, dragId: string) => {
    if (dragId.startsWith('template-')) {
      const templateId = dragId.replace('template-', '');
      const template = BLOCK_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        setDraggedTemplate(template);
        setDraggedBlock(null);
        // Initialize drag preview
        setDragPreview({ x: e.clientX, y: e.clientY, width: 320, height: 120 });
      }
    } else {
      setDraggedBlock(dragId);
      setDraggedTemplate(null);
      // For block reordering, show existing block size
      const block = blocks.find(b => b.id === dragId);
      if (block) {
        setDragPreview({ x: e.clientX, y: e.clientY, width: 320, height: 120 });
      }
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);

    // Update drag preview position
    if (dragPreview) {
      setDragPreview(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    }
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDraggedTemplate(null);
    setDragOverIndex(null);
    setDragPreview(null);
  };

  const handlePaperDrop = (e: React.DragEvent) => {
    e.preventDefault();

    // Only handle template drops on the paper (not reordering existing blocks)
    if (draggedTemplate) {
      const newBlock: AssignmentBlock = {
        id: `block-${Date.now()}`,
        type: draggedTemplate.type,
        position: blocks.length, // Sequential position for saving
        data: { ...draggedTemplate.defaultData }
      };

      const newBlocks = [...blocks, newBlock];
      setBlocks(newBlocks);
      saveToHistory(newBlocks);
      setDraggedTemplate(null);
    }

    setDragOverIndex(null);
  };

  const handleAiRequest = async () => {
    if (!aiBlock || !aiPrompt.trim()) return;

    const block = blocks.find(b => b.id === aiBlock);
    if (!block) return;

    // Check if user has premium subscription (this would be checked against your database)
    const hasPremium = user?.subscription === 'premium'; // This is a placeholder

    if (!hasPremium) {
      toast({
        title: 'Premium Feature',
        description: 'AI content modification is available with a premium subscription.',
        variant: 'destructive'
      });
      return;
    }

    setAiTyping('AI is thinking...');

    try {
      const response = await fetch('/api/ai/modify-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          scope: aiScope,
          blockData: aiScope === 'block' ? block.data : null,
          pageData: aiScope === 'page' ? blocks : null,
          assignmentData: aiScope === 'assignment' ? { blocks, subjectId, chapterId, paragraphId } : null,
          blockType: block.type
        })
      });

      if (response.ok) {
        const result = await response.json();

        // Live typing animation for block modifications
        if (aiScope === 'block' && result.modifiedData) {
          await animateBlockUpdate(aiBlock, result.modifiedData);
        }

        setAiBlock(null);
        setAiPrompt('');
        setAiScope('block');
        setAiTyping('');

        toast({
          title: 'AI Modification Complete',
          description: 'Content has been updated with AI assistance.',
        });
      } else {
        throw new Error('AI request failed');
      }
    } catch (error) {
      setAiTyping('');
      toast({
        title: 'AI Error',
        description: 'Failed to modify content with AI.',
        variant: 'destructive'
      });
    }
  };

  const animateBlockUpdate = async (blockId: string, newData: any) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Create typing animation for text-based content
    if (block.type === 'text' && newData.content) {
      const targetText = newData.content;
      const words = targetText.split(' ');
      let currentText = '';

      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        updateBlock(blockId, { ...newData, content: currentText });

        // Typing delay - faster for shorter content
        await new Promise(resolve => setTimeout(resolve, Math.min(100, 2000 / words.length)));
      }
    } else {
      // For non-text blocks, update immediately
      updateBlock(blockId, newData);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
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

      setLastSaved(new Date());
      setHasUnsavedChanges(false);

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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-white">
      {/* Main content - Full width paper-like layout */}
      <div className="flex flex-col">
        {/* Header like a test paper */}
        <div className="bg-white border-b p-4">
          <div className="max-w-6xl mx-auto">
            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between items-start'} mb-4`}>
              <div>
                <div className="text-sm text-gray-600">Name: {user?.email || 'Student Name'}</div>
                <div className="text-sm text-gray-600">Class: {subjectName}</div>
              </div>
              <div className="text-sm text-gray-600">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Block toolbar - drag to add (hidden in student view) */}
            {!isStudentView && (
              <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-wrap'} gap-2 mb-4 p-3 bg-white border rounded-lg`}>
              <span className="text-sm font-medium text-gray-700">Drag blocks to paper:</span>
              <div className={`flex ${isMobile ? 'flex-wrap' : 'flex-wrap'} gap-2`}>
                {BLOCK_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, `template-${template.id}`)}
                    className="flex items-center gap-1 h-8 px-2 bg-white border border-gray-300 rounded cursor-move hover:bg-gray-50 transition-colors"
                    title={`Drag to add ${template.label}`}
                  >
                    {template.icon}
                    <span className="text-xs">{template.label}</span>
                  </div>
                ))}
              </div>
            </div>
            )}

            <div className="flex justify-between items-center border-t-2 border-black pt-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Assignment</h1>
                {lastSaved && (
                  <span className="text-sm text-gray-500">
                    Saved {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                )}
                {hasUnsavedChanges && (
                  <span className="text-sm text-orange-600 font-medium">• Unsaved changes</span>
                )}
              </div>
              <div className="flex gap-2">
                {/* Undo/Redo */}
                <Button
                  onClick={undo}
                  variant="outline"
                  size="sm"
                  disabled={historyIndex === 0}
                  title="Undo (Ctrl+Z)"
                >
                  ↶
                </Button>
                <Button
                  onClick={redo}
                  variant="outline"
                  size="sm"
                  disabled={historyIndex >= history.length - 1}
                  title="Redo (Ctrl+Y)"
                >
                  ↷
                </Button>

                {/* Student View Toggle */}
                <Button
                  onClick={() => setIsStudentView(!isStudentView)}
                  variant="outline"
                  size="sm"
                  title={isStudentView ? "Switch to Teacher View" : "Switch to Student View"}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {isStudentView ? "Teacher" : "Student"}
                </Button>

                {/* Export */}
                <Button
                  onClick={() => {
                    const dataStr = JSON.stringify({ blocks, subjectName, assignmentId }, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'assignment.json';
                    link.click();
                  }}
                  variant="outline"
                  size="sm"
                  title="Export Assignment"
                >
                  📄 Export
                </Button>

                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={isSaving}
                  title="Save (Ctrl+S)"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Paper content area */}
        <div className={`flex-1 ${isMobile ? 'p-2' : 'p-4'}`}>
          <div className={isMobile ? 'max-w-full mx-2' : 'max-w-6xl mx-auto'}>
            <div
              className={`bg-white border-2 border-gray-300 ${isMobile ? 'min-h-[800px] p-4' : 'min-h-[1200px] p-8'} shadow-sm relative ${isStudentView ? 'pointer-events-none select-text' : ''}`}
              onDrop={isStudentView ? undefined : handlePaperDrop}
              onDragOver={isStudentView ? undefined : (e) => e.preventDefault()}
            >
              {blocks.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No content yet</p>
                    <p className="text-sm">Add blocks from the sidebar to create your assignment</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      draggable={!isStudentView}
                      onDragStart={isStudentView ? undefined : (e) => handleDragStart(e, block.id)}
                      onDragEnd={isStudentView ? undefined : handleDragEnd}
                      onDragOver={isStudentView ? undefined : (e) => handleDragOver(e, index)}

                      className={`relative group border-2 transition-colors ${
                        draggedBlock === block.id ? 'opacity-50' : ''
                      } ${
                        dragOverIndex === index ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                      } ${isStudentView ? 'border-transparent' : ''}`}
                    >
                      {/* Block controls - hidden in student view */}
                      {!isStudentView && (
                        <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-0.5">
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
                          {/* AI button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAiBlock(block.id)}
                            className="h-6 w-6 p-0 text-purple-600 hover:text-purple-700 relative"
                            title="AI Assistant (Premium)"
                          >
                            <Sparkles className="h-3 w-3" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
                          </Button>
                        </div>
                        {/* Quick actions */}
                        <div className="flex flex-col gap-0.5">
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
                      )}

                      {/* Block number - hidden in student view */}
                      <div className="absolute -left-4 top-0 text-gray-400 font-medium">
                        {index + 1}.
                      </div>

                      {/* Block content with inline editing */}
                      <div className="border-b border-gray-200 pb-2">
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
                            <div className="space-y-1 pl-2">
                              {block.data.options?.map((option: any, optionIndex: number) => (
                                <div key={option.id} className="flex items-center gap-2">
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
                            <div className="pl-2 space-y-1">
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

                        {block.type === 'drag_drop' && (
                          <div className="space-y-4">
                            <Input
                              value={block.data.prompt}
                              onChange={(e) => updateBlock(block.id, { ...block.data, prompt: e.target.value })}
                              placeholder="Enter your matching prompt..."
                              className="text-lg font-medium border-none shadow-none p-0 focus:ring-0"
                            />
                            <div className="grid grid-cols-2 gap-8 mt-4">
                              <div className="space-y-2">
                                <div className="text-sm text-gray-600 font-medium mb-2">Column A:</div>
                                {block.data.pairs?.map((pair: any, pairIndex: number) => (
                                  <div key={`left-${pairIndex}`} className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-blue-600 w-6">{String.fromCharCode(65 + pairIndex)}.</span>
                                    <Input
                                      value={pair.left}
                                      onChange={(e) => {
                                        const newPairs = [...block.data.pairs];
                                        newPairs[pairIndex] = { ...newPairs[pairIndex], left: e.target.value };
                                        updateBlock(block.id, { ...block.data, pairs: newPairs });
                                      }}
                                      placeholder="Left item"
                                      className="flex-1 border-none shadow-none p-0 focus:ring-0"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm text-gray-600 font-medium mb-2">Column B:</div>
                                {block.data.pairs?.map((pair: any, pairIndex: number) => (
                                  <div key={`right-${pairIndex}`} className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-green-600 w-6">{pairIndex + 1}.</span>
                                    <Input
                                      value={pair.right}
                                      onChange={(e) => {
                                        const newPairs = [...block.data.pairs];
                                        newPairs[pairIndex] = { ...newPairs[pairIndex], right: e.target.value };
                                        updateBlock(block.id, { ...block.data, pairs: newPairs });
                                      }}
                                      placeholder="Right item"
                                      className="flex-1 border-none shadow-none p-0 focus:ring-0"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 italic mt-2">
                              Students will draw lines to connect matching items between Column A and Column B
                            </div>
                          </div>
                        )}

                        {block.type === 'ordering' && (
                          <div className="space-y-4">
                            <Input
                              value={block.data.prompt}
                              onChange={(e) => updateBlock(block.id, { ...block.data, prompt: e.target.value })}
                              placeholder="Enter your ordering prompt..."
                              className="text-lg font-medium border-none shadow-none p-0 focus:ring-0"
                            />
                            <div className="space-y-2 pl-4">
                              <div className="text-sm text-gray-600 mb-2">Items to order:</div>
                              {block.data.items?.map((item: string, itemIndex: number) => (
                                <div key={itemIndex} className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-500 w-6">{itemIndex + 1}.</span>
                                  <Input
                                    value={item}
                                    onChange={(e) => {
                                      const newItems = [...block.data.items];
                                      newItems[itemIndex] = e.target.value;
                                      updateBlock(block.id, { ...block.data, items: newItems });
                                    }}
                                    placeholder={`Item ${itemIndex + 1}`}
                                    className="flex-1 border-none shadow-none p-0 focus:ring-0"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'divider' && (
                          <hr className="border-t-2 border-gray-300 my-4" />
                        )}

                        {/* Other block types show as JSON for now */}
                        {!['text', 'multiple_choice', 'open_question', 'fill_in_blank', 'drag_drop', 'ordering', 'divider'].includes(block.type) && (
                          <div className="text-sm text-gray-500 italic">
                            {BLOCK_TEMPLATES.find(t => t.type === block.type)?.label} block - content will be rendered here
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Drag Preview */}
              {dragPreview && (
                <div
                  className="fixed pointer-events-none border-2 border-blue-500 bg-blue-100 bg-opacity-70 rounded-lg shadow-lg z-50"
                  style={{
                    left: dragPreview.x - dragPreview.width / 2,
                    top: dragPreview.y - dragPreview.height / 2,
                    width: dragPreview.width,
                    height: dragPreview.height,
                  }}
                >
                  <div className="p-4 text-center text-blue-700 font-medium">
                    {draggedTemplate ? draggedTemplate.label : 'Block'}
                  </div>
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

                    {block.type === 'drag_drop' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Prompt</Label>
                          <Input
                            value={block.data.prompt}
                            onChange={(e) => updateBlock(block.id, { ...block.data, prompt: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Matching Pairs</Label>
                          <div className="grid grid-cols-2 gap-6 mt-2">
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-blue-600">Column A:</div>
                              {block.data.pairs?.map((pair: any, index: number) => (
                                <Input
                                  key={`left-${index}`}
                                  value={pair.left}
                                  onChange={(e) => {
                                    const newPairs = [...block.data.pairs];
                                    newPairs[index] = { ...newPairs[index], left: e.target.value };
                                    updateBlock(block.id, { ...block.data, pairs: newPairs });
                                  }}
                                  placeholder={`Item ${String.fromCharCode(65 + index)}`}
                                  className="w-full"
                                />
                              ))}
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-green-600">Column B:</div>
                              {block.data.pairs?.map((pair: any, index: number) => (
                                <Input
                                  key={`right-${index}`}
                                  value={pair.right}
                                  onChange={(e) => {
                                    const newPairs = [...block.data.pairs];
                                    newPairs[index] = { ...newPairs[index], right: e.target.value };
                                    updateBlock(block.id, { ...block.data, pairs: newPairs });
                                  }}
                                  placeholder={`Match ${index + 1}`}
                                  className="w-full"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            Students will draw lines to connect items between Column A and Column B
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPairs = [...(block.data.pairs || []), { left: '', right: '' }];
                              updateBlock(block.id, { ...block.data, pairs: newPairs });
                            }}
                            className="mt-3"
                          >
                            Add Pair
                          </Button>
                        </div>
                      </div>
                    )}

                    {block.type === 'ordering' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Prompt</Label>
                          <Input
                            value={block.data.prompt}
                            onChange={(e) => updateBlock(block.id, { ...block.data, prompt: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Items to Order</Label>
                          {block.data.items?.map((item: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 mt-2">
                              <span className="text-sm font-medium w-6">{index + 1}.</span>
                              <Input
                                value={item}
                                onChange={(e) => {
                                  const newItems = [...block.data.items];
                                  newItems[index] = e.target.value;
                                  updateBlock(block.id, { ...block.data, items: newItems });
                                }}
                                placeholder={`Item ${index + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newItems = [...(block.data.items || []), ''];
                              updateBlock(block.id, { ...block.data, items: newItems });
                            }}
                            className="mt-2"
                          >
                            Add Item
                          </Button>
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

      {/* AI Assistant Interface */}
      {aiBlock && (
        <div className={`fixed z-50 ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-4 right-4'}`}>
          <div className={`bg-white rounded-lg shadow-xl border p-4 ${isMobile ? 'w-full max-w-sm' : 'w-80'} max-h-96 flex flex-col`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-800">AI Assistant</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAiBlock(null)}>
                ×
              </Button>
            </div>

            <div className="flex-1 space-y-3">
              {aiTyping ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-purple-600">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">{aiTyping}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-600">
                    How would you like to modify this content?
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Scope:</Label>
                    <div className="flex gap-1">
                      {[
                        { value: 'block', label: 'This Block' },
                        { value: 'page', label: 'Whole Page' },
                        { value: 'assignment', label: 'Whole Assignment' }
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={aiScope === option.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAiScope(option.value as any)}
                          className="text-xs h-7"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">What to do:</Label>
                    <div className="flex gap-2">
                      <Input
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g., Translate to Spanish, add more questions..."
                        className="flex-1 h-8 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAiRequest()}
                      />
                      <Button
                        onClick={handleAiRequest}
                        size="sm"
                        className="h-8 px-2"
                        disabled={!aiPrompt.trim()}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    💡 Try: "Make this easier", "Add examples", "Create quiz questions"
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}