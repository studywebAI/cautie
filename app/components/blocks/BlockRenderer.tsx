'use client';

import React from 'react';
import { BaseBlock, BlockProps } from './types';

interface BlockRendererProps extends Omit<BlockProps, 'block'> {
  block: BaseBlock;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  onUpdate,
  onDelete,
  isEditing = false,
  className,
}) => {
  const renderBlock = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      case 'image':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <div className="text-sm text-muted-foreground">Image Block</div>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      case 'video':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <div className="text-sm text-muted-foreground">Video Block</div>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      case 'multiple_choice':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <div className="text-sm text-muted-foreground">Multiple Choice Block</div>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      case 'open_question':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <div className="text-sm text-muted-foreground">Open Question Block</div>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      case 'fill_in_blank':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <div className="text-sm text-muted-foreground">Fill in Blank Block</div>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      case 'drag_drop':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <div className="text-sm text-muted-foreground">Drag & Drop Block</div>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      case 'ordering':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <div className="text-sm text-muted-foreground">Ordering Block</div>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      case 'media_embed':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <div className="text-sm text-muted-foreground">Media Embed Block</div>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      case 'divider':
        return (
          <div className={`p-4 border ${className || ''}`}>
            <div className="text-sm text-muted-foreground">Divider Block</div>
            <pre className="whitespace-pre-wrap font-mono text-xs mt-2">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
      default:
        return (
          <div className="p-4 border rounded-lg bg-muted/50 text-muted-foreground">
            Unknown block type: {block.type}
          </div>
        );
    }
  };

  return renderBlock();
};