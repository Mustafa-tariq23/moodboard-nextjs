import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  BrushCleaning,
  Eraser,
  Pen,
  Redo2,
  Undo2,
} from 'lucide-react';

interface DrawingToolbarProps {
  eraseMode: boolean;
  strokeWidth: number;
  eraserWidth: number;
  strokeColor: string;
  canvasColor: string;
  onEraserClick: () => void;
  onPenClick: () => void;
  onStrokeWidthChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEraserWidthChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearClick: () => void;
  onStrokeColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCanvasColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUndoClick: () => void;
  onRedoClick: () => void;
}

export function DrawingToolbar({
  eraseMode,
  strokeWidth,
  eraserWidth,
  strokeColor,
  canvasColor,
  onEraserClick,
  onPenClick,
  onStrokeWidthChange,
  onEraserWidthChange,
  onClearClick,
  onStrokeColorChange,
  onCanvasColorChange,
  onUndoClick,
  onRedoClick,
}: DrawingToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:gap-4 mb-2 sm:mb-4">
      <div className='flex flex-wrap gap-1 sm:gap-2 items-center justify-between sm:justify-start w-full'>
        <Button
          type="button"
          variant={eraseMode ? "outline" : "default"}
          onClick={onPenClick}
          size="sm"
          aria-label="Pen tool"
        >
          <Pen />
        </Button>
        <Button
          type="button"
          variant={!eraseMode ? "outline" : "default"}
          onClick={onEraserClick}
          size="sm"
          aria-label="Eraser tool"
        >
          <Eraser />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onUndoClick}
          size="sm"
          aria-label="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onRedoClick}
          size="sm"
          aria-label="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="destructive"
          onClick={onClearClick}
          size="sm"
          aria-label="Clear canvas"
        >
          <BrushCleaning />
        </Button>
      </div>

      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4'>
        <div className='flex flex-wrap items-center gap-2 sm:gap-4'>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <span className="text-xs sm:text-sm">Stroke: {strokeWidth}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <input
                disabled={eraseMode}
                type="range"
                className="form-range w-full"
                min="1"
                max="20"
                step="1"
                value={strokeWidth}
                onChange={onStrokeWidthChange}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <span className="text-xs sm:text-sm">Eraser: {eraserWidth}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <input
                disabled={!eraseMode}
                type="range"
                className="form-range w-full"
                min="1"
                max="20"
                step="1"
                value={eraserWidth}
                onChange={onEraserWidthChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className='flex items-center gap-2 sm:gap-4'>
          <div className='flex flex-col gap-1 items-center'>
            <label htmlFor="strokeColor" className="text-xs">Stroke</label>
            <input
              type="color"
              id="strokeColor"
              value={strokeColor}
              onChange={onStrokeColorChange}
              className='cursor-pointer rounded-md w-8 h-8'
              aria-label="Stroke color"
            />
          </div>
          <div className='flex flex-col gap-1 items-center'>
            <label htmlFor="canvasColor" className="text-xs">Canvas</label>
            <input
              type="color"
              id="canvasColor"
              value={canvasColor}
              onChange={onCanvasColorChange}
              className='cursor-pointer rounded-md border-gray-300 border w-8 h-8'
              aria-label="Canvas color"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 