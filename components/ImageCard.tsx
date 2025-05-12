import Image from 'next/image';
import { useState } from 'react';

type ImageCardProps = {
  src: string;
  alt: string;
  onDragStart: (e: React.DragEvent, src: string) => void;
};

export default function ImageCard({ src, alt, onDragStart }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div 
      className="relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-50 cursor-move"
      draggable
      onDragStart={(e) => onDragStart(e, src)}
    >
      <Image
        src={src}
        alt={alt || 'Mood board image'}
        fill
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
        </div>
      )}
    </div>
  );
}