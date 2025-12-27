import React from 'react';
import { BaseBlock, BlockData, TextBlockData, ImageBlockData, VideoBlockData, MultipleChoiceBlockData, OpenQuestionBlockData, FillInBlankBlockData, DragDropBlockData, OrderingBlockData, MediaEmbedBlockData, DividerBlockData, isTextBlockData, isImageBlockData, isVideoBlockData, isMultipleChoiceBlockData, isOpenQuestionBlockData, isFillInBlankBlockData, isDragDropBlockData, isOrderingBlockData, isMediaEmbedBlockData, isDividerBlockData } from '@/lib/types/blocks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface ContentBlockRendererProps {
  block: BaseBlock;
  isEditing?: boolean;
  onUpdate?: (data: BlockData) => void;
  studentAnswer?: any; // From student_answers table
  onSubmitAnswer?: (answerData: any) => void;
  isTeacher?: boolean;
}

export function ContentBlockRenderer({
  block,
  isEditing = false,
  onUpdate,
  studentAnswer,
  onSubmitAnswer,
  isTeacher = false
}: ContentBlockRendererProps) {
  const renderBlock = () => {
    switch (block.type) {
      case 'text':
        return <TextBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      case 'image':
        return <ImageBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      case 'video':
        return <VideoBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      case 'multiple_choice':
        return <MultipleChoiceBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} studentAnswer={studentAnswer} onSubmitAnswer={onSubmitAnswer} isTeacher={isTeacher} />;
      case 'open_question':
        return <OpenQuestionBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} studentAnswer={studentAnswer} onSubmitAnswer={onSubmitAnswer} isTeacher={isTeacher} />;
      case 'fill_in_blank':
        return <FillInBlankBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} studentAnswer={studentAnswer} onSubmitAnswer={onSubmitAnswer} isTeacher={isTeacher} />;
      case 'drag_drop':
        return <DragDropBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} studentAnswer={studentAnswer} onSubmitAnswer={onSubmitAnswer} isTeacher={isTeacher} />;
      case 'ordering':
        return <OrderingBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} studentAnswer={studentAnswer} onSubmitAnswer={onSubmitAnswer} isTeacher={isTeacher} />;
      case 'media_embed':
        return <MediaEmbedBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      case 'divider':
        return <DividerBlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      default:
        return <div className="text-red-500">Unknown block type: {block.type}</div>;
    }
  };

  return (
    <div className="w-full mb-4">
      {renderBlock()}
    </div>
  );
}

// Text Block Component
function TextBlockRenderer({ block, isEditing, onUpdate }: Omit<ContentBlockRendererProps, 'studentAnswer' | 'onSubmitAnswer' | 'isTeacher'>) {
  if (!isTextBlockData(block.data)) return <div>Invalid text block data</div>;

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <Textarea
            value={block.data.content}
            onChange={(e) => onUpdate?.({ ...block.data, content: e.target.value } as TextBlockData)}
            placeholder="Enter text content..."
            className="min-h-[100px]"
          />
          <div className="mt-2">
            <Label>Style:</Label>
            <select
              value={block.data.style}
              onChange={(e) => onUpdate?.({ ...block.data, style: e.target.value as any })}
              className="ml-2 p-1 border rounded"
            >
              <option value="normal">Normal</option>
              <option value="heading">Heading</option>
              <option value="subheading">Subheading</option>
              <option value="quote">Quote</option>
              <option value="note">Note</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTextStyle = (style: string) => {
    switch (style) {
      case 'heading': return 'text-2xl font-bold mb-2';
      case 'subheading': return 'text-xl font-semibold mb-2';
      case 'quote': return 'border-l-4 border-gray-300 pl-4 italic';
      case 'note': return 'bg-blue-50 p-3 rounded border-l-4 border-blue-400';
      case 'warning': return 'bg-yellow-50 p-3 rounded border-l-4 border-yellow-400';
      default: return 'text-base';
    }
  };

  return (
    <div className={getTextStyle(block.data.style)}>
      {block.data.content}
    </div>
  );
}

// Image Block Component
function ImageBlockRenderer({ block, isEditing, onUpdate }: Omit<ContentBlockRendererProps, 'studentAnswer' | 'onSubmitAnswer' | 'isTeacher'>) {
  if (!isImageBlockData(block.data)) return <div>Invalid image block data</div>;

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <Input
            value={block.data.url}
            onChange={(e) => onUpdate?.({ ...block.data, url: e.target.value })}
            placeholder="Image URL..."
          />
          <Input
            value={block.data.caption || ''}
            onChange={(e) => onUpdate?.({ ...block.data, caption: e.target.value })}
            placeholder="Caption (optional)..."
            className="mt-2"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="my-4">
      <img
        src={block.data.url}
        alt={block.data.caption || 'Block image'}
        className="max-w-full h-auto rounded"
        style={{
          transform: `translate(${block.data.transform.x}px, ${block.data.transform.y}px) scale(${block.data.transform.scale}) rotate(${block.data.transform.rotation}deg)`
        }}
      />
      {block.data.caption && (
        <p className="text-sm text-gray-600 mt-2 text-center">{block.data.caption}</p>
      )}
    </div>
  );
}

// Video Block Component
function VideoBlockRenderer({ block, isEditing, onUpdate }: Omit<ContentBlockRendererProps, 'studentAnswer' | 'onSubmitAnswer' | 'isTeacher'>) {
  if (!isVideoBlockData(block.data)) return <div>Invalid video block data</div>;

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-2">
          <Input
            value={block.data.url}
            onChange={(e) => onUpdate?.({ ...block.data, url: e.target.value })}
            placeholder="Video URL..."
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={block.data.start_seconds}
              onChange={(e) => onUpdate?.({ ...block.data, start_seconds: parseInt(e.target.value) || 0 })}
              placeholder="Start seconds"
            />
            <Input
              type="number"
              value={block.data.end_seconds || ''}
              onChange={(e) => onUpdate?.({ ...block.data, end_seconds: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="End seconds (optional)"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // For now, just show a placeholder. In real implementation, embed the video
  return (
    <div className="my-4 p-8 bg-gray-100 rounded text-center">
      <p>Video: {block.data.url}</p>
      <p className="text-sm text-gray-600">
        Start: {block.data.start_seconds}s
        {block.data.end_seconds && ` - End: ${block.data.end_seconds}s`}
      </p>
    </div>
  );
}

// Multiple Choice Block Component
function MultipleChoiceBlockRenderer({ block, isEditing, onUpdate, studentAnswer, onSubmitAnswer, isTeacher }: ContentBlockRendererProps) {
  if (!isMultipleChoiceBlockData(block.data)) return <div>Invalid multiple choice block data</div>;

  const data = block.data as MultipleChoiceBlockData;
  const [selectedOption, setSelectedOption] = React.useState<string>(studentAnswer?.selected_options?.[0] || '');

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <Input
            value={data.question}
            onChange={(e) => onUpdate?.({ ...data, question: e.target.value } as MultipleChoiceBlockData)}
            placeholder="Question..."
          />
          <div className="space-y-2">
            <Label>Options:</Label>
            {data.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...data.options];
                    newOptions[index] = { ...option, text: e.target.value };
                    onUpdate?.({ ...data, options: newOptions } as MultipleChoiceBlockData);
                  }}
                  placeholder={`Option ${index + 1}...`}
                />
                <input
                  type="checkbox"
                  checked={option.correct}
                  onChange={(e) => {
                    const newOptions = [...data.options];
                    newOptions[index] = { ...option, correct: e.target.checked };
                    onUpdate?.({ ...data, options: newOptions } as MultipleChoiceBlockData);
                  }}
                />
                <Label>Correct</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Student view
  const hasAnswered = !!studentAnswer;
  const isCorrect = studentAnswer?.is_correct;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">{block.data.question}</h3>
        <RadioGroup
          value={selectedOption}
          onValueChange={setSelectedOption}
          disabled={hasAnswered && !isTeacher}
        >
          {block.data.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id}>{option.text}</Label>
              {hasAnswered && isTeacher && option.correct && (
                <span className="text-green-600 text-sm">✓ Correct</span>
              )}
            </div>
          ))}
        </RadioGroup>
        {!hasAnswered && (
          <Button
            onClick={() => onSubmitAnswer?.({ selected_options: [selectedOption] })}
            className="mt-4"
            disabled={!selectedOption}
          >
            Submit Answer
          </Button>
        )}
        {hasAnswered && (
          <div className="mt-4">
            <p className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Open Question Block Component
function OpenQuestionBlockRenderer({ block, isEditing, onUpdate, studentAnswer, onSubmitAnswer, isTeacher }: ContentBlockRendererProps) {
  if (!isOpenQuestionBlockData(block.data)) return <div>Invalid open question block data</div>;

  const [answer, setAnswer] = React.useState<string>(studentAnswer?.answer_data?.text || '');

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <Textarea
            value={block.data.question}
            onChange={(e) => onUpdate?.({ ...block.data, question: e.target.value })}
            placeholder="Question..."
          />
          <div className="space-y-2">
            <Label>AI Grading Settings:</Label>
            <input
              type="checkbox"
              checked={block.data.ai_grading}
              onChange={(e) => onUpdate?.({ ...block.data, ai_grading: e.target.checked })}
            />
            <Label>Enable AI grading</Label>
            {block.data.ai_grading && (
              <>
                <Textarea
                  value={block.data.grading_criteria}
                  onChange={(e) => onUpdate?.({ ...block.data, grading_criteria: e.target.value })}
                  placeholder="Grading criteria..."
                  className="mt-2"
                />
                <Input
                  type="number"
                  value={block.data.max_score}
                  onChange={(e) => onUpdate?.({ ...block.data, max_score: parseInt(e.target.value) || 5 })}
                  placeholder="Max score"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Student view
  const hasAnswered = !!studentAnswer;
  const isGraded = studentAnswer?.graded_by_ai;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">{block.data.question}</h3>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer..."
          disabled={hasAnswered && !isTeacher}
          className="min-h-[100px]"
        />
        {!hasAnswered && (
          <Button
            onClick={() => onSubmitAnswer?.({ text: answer })}
            className="mt-4"
            disabled={!answer.trim()}
          >
            Submit Answer
          </Button>
        )}
        {hasAnswered && (
          <div className="mt-4">
            {isGraded ? (
              <div>
                <p className="font-semibold">Score: {studentAnswer.score}/{block.data.max_score}</p>
                <p className="text-sm mt-2">{studentAnswer.feedback}</p>
              </div>
            ) : (
              <p className="text-blue-600">Answer submitted - awaiting grading</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Fill-in-the-Blank Block Component
function FillInBlankBlockRenderer({ block, isEditing, onUpdate, studentAnswer, onSubmitAnswer, isTeacher }: ContentBlockRendererProps) {
  if (!isFillInBlankBlockData(block.data)) return <div>Invalid fill-in-the-blank block data</div>;

  const data = block.data as FillInBlankBlockData;
  const [answers, setAnswers] = React.useState<string[]>(studentAnswer?.answer_data?.answers || ['']);

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <Textarea
            value={data.text}
            onChange={(e) => onUpdate?.({ ...data, text: e.target.value } as FillInBlankBlockData)}
            placeholder="Text with ___ for blanks..."
          />
          <div className="space-y-2">
            <Label>Correct Answers:</Label>
            {data.answers.map((answer, index) => (
              <Input
                key={index}
                value={answer}
                onChange={(e) => {
                  const newAnswers = [...data.answers];
                  newAnswers[index] = e.target.value;
                  onUpdate?.({ ...data, answers: newAnswers } as FillInBlankBlockData);
                }}
                placeholder={`Answer ${index + 1}...`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.case_sensitive}
              onChange={(e) => onUpdate?.({ ...data, case_sensitive: e.target.checked } as FillInBlankBlockData)}
            />
            <Label>Case sensitive</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Student view - parse text and create input fields
  const parts = block.data.text.split('___');
  const hasAnswered = !!studentAnswer;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < parts.length - 1 && (
                <Input
                  value={answers[index] || ''}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  disabled={hasAnswered && !isTeacher}
                  className="inline-block w-32 mx-2"
                  placeholder="..."
                />
              )}
            </span>
          ))}
        </div>
        {!hasAnswered && (
          <Button
            onClick={() => onSubmitAnswer?.({ answers })}
            className="mt-4"
          >
            Submit Answer
          </Button>
        )}
        {hasAnswered && (
          <div className="mt-4">
            <p className={`font-semibold ${studentAnswer.is_correct ? 'text-green-600' : 'text-red-600'}`}>
              {studentAnswer.is_correct ? 'Correct!' : 'Incorrect'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Placeholder components for remaining block types
function DragDropBlockRenderer({ block, isEditing }: ContentBlockRendererProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-gray-500">Drag & Drop Block - Coming Soon</p>
        {isEditing && <p className="text-sm">Prompt: {isDragDropBlockData(block.data) ? block.data.prompt : 'N/A'}</p>}
      </CardContent>
    </Card>
  );
}

function OrderingBlockRenderer({ block, isEditing }: ContentBlockRendererProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-gray-500">Ordering Block - Coming Soon</p>
        {isEditing && <p className="text-sm">Prompt: {isOrderingBlockData(block.data) ? block.data.prompt : 'N/A'}</p>}
      </CardContent>
    </Card>
  );
}

function MediaEmbedBlockRenderer({ block, isEditing }: ContentBlockRendererProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-gray-500">Media Embed Block - Coming Soon</p>
        {isEditing && <p className="text-sm">URL: {isMediaEmbedBlockData(block.data) ? block.data.embed_url : 'N/A'}</p>}
      </CardContent>
    </Card>
  );
}

function DividerBlockRenderer({ block, isEditing }: ContentBlockRendererProps) {
  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <Label>Divider Style:</Label>
          <select
            value={isDividerBlockData(block.data) ? block.data.style : 'line'}
            onChange={(e) => {
              // This would call onUpdate in real implementation
            }}
            className="ml-2 p-1 border rounded"
          >
            <option value="line">Line</option>
            <option value="space">Space</option>
            <option value="page_break">Page Break</option>
          </select>
        </CardContent>
      </Card>
    );
  }

  const style = isDividerBlockData(block.data) ? block.data.style : 'line';

  switch (style) {
    case 'space':
      return <div className="h-8"></div>;
    case 'page_break':
      return <div className="border-t-2 border-gray-400 my-8 page-break"></div>;
    default:
      return <hr className="my-4 border-gray-300" />;
  }
}