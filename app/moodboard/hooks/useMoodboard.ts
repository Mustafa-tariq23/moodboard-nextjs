import { useState, useCallback, useRef } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { CanvasImage } from '../types';
import { toBase64 } from '../utils/imageUtils';

export function useMoodboard(images: CanvasImage[], onImagesChange: (images: CanvasImage[]) => void) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isInternalDrag = useRef(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    width: 'auto',
    height: '400px'
  });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    const activeId = active.id as string;

    onImagesChange(
      images.map((img) => {
        if (img.id === activeId) {
          return {
            ...img,
            position: {
              ...img.position,
              x: img.position.x + delta.x,
              y: img.position.y + delta.y,
            },
          };
        }
        return img;
      })
    );
  }, [images, onImagesChange]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();

    if (isInternalDrag.current) {
      isInternalDrag.current = false;
      return;
    }

    const src = e.dataTransfer.getData('text/plain');
    if (src && canvasRef.current) {
      try {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const newImage = {
          id: `img-${Date.now()}`,
          src: await toBase64(src),
          position: {
            x: e.clientX - canvasRect.left - 100,
            y: e.clientY - canvasRect.top - 100,
            width: 200,
            height: 200,
          },
        };
        onImagesChange([...images, newImage]);
        setSelectedImageId(newImage.id);
      } catch (error) {
        console.error("Error loading dropped image:", error);
      }
    }
  }, [images, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  }, [images, onImagesChange, selectedImageId]);

  const toggleCanvasExpansion = useCallback(() => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setCanvasSize({
        width: '100vw',
        height: '100vh'
      });
    } else {
      setCanvasSize({
        width: 'auto',
        height: '400px'
      });
    }
  }, [isExpanded]);

  return {
    canvasRef,
    isInternalDrag,
    selectedImageId,
    setSelectedImageId,
    isExpanded,
    canvasSize,
    handleDragEnd,
    handleDrop,
    handleDragOver,
    handleRemoveImage,
    toggleCanvasExpansion,
  };
} 