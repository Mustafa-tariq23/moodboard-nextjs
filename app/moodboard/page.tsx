'use client';
import React from 'react';
import ImageSearch from './ImageSearch';
import Canvas from './Canvas';
import { useLocalStorage } from './useLocalStorage';
import Image from 'next/image';

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
    <div className="min-h-screen w-full relative">
      {/* Background image with fixed positioning to cover entire viewport */}
      <Image 
        src="/bg.png" 
        alt="Background" 
        fill
        priority
        className="object-cover fixed top-0 left-0 z-0" 
        draggable="false"
      />
      
      <div className="relative z-10 min-h-screen w-full">
        <header className="mb-8 pt-8">
          <h1 className="text-3xl text-gray-800 font-bold text-center">MoodBoard Generator</h1>
          <p className="text-center text-black mt-2">
            Search for images, drag them onto the canvas, and create your perfect mood board
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="lg:col-span-1 rounded-lg p-4 max-h-full overflow-auto">
            <ImageSearch onImageDragStart={handleImageDragStart} />
          </div>
          <div className="lg:col-span-2 rounded-lg p-4 max-h-full">
            <Canvas images={images} onImagesChange={setImages} />
          </div>
        </main>
      </div>
    </div>
  );
}