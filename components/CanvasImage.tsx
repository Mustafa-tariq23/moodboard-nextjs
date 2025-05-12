import { useState, useRef } from 'react';

type Position = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CanvasImageProps = {
  src: string;
  initialPosition: Position;
  onRemove: () => void;
  onPositionChange: (position: Position) => void;
  isSelected: boolean;
  onClick: () => void;
};

export default function CanvasImage({
  src,
  initialPosition,
  onRemove,
  onPositionChange,
  isSelected,
  onClick,
}: CanvasImageProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      onClick();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageRef.current) {
      const canvasRect = imageRef.current.parentElement?.getBoundingClientRect();
      if (canvasRect) {
        const newX = e.clientX - canvasRect.left - dragOffset.x;
        const newY = e.clientY - canvasRect.top - dragOffset.y;

        // Ensure the image stays within canvas boundaries
        const updatedPosition = {
          x: Math.max(0, Math.min(newX, canvasRect.width - position.width)),
          y: Math.max(0, Math.min(newY, canvasRect.height - position.height)),
          width: position.width,
          height: position.height,
        };

        setPosition(updatedPosition);
        onPositionChange(updatedPosition);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  

  return (
    <div
      ref={imageRef}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={onClick}
    >
      <img src={src} crossOrigin="anonymous" alt="Canvas image" className="w-full h-full object-cover" />
      {isSelected && (
        <button
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}