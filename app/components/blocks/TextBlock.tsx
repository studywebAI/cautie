'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { BlockProps, TextBlockContent, TextBlockType } from './types';
import { cn } from '@/lib/utils';

interface TextBlockProps extends BlockProps {
  block: BlockProps['block'] & { content: TextBlockContent };
}

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  onUpdate,
  isEditing = false,
  className,
}) => {
  const [isEditingState, setIsEditingState] = useState(isEditing);
  const [text, setText] = useState(block.content.text || '');

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...block.content,
        text,
      });
    }
    setIsEditingState(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setText(block.content.text || '');
      setIsEditingState(false);
    }
  };

  const renderDisplay = () => {
    const { type, text: displayText } = block.content;

    switch (type) {
      case 'heading1':
        return (
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            {displayText || 'Heading 1'}
          </h1>
        );
      case 'heading2':
        return (
          <h2 className="text-2xl font-semibold mb-3 text-foreground">
            {displayText || 'Heading 2'}
          </h2>
        );
      case 'heading3':
        return (
          <h3 className="text-xl font-medium mb-2 text-foreground">
            {displayText || 'Heading 3'}
          </h3>
        );
      case 'paragraph':
      default:
        return (
          <p className="text-base leading-relaxed text-foreground mb-4">
            {displayText || 'Start writing...'}
          </p>
        );
    }
  };

  const renderEditor = () => {
    return (
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        placeholder={`Enter ${block.content.type} text...`}
        className={cn(
          'min-h-[60px] resize-none border-none shadow-none focus-visible:ring-0 p-0',
          block.content.type === 'heading1' && 'text-3xl font-bold',
          block.content.type === 'heading2' && 'text-2xl font-semibold',
          block.content.type === 'heading3' && 'text-xl font-medium',
          block.content.type === 'paragraph' && 'text-base',
          className
        )}
        autoFocus
      />
    );
  };

  return (
    <div
      className={cn('w-full', className)}
      onClick={() => !isEditingState && setIsEditingState(true)}
    >
      {isEditingState ? renderEditor() : renderDisplay()}
    </div>
  );
};