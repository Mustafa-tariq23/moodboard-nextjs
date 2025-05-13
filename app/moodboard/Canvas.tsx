import { useState, useRef } from 'react';
import CanvasImage from '../../components/CanvasImage';
import html2canvas from 'html2canvas-pro';
type CanvasProps = {
  images: Array<{
    id: string;
    src: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  onImagesChange: (images: any[]) => void;
};

export default function Canvas({ images, onImagesChange }: CanvasProps) {
  const isInternalDrag = useRef(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const toBase64 = (url: string) =>
    fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );


  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    if (isInternalDrag.current) {
      isInternalDrag.current = false;
      return;
    }

    const src = e.dataTransfer.getData('text/plain');
    if (src && canvasRef.current) {
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
    }
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  const handlePositionChange = (id: string, position: any) => {
    onImagesChange(
      images.map((img) => (img.id === id ? { ...img, position } : img))
    );
  };

  const handleExportJSON = () => {
    try {
      if (canvasRef.current) {
        if (!canvasRef.current) return alert('Canvas not found');
        const rect = canvasRef.current.getBoundingClientRect();
        setSelectedImageId(null);

        html2canvas(canvasRef.current,
          {
            backgroundColor: "#f3f4f6",
            useCORS: true,
            allowTaint: false,
            logging: false,
            foreignObjectRendering: true,
            width: rect.width,
            height: rect.height,
            scrollX: -rect.left,
            scrollY: -rect.top,
            imageTimeout: 15000,

          }).then((canvas) => {
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `moodboard-${Date.now()}.png`;
            link.click();
          });
      } else {
        alert('Canvas not found');
      }

    } catch (error) {
      alert('Failed to save the design. Please try again.');
    }
  };

  console.log(selectedImageId)

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-md p-4 text-gray-700 overflow-scroll" >
      <div className="flex justify-between items-center mb-4" 
        onClick={()=>setSelectedImageId("")}
      >
        <h2 className="text-xl font-bold">Canvas</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Design
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="flex-1 relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-md overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {images.map((image) => (
          <CanvasImage
            key={image.id}
            src={image.src}
            initialPosition={image.position}
            onRemove={() => handleRemoveImage(image.id)}
            onPositionChange={(position) => handlePositionChange(image.id, position)}
            isSelected={selectedImageId === image.id}
            onClick={() => setSelectedImageId(image.id)}
            dragFlagRef={isInternalDrag}
          />
        ))}
        {images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Drag and drop images here
          </div>
        )}
      </div>
    </div>
  );
}