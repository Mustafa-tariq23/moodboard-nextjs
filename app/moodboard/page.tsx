'use client';

import { useState, useEffect } from 'react';
import ImageSearch from './ImageSearch';
import Canvas from './Canvas';
import { useLocalStorage } from './useLocalStorage';

type MoodboardImage = {
  id: string;
  src: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export default function MoodboardPage() {
  const [images, setImages] = useLocalStorage<MoodboardImage[]>('moodboard-images', []);

  const handleImageDragStart = (e: React.DragEvent, src: string) => {
    e.dataTransfer.setData('text/plain', src);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-8">
        <h1 className="text-3xl text-gray-800 font-bold text-center">MoodBoard Generator</h1>
        <p className="text-center text-black mt-2">
          Search for images, drag them onto the canvas, and create your perfect mood board
        </p>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="lg:col-span-1">
          <ImageSearch onImageDragStart={handleImageDragStart} />
        </div>
        <div className="lg:col-span-2">
          <Canvas images={images} onImagesChange={setImages} />
        </div>
      </main>
    </div>
  );
}