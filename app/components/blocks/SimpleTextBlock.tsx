'use client';

import React from 'react';

type SimpleTextBlockProps = {
  block: {
    id: string;
    type: string;
    position: number;
    data: {
      content?: string;
      style?: string;
    };
  };
  answer?: any;
  onAnswer?: (blockId: string, answerData: any) => void;
  isTeacher?: boolean;
  readOnly?: boolean;
};

export const SimpleTextBlock: React.FC<SimpleTextBlockProps> = ({
  block,
  isTeacher = false,
  readOnly = false
}) => {
  return (
    <div className="w-full p-4 border rounded-lg bg-muted/20">
      <div
        className={`prose prose-sm max-w-none ${
          block.data.style === 'heading' ? 'text-xl font-bold' :
          block.data.style === 'subheading' ? 'text-lg font-semibold' :
          block.data.style === 'quote' ? 'border-l-4 border-primary pl-4 italic' :
          block.data.style === 'note' ? 'bg-yellow-50 p-3 rounded border-l-4 border-yellow-400' :
          block.data.style === 'warning' ? 'bg-red-50 p-3 rounded border-l-4 border-red-400' :
          ''
        }`}
        dangerouslySetInnerHTML={{ __html: block.data.content || 'No content' }}
      />
    </div>
  );
};