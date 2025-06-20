import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

type Position = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CanvasImageProps = {
  src: string;
  id: string;
  initialPosition: Position;
  onRemove: () => void;
  isSelected: boolean;
  onClick: () => void;
};

export default function CanvasImage({
  id,
  src,
  initialPosition,
  onRemove,
  isSelected,
  onClick,
}: CanvasImageProps) {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: id
  });

  const style = {
  left: `${initialPosition.x}px`,
  top: `${initialPosition.y}px`,
  width: `${initialPosition.width}px`,
  height: `${initialPosition.height}px`,
  transform: CSS.Translate.toString(transform),
  zIndex: isDragging ? 100 : 'auto',
};

  return (
    <div
      ref={setNodeRef}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Image 
        src={src} 
        alt="Canvas image" 
        fill
        className="object-cover" 
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
      />
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
