import { Button } from '@/components/ui/button';
import Cropper, { Area } from 'react-easy-crop';

interface CropModalProps {
  show: boolean;
  image: string;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (_: Area, croppedAreaPixels: Area) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function CropModal({
  show,
  image,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onApply,
  onCancel,
}: CropModalProps) {
  if (!show || !image) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
        <div className="flex flex-col items-center gap-4">
          <div className='relative w-full h-[40vh] sm:h-[50vh] bg-gray-200'>
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={onCropChange}
              onCropComplete={onCropComplete}
              onZoomChange={onZoomChange}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={onApply} className="flex-1 sm:flex-none">
              Apply Crop
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1 sm:flex-none">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 