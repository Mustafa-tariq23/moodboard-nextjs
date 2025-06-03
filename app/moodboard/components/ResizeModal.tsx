import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MIN_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION } from '../utils/imageUtils';

interface ResizeModalProps {
  show: boolean;
  width: string;
  height: string;
  onWidthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function ResizeModal({
  show,
  width,
  height,
  onWidthChange,
  onHeightChange,
  onApply,
  onCancel,
}: ResizeModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Resize Image</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="resizeWidth" className="block text-sm font-medium text-gray-700">
              Width (px)
            </label>
            <Input
              type="number"
              id="resizeWidth"
              value={width}
              onChange={onWidthChange}
              className="mt-1 block w-full"
              placeholder="e.g., 800"
              min={MIN_IMAGE_DIMENSION}
              max={MAX_IMAGE_DIMENSION}
            />
          </div>
          <div>
            <label htmlFor="resizeHeight" className="block text-sm font-medium text-gray-700">
              Height (px)
            </label>
            <Input
              type="number"
              id="resizeHeight"
              value={height}
              onChange={onHeightChange}
              className="mt-1 block w-full"
              placeholder="e.g., 600"
              min={MIN_IMAGE_DIMENSION}
              max={MAX_IMAGE_DIMENSION}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button onClick={onApply} className="w-full sm:w-auto">
              Apply Resize
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 