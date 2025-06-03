import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Crop,
  ImageUpscale,
  RotateCcwSquare,
  RotateCwSquare,
  X,
} from 'lucide-react';
import { PreserveAspectRatioOption } from '../types';

interface ImageControlsProps {
  backgroundImage: string;
  preserveAspectRatio: PreserveAspectRatioOption;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSketchImageDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onPreserveAspectRatioChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCropClick: () => void;
  onResizeClick: () => void;
  onRotateLeftClick: () => void;
  onRotateRightClick: () => void;
  onRemoveBackgroundImage: () => void;
  showCropModal: boolean;
}

const PRESERVE_ASPECT_RATIO_OPTIONS: PreserveAspectRatioOption[] = [
  "AspectRatio",
  "none",
  "xMinYMin",
  "xMidYMin",
  "xMaxYMin",
  "xMinYMid",
  "xMidYMid",
  "xMaxYMid",
  "xMinYMax",
  "xMidYMax",
  "xMaxYMax",
];

export function ImageControls({
  backgroundImage,
  preserveAspectRatio,
  onFileInputChange,
  onSketchImageDrop,
  onPreserveAspectRatioChange,
  onCropClick,
  onResizeClick,
  onRotateLeftClick,
  onRotateRightClick,
  onRemoveBackgroundImage,
  showCropModal,
}: ImageControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center sm:items-center gap-2 sm:gap-4">
      {!backgroundImage && (
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
          <Input
            type='file'
            className='h-8 text-xs'
            accept="image/*"
            onChange={onFileInputChange}
            aria-label="Upload background image"
          />
          <span className="text-xs text-gray-500">OR</span>
        </div>
      )}

      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-1 border px-2 py-1 rounded-md h-8 min-w-0'>
          <div
            className="text-gray-500 text-xs rounded-md flex-1 h-full flex items-center justify-center cursor-move overflow-hidden"
            onDrop={onSketchImageDrop}
            onDragOver={(e) => e.preventDefault()}
            aria-label="Drop image area"
          >
            <span className="truncate">
              {backgroundImage ? 'Image uploaded' : 'Drop image here...'}
            </span>
          </div>
          {backgroundImage && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onRemoveBackgroundImage}
              aria-label="Remove background image"
            >
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>
      </div>

      {backgroundImage && (
        <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
          <select
            id="preserveAspectRatio"
            className="border border-gray-300 text-gray-500 text-xs p-1 h-8 rounded-md cursor-pointer"
            value={preserveAspectRatio}
            onChange={onPreserveAspectRatioChange}
            aria-label="Preserve aspect ratio"
          >
            {PRESERVE_ASPECT_RATIO_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Button
            variant={showCropModal ? "default" : "outline"}
            size="sm"
            onClick={onCropClick}
            aria-label="Crop image"
          >
            <Crop className='h-3 w-3' />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResizeClick}
            aria-label="Resize image"
          >
            <ImageUpscale className='h-3 w-3' />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateLeftClick}
            aria-label="Rotate left"
          >
            <RotateCcwSquare className='h-3 w-3' />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateRightClick}
            aria-label="Rotate right"
          >
            <RotateCwSquare className='h-3 w-3' />
          </Button>
        </div>
      )}
    </div>
  );
} 