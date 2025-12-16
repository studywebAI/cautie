'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BlockProps, MediaBlockContent } from './types';
import { cn } from '@/lib/utils';

interface MediaBlockProps extends BlockProps {
  block: BlockProps['block'] & { content: MediaBlockContent };
}

export const MediaBlock: React.FC<MediaBlockProps> = ({
  block,
  onUpdate,
  isEditing = false,
  className,
}) => {
  const [isEditingState, setIsEditingState] = useState(isEditing);
  const [url, setUrl] = useState(block.content.url || '');
  const [alt, setAlt] = useState(block.content.alt || '');
  const [caption, setCaption] = useState(block.content.caption || '');

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...block.content,
        url,
        alt,
        caption,
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
      setUrl(block.content.url || '');
      setAlt(block.content.alt || '');
      setCaption(block.content.caption || '');
      setIsEditingState(false);
    }
  };

  const renderImage = () => {
    if (!url) {
      return (
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
          No image URL provided
        </div>
      );
    }

    return (
      <div className="w-full">
        <img
          src={url}
          alt={alt || 'Image'}
          className="w-full h-auto rounded-lg max-w-full"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">Failed to load image</div>';
            }
          }}
        />
        {caption && (
          <p className="text-sm text-muted-foreground mt-2 text-center">{caption}</p>
        )}
      </div>
    );
  };

  const renderEmbed = () => {
    if (!url) {
      return (
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
          No embed URL provided
        </div>
      );
    }

    // Simple embed handling - in a real app, you'd want more sophisticated embed parsing
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      if (videoId) {
        return (
          <div className="w-full">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allowFullScreen
                title="Embedded video"
              />
            </div>
            {caption && (
              <p className="text-sm text-muted-foreground mt-2 text-center">{caption}</p>
            )}
          </div>
        );
      }
    }

    // Generic iframe for other embeds
    return (
      <div className="w-full">
        <iframe
          src={url}
          className="w-full h-64 rounded-lg border"
          title="Embedded content"
        />
        {caption && (
          <p className="text-sm text-muted-foreground mt-2 text-center">{caption}</p>
        )}
      </div>
    );
  };

  const renderDisplay = () => {
    const { type } = block.content;

    if (type === 'image') {
      return renderImage();
    }

    return renderEmbed();
  };

  const renderEditor = () => {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <div>
          <label className="text-sm font-medium">URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter media URL..."
            className="mt-1"
            autoFocus
          />
        </div>
        {block.content.type === 'image' && (
          <div>
            <label className="text-sm font-medium">Alt Text</label>
            <Input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the image..."
              className="mt-1"
            />
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Caption</label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a caption..."
            className="mt-1 min-h-[60px] resize-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditingState(false)}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn('w-full mb-4', className)}
      onClick={() => !isEditingState && setIsEditingState(true)}
    >
      {isEditingState ? renderEditor() : renderDisplay()}
    </div>
  );
};