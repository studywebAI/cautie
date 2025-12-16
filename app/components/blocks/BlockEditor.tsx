'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BaseBlock, BlockType, BlockContent } from './types';
import { BlockRenderer } from './BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Type, List, Image, Code, Quote, Layout, Zap } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface BlockEditorProps {
  materialId: string;
  className?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ materialId, className }) => {
  const [blocks, setBlocks] = useState<BaseBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch blocks on mount
  useEffect(() => {
    fetchBlocks();
  }, [materialId]);

  const fetchBlocks = async () => {
    try {
      const response = await fetch(`/api/materials/${materialId}/blocks`);
      if (response.ok) {
        const data = await response.json();
        setBlocks(data.blocks || []);
      }
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBlock = async (type: BlockType, content: BlockContent, orderIndex: number) => {
    try {
      const response = await fetch(`/api/materials/${materialId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, order_index: orderIndex }),
      });
      if (response.ok) {
        const data = await response.json();
        setBlocks(prev => [...prev, data.block]);
        return data.block;
      }
    } catch (error) {
      console.error('Failed to create block:', error);
    }
    return null;
  };

  const updateBlock = async (blockId: string, updates: Partial<BaseBlock>) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const data = await response.json();
        setBlocks(prev => prev.map(block => block.id === blockId ? data.block : block));
        return data.block;
      }
    } catch (error) {
      console.error('Failed to update block:', error);
    }
    return null;
  };

  const deleteBlock = async (blockId: string) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setBlocks(prev => prev.filter(block => block.id !== blockId));
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  const reorderBlocks = async (blockIds: string[]) => {
    try {
      const response = await fetch('/api/blocks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds }),
      });
      if (response.ok) {
        // Blocks are already reordered in state
      }
    } catch (error) {
      console.error('Failed to reorder blocks:', error);
      // Revert on error
      fetchBlocks();
    }
  };

  const handleAddBlock = (type: BlockType, afterIndex?: number) => {
    const orderIndex = afterIndex !== undefined ? afterIndex + 1 : blocks.length;
    const defaultContent = getDefaultContent(type);
    createBlock(type, defaultContent, orderIndex);
  };

  const getDefaultContent = (type: BlockType): BlockContent => {
    switch (type) {
      case 'text':
        return { type: 'paragraph', text: '' };
      case 'list':
        return { type: 'bulleted', items: [{ id: '1', text: '' }] };
      case 'media':
        return { type: 'image', url: '', alt: '' };
      case 'code':
        return { language: 'javascript', code: '' };
      case 'quote':
        return { text: '', author: '' };
      case 'layout':
        return { type: 'divider' };
      case 'complex':
        return { type: 'mindmap', data: {}, viewerType: 'mindmap-professional' };
      default:
        return { type: 'paragraph', text: '' };
    }
  };

  const handleBlockUpdate = (blockId: string, content: BlockContent) => {
    updateBlock(blockId, { content });
  };

  const handleBlockDelete = (blockId: string) => {
    deleteBlock(blockId);
  };

  const handleBlockTypeChange = (blockId: string, newType: BlockType) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      const newContent = getDefaultContent(newType);
      updateBlock(blockId, { type: newType, content: newContent });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedBlockId) return;

    const draggedIndex = blocks.findIndex(block => block.id === draggedBlockId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);

    setBlocks(newBlocks);
    setDraggedBlockId(null);
    setDragOverIndex(null);

    const blockIds = newBlocks.map(block => block.id);
    reorderBlocks(blockIds);
  };

  const handleDragEnd = () => {
    setDraggedBlockId(null);
    setDragOverIndex(null);
  };

  if (loading) {
    return <div className="p-4">Loading blocks...</div>;
  }

  return (
    <div className={`block-editor ${className}`}>
      {blocks.map((block, index) => (
        <div
          key={block.id}
          draggable
          onDragStart={(e) => handleDragStart(e, block.id)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`relative group ${dragOverIndex === index ? 'border-t-2 border-blue-500' : ''}`}
        >
          <BlockRenderer
            block={block}
            onUpdate={(content) => handleBlockUpdate(block.id, content)}
            onDelete={() => handleBlockDelete(block.id)}
            isEditing={editingBlockId === block.id}
          />
          {/* Block toolbar */}
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBlockTypeChange(block.id, 'text')}>
                  <Type className="h-4 w-4 mr-2" /> Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBlockTypeChange(block.id, 'list')}>
                  <List className="h-4 w-4 mr-2" /> List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBlockTypeChange(block.id, 'media')}>
                  <Image className="h-4 w-4 mr-2" /> Media
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBlockTypeChange(block.id, 'code')}>
                  <Code className="h-4 w-4 mr-2" /> Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBlockTypeChange(block.id, 'quote')}>
                  <Quote className="h-4 w-4 mr-2" /> Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBlockTypeChange(block.id, 'layout')}>
                  <Layout className="h-4 w-4 mr-2" /> Layout
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBlockTypeChange(block.id, 'complex')}>
                  <Zap className="h-4 w-4 mr-2" /> Complex
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      {/* Add block button */}
      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleAddBlock('text')}>
              <Type className="h-4 w-4 mr-2" /> Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('list')}>
              <List className="h-4 w-4 mr-2" /> List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('media')}>
              <Image className="h-4 w-4 mr-2" /> Media
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('code')}>
              <Code className="h-4 w-4 mr-2" /> Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('quote')}>
              <Quote className="h-4 w-4 mr-2" /> Quote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('layout')}>
              <Layout className="h-4 w-4 mr-2" /> Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('complex')}>
              <Zap className="h-4 w-4 mr-2" /> Complex
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};