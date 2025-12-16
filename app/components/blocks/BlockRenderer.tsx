'use client';

import React from 'react';
import { BaseBlock, BlockProps } from './types';
import { TextBlock } from './TextBlock';
import { ListBlock } from './ListBlock';
import { MediaBlock } from './MediaBlock';
import { CodeBlock } from './CodeBlock';
import { QuoteBlock } from './QuoteBlock';
import { LayoutBlock } from './LayoutBlock';
import { ComplexBlock } from './ComplexBlock';

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
          <TextBlock
            block={block as BlockProps['block'] & { content: any }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isEditing={isEditing}
            className={className}
          />
        );
      case 'list':
        return (
          <ListBlock
            block={block as BlockProps['block'] & { content: any }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isEditing={isEditing}
            className={className}
          />
        );
      case 'media':
        return (
          <MediaBlock
            block={block as BlockProps['block'] & { content: any }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isEditing={isEditing}
            className={className}
          />
        );
      case 'code':
        return (
          <CodeBlock
            block={block as BlockProps['block'] & { content: any }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isEditing={isEditing}
            className={className}
          />
        );
      case 'quote':
        return (
          <QuoteBlock
            block={block as BlockProps['block'] & { content: any }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isEditing={isEditing}
            className={className}
          />
        );
      case 'layout':
        return (
          <LayoutBlock
            block={block as BlockProps['block'] & { content: any }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isEditing={isEditing}
            className={className}
          />
        );
      case 'complex':
        return (
          <ComplexBlock
            block={block as BlockProps['block'] & { content: any }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isEditing={isEditing}
            className={className}
          />
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