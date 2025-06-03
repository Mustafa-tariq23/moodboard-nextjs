import {
  useState,
  useRef,
  type ChangeEvent,
  useEffect,
  useCallback
} from 'react';
import CanvasImage from '../../components/CanvasImage';
import Cropper, { Area } from 'react-easy-crop';
import html2canvas from 'html2canvas-pro';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import {
  BrushCleaning, Crop, Download, Eraser, ImageUpscale,
  Pen, Redo2, RotateCcwSquare, RotateCwSquare, Undo2, X,
  Maximize2, Minimize2
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// types import
import type { CanvasProps, CanvasImageType, PreserveAspectRatioOption } from '@/components/types/type';
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

const MAX_IMAGE_DIMENSION = 5000;
const MIN_IMAGE_DIMENSION = 10;

async function toBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = reject;
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = imageSrc;
  });
}

export default function Canvas({ images, onImagesChange }: CanvasProps) {
  // Refs
  const canvasSketchRef = useRef<ReactSketchCanvasRef>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isInternalDrag = useRef(false);

  // State
  const [activeTab, setActiveTab] = useState("images");
  const [canvasReady, setCanvasReady] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Drawing state
  const [eraseMode, setEraseMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(10);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [canvasColor, setCanvasColor] = useState("#ffffff");
  const [preserveAspectRatio, setPreserveAspectRatio] =
    useState<PreserveAspectRatioOption>("AspectRatio");

  // Image state
  const [backgroundImage, setBackgroundImage] = useState("");
  const [originalImage, setOriginalImage] = useState("");

  // Crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Resize state
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [currentImageForResize, setCurrentImageForResize] = useState<string | null>(null);

  // Canvas size state
  const [canvasSize, setCanvasSize] = useState({
    width: 'auto',
    height: '400px'
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Initialize canvas
  useEffect(() => {
    if (canvasSketchRef.current) {
      setCanvasReady(true);
    }
  }, [canvasSketchRef.current]);

  // Remove mask attribute on load
  useEffect(() => {
    const handleLoad = () => {
      const canvasWithMask = document.querySelector("#react-sketch-canvas__stroke-group-0");
      canvasWithMask?.removeAttribute("mask");
    };

    handleLoad();
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Drawing functions
  const handleEraserClick = useCallback(() => {
    setEraseMode(true);
    canvasSketchRef.current?.eraseMode(true);
  }, []);

  const handlePenClick = useCallback(() => {
    setEraseMode(false);
    canvasSketchRef.current?.eraseMode(false);
  }, []);

  const handleStrokeWidthChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setStrokeWidth(Math.min(50, Math.max(1, +event.target.value)));
  }, []);

  const handleEraserWidthChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEraserWidth(Math.min(50, Math.max(1, +event.target.value)));
  }, []);

  const handleClearClick = useCallback(() => {
    canvasSketchRef.current?.clearCanvas();
  }, []);

  const handleStrokeColorChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setStrokeColor(event.target.value);
  }, []);

  const handleCanvasColorChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setCanvasColor(event.target.value);
  }, []);

  const handleUndoClick = useCallback(() => {
    canvasSketchRef.current?.undo();
  }, []);

  const handleRedoClick = useCallback(() => {
    canvasSketchRef.current?.redo();
  }, []);

  const handlePreserveAspectRatioChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setPreserveAspectRatio(event.target.value as PreserveAspectRatioOption);
    }, []);

  // Image functions
  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBackgroundImage(result);
        setOriginalImage(result);
      };
      reader.onerror = () => toast.error("Failed to read file");
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSketchImageDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Handle file drops
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBackgroundImage(result);
        setOriginalImage(result);
      };
      reader.onerror = () => toast.error("Failed to read file");
      reader.readAsDataURL(file);
      return;
    }

    // Handle URL drops from sidebar
    const imageUrl = e.dataTransfer.getData('text/plain');
    if (imageUrl) {
      try {
        const dataUrl = await toBase64(imageUrl);
        setBackgroundImage(dataUrl);
        setOriginalImage(dataUrl);
      } catch (error) {
        toast.error("Error loading image");
        console.error("Error loading image:", error);
      }
    }
  }, []);

  // Crop functions
  const handleCropClick = useCallback(() => {
    if (!originalImage) {
      toast.warning("No image to crop");
      return;
    }
    setShowCropModal(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [originalImage]);

  const applyCrop = useCallback(async () => {
    if (!croppedAreaPixels || !originalImage) return;

    try {
      const croppedImage = await getCroppedImg(originalImage, croppedAreaPixels);
      setShowCropModal(false);
      setBackgroundImage(croppedImage);
      setOriginalImage(croppedImage);
    } catch (e) {
      toast.error("Failed to crop image");
      console.error(e);
    }
  }, [croppedAreaPixels, originalImage]);

  const cancelCrop = useCallback(() => {
    setShowCropModal(false);
    setCroppedAreaPixels(null);
  }, []);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Resize functions
  const handleResizeClick = useCallback(() => {
    if (!backgroundImage) {
      toast.warning("No image to resize");
      return;
    }

    const img = new Image();
    img.onload = () => {
      setResizeWidth(img.width.toString());
      setResizeHeight(img.height.toString());
      setCurrentImageForResize(backgroundImage);
      setShowResizeModal(true);
    };
    img.onerror = () => toast.error("Failed to load image");
    img.src = backgroundImage;
  }, [backgroundImage]);

  const validateDimensions = useCallback((width: number, height: number): boolean => {
    if (isNaN(width) || isNaN(height)) {
      toast.error("Please enter valid numbers for width and height");
      return false;
    }
    if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
      toast.error(`Dimensions must be at least ${MIN_IMAGE_DIMENSION}px`);
      return false;
    }
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      toast.error(`Dimensions cannot exceed ${MAX_IMAGE_DIMENSION}px`);
      return false;
    }
    return true;
  }, []);

  const applyResize = useCallback(() => {
    if (!currentImageForResize || !resizeWidth || !resizeHeight) return;

    const newWidth = parseInt(resizeWidth, 10);
    const newHeight = parseInt(resizeHeight, 10);

    if (!validateDimensions(newWidth, newHeight)) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error("Failed to create canvas context");
        return;
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      const resizedImageUrl = canvas.toDataURL('image/png', 1.0);

      setBackgroundImage(resizedImageUrl);
      setOriginalImage(resizedImageUrl);
      cancelResize();
    };
    img.onerror = () => toast.error("Failed to load image");
    img.src = currentImageForResize;
  }, [currentImageForResize, resizeWidth, resizeHeight, validateDimensions]);

  const cancelResize = useCallback(() => {
    setShowResizeModal(false);
    setResizeWidth('');
    setResizeHeight('');
    setCurrentImageForResize(null);
  }, []);

  // Rotation functions
  const rotateImage = useCallback((degrees: number) => {
    if (!backgroundImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');

      // Swap dimensions for 90° rotations
      if (Math.abs(degrees) % 180 !== 0) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Failed to create canvas context");
        return;
      }

      // Translate to center, rotate, then translate back
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(degrees * Math.PI / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedImage = canvas.toDataURL('image/png');
      setBackgroundImage(rotatedImage);
      setOriginalImage(rotatedImage);
      setCanvasReady(false);
    };
    img.onerror = () => toast.error("Failed to load image");
    img.src = backgroundImage;
  }, [backgroundImage]);

  const handleRotateLeftClick = useCallback(() => rotateImage(-90), [rotateImage]);
  const handleRotateRightClick = useCallback(() => rotateImage(90), [rotateImage]);

  // Drag and drop functions
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
        toast.error("Failed to load dropped image");
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

  // Export functions
  const handleDownloadSketch = useCallback(async () => {
    try {
      const canvasData = await canvasSketchRef.current?.exportImage("jpeg");
      if (canvasData) {
        const link = document.createElement("a");
        link.href = canvasData;
        link.download = `drawing-${Date.now()}.jpeg`;
        link.click();
      }
    } catch (error) {
      toast.error("Failed to export drawing");
      console.error("Error exporting drawing:", error);
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    if (!canvasRef.current) {
      toast.error("Canvas not found");
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    setSelectedImageId(null);

    html2canvas(canvasRef.current, {
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
    })
      .then((canvas) => {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `moodboard-${Date.now()}.png`;
        link.click();
      })
      .catch((error) => {
        toast.error("Failed to save the design");
        console.error("Error exporting canvas:", error);
      });
  }, []);

  // Canvas expansion functions
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

  const setCustomCanvasSize = useCallback((width: string, height: string) => {
    setCanvasSize({ width, height });
  }, []);

  // Start resize with mouse
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);

    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setInitialPos({ x: clientX, y: clientY });

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setInitialSize({ width: rect.width, height: rect.height });
    }

    const handleResizeMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isResizing) return;

      let moveClientX, moveClientY;
      if ('touches' in moveEvent) {
        moveClientX = moveEvent.touches[0].clientX;
        moveClientY = moveEvent.touches[0].clientY;
      } else {
        moveClientX = moveEvent.clientX;
        moveClientY = moveEvent.clientY;
      }

      const deltaX = moveClientX - initialPos.x;
      const deltaY = moveClientY - initialPos.y;

      const newWidth = Math.max(200, initialSize.width + deltaX);
      const newHeight = Math.max(200, initialSize.height + deltaY);

      setCanvasSize({
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.addEventListener('touchmove', handleResizeMove, { passive: false });
    document.addEventListener('touchend', handleResizeEnd);

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('touchmove', handleResizeMove);
      document.removeEventListener('touchend', handleResizeEnd);
    };
  }, [isResizing, initialPos, initialSize]);

  return (
    <div className={`w-full h-full ${isExpanded ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <Tabs
        onValueChange={setActiveTab}
        defaultValue="images"
        className="w-full h-full flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 shrink-0">
          <TabsTrigger value="images">MoodBoard</TabsTrigger>
          <TabsTrigger value="draw">Drawing Canvas</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="flex-1 overflow-hidden">
          <div
            className="w-full h-full flex flex-col bg-white rounded-lg shadow-xl opacity-80 p-2 sm:p-4 text-gray-700"
            onClick={() => setSelectedImageId("")}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-bold">Canvas</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={toggleCanvasExpansion}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  {isExpanded ? <Minimize2 className='w-4 h-4' /> : <Maximize2 className='w-4 h-4' />}
                  <span className="ml-2 hidden sm:inline">
                    {isExpanded ? 'Minimize' : 'Expand'}
                  </span>
                </Button>
                <Button
                  onClick={handleExportJSON}
                  className="flex-1 sm:flex-none px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size="sm"
                >
                  <Download className='w-4 h-4' />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToParentElement]}
            >
              <div
                ref={canvasRef}
                className="flex-1 relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-md overflow-hidden opacity-100 min-h-[300px] sm:min-h-[400px]"
                style={{
                  width: canvasSize.width,
                  height: isExpanded ? 'calc(100vh - 120px)' : canvasSize.height,
                  resize: isExpanded ? 'none' : 'both',
                  position: 'relative'
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {images.map((image) => (
                  <CanvasImage
                    key={image.id}
                    id={image.id}
                    src={image.src}
                    initialPosition={image.position}
                    onRemove={() => handleRemoveImage(image.id)}
                    isSelected={selectedImageId === image.id}
                    onClick={() => setSelectedImageId(image.id)}
                  />
                ))}
                {images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-center p-4">
                    <span className="text-sm sm:text-base">
                      Drag and drop images here
                    </span>
                  </div>
                )}

                {!isExpanded && (
                  <div
                    className="absolute bottom-0 right-0 w-6 h-6 bg-gray-400 opacity-70 hover:opacity-100 cursor-se-resize flex items-center justify-center rounded-tl-md"
                    onMouseDown={handleResizeStart}
                    onTouchStart={handleResizeStart}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path d="M0 10L10 10L10 0" fill="none" stroke="white" strokeWidth="1" />
                      <path d="M0 6L6 0" fill="none" stroke="white" strokeWidth="1" />
                      <path d="M0 2L2 0" fill="none" stroke="white" strokeWidth="1" />
                    </svg>
                  </div>
                )}
              </div>
            </DndContext>
          </div>
        </TabsContent>

        <TabsContent value="draw" className="flex-1 overflow-hidden">
          <div className="w-full h-full flex flex-col bg-white opacity-80 rounded-lg p-2 sm:p-4 text-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
              <h2 className="text-lg sm:text-xl font-bold">Drawing Canvas</h2>
              <div className='flex items-center gap-2 sm:gap-4 w-full sm:w-auto pr-2'>
                <Button
                  onClick={toggleCanvasExpansion}
                  variant="outline"
                  size="sm"
                  className='w-1/2'
                >
                  {isExpanded ? <Minimize2 className='w-4 h-4' /> : <Maximize2 className='w-4 h-4' />}
                  <span className="ml-2 sm:inline">
                    {isExpanded ? 'Minimize' : 'Expand'}
                  </span>
                </Button>
                <Button
                  onClick={handleDownloadSketch}
                  size="sm"
                  aria-label="Download drawing"
                  className='w-1/2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                >
                  <Download className="w-4 h-4" />
                  <span className="sm:inline">Download</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:gap-4 mb-2 sm:mb-4">
              {/* Main Toolbar */}
              {/* <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4'> */}
              <div className='flex flex-wrap gap-1 sm:gap-2 items-center justify-between sm:justify-start w-full'>
                <Button
                  type="button"
                  variant={eraseMode ? "outline" : "default"}
                  onClick={handlePenClick}
                  size="sm"
                  aria-label="Pen tool"
                >
                  <Pen />
                </Button>
                <Button
                  type="button"
                  variant={!eraseMode ? "outline" : "default"}
                  onClick={handleEraserClick}
                  size="sm"
                  aria-label="Eraser tool"
                >
                  <Eraser />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUndoClick}
                  size="sm"
                  aria-label="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRedoClick}
                  size="sm"
                  aria-label="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearClick}
                  size="sm"
                  aria-label="Clear canvas"
                >
                  <BrushCleaning />
                </Button>
              </div>
              {/* </div> */}
              {/* Settings Row */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4'>
                <div className='flex flex-wrap items-center gap-2 sm:gap-4'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <span className="text-xs sm:text-sm">Stroke: {strokeWidth}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit">
                      <input
                        disabled={eraseMode}
                        type="range"
                        className="form-range w-full"
                        min="1"
                        max="20"
                        step="1"
                        value={strokeWidth}
                        onChange={handleStrokeWidthChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <span className="text-xs sm:text-sm">Eraser: {eraserWidth}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit">
                      <input
                        disabled={!eraseMode}
                        type="range"
                        className="form-range w-full"
                        min="1"
                        max="20"
                        step="1"
                        value={eraserWidth}
                        onChange={handleEraserWidthChange}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='flex items-center gap-2 sm:gap-4'>
                  <div className='flex flex-col gap-1 items-center'>
                    <label htmlFor="strokeColor" className="text-xs">Stroke</label>
                    <input
                      type="color"
                      id="strokeColor"
                      value={strokeColor}
                      onChange={handleStrokeColorChange}
                      className='cursor-pointer rounded-md w-8 h-8'
                      aria-label="Stroke color"
                    />
                  </div>
                  <div className='flex flex-col gap-1 items-center'>
                    <label htmlFor="canvasColor" className="text-xs">Canvas</label>
                    <input
                      type="color"
                      id="canvasColor"
                      value={canvasColor}
                      onChange={handleCanvasColorChange}
                      className='cursor-pointer rounded-md border-gray-300 border w-8 h-8'
                      aria-label="Canvas color"
                    />
                  </div>
                </div>
              </div>

              {/* Image controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center sm:items-center gap-2 sm:gap-4">
                {!backgroundImage && (
                  <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
                    <Input
                      type='file'
                      className='h-8 text-xs'
                      accept="image/*"
                      onChange={handleFileInputChange}
                      aria-label="Upload background image"
                    />
                    <span className="text-xs text-gray-500">OR</span>
                  </div>
                )}

                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-1 border px-2 py-1 rounded-md h-8 min-w-0'>
                    <div
                      className="text-gray-500 text-xs rounded-md flex-1 h-full flex items-center justify-center cursor-move overflow-hidden"
                      onDrop={handleSketchImageDrop}
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
                        onClick={() => {
                          setBackgroundImage("");
                          setOriginalImage("");
                        }}
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
                      onChange={handlePreserveAspectRatioChange}
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
                      onClick={handleCropClick}
                      aria-label="Crop image"
                    >
                      <Crop className='h-3 w-3' />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResizeClick}
                      aria-label="Resize image"
                    >
                      <ImageUpscale className='h-3 w-3' />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotateLeftClick}
                      aria-label="Rotate left"
                    >
                      <RotateCcwSquare className='h-3 w-3' />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotateRightClick}
                      aria-label="Rotate right"
                    >
                      <RotateCwSquare className='h-3 w-3' />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Crop Modal */}
            {showCropModal && originalImage && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-4 sm:p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
                  <div className="flex flex-col items-center gap-4">
                    <div className='relative w-full h-[40vh] sm:h-[50vh] bg-gray-200'>
                      <Cropper
                        image={originalImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={4 / 3}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button onClick={applyCrop} className="flex-1 sm:flex-none">
                        Apply Crop
                      </Button>
                      <Button onClick={cancelCrop} variant="outline" className="flex-1 sm:flex-none">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resize Modal */}
            {showResizeModal && currentImageForResize && (
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
                        value={resizeWidth}
                        onChange={(e) => setResizeWidth(e.target.value)}
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
                        value={resizeHeight}
                        onChange={(e) => setResizeHeight(e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="e.g., 600"
                        min={MIN_IMAGE_DIMENSION}
                        max={MAX_IMAGE_DIMENSION}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                      <Button onClick={applyResize} className="w-full sm:w-auto">
                        Apply Resize
                      </Button>
                      <Button onClick={cancelResize} variant="outline" className="w-full sm:w-auto">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Canvas */}
            <div
              className="flex-1 border-2 border-gray-300 rounded-md border-dashed overflow-hidden relative min-h-[400px] sm:min-h-[400px]"
              style={{
                height: isExpanded ? 'calc(100vh - 200px)' : 'auto',
                position: 'relative',
                resize: isExpanded ? 'none' : 'both'
              }}
              onDrop={handleSketchImageDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <ReactSketchCanvas
                key={`${backgroundImage}-${canvasColor}`}
                ref={canvasSketchRef}
                backgroundImage={backgroundImage}
                preserveBackgroundImageAspectRatio={preserveAspectRatio}
                style={{ width: "100%", height: "100%" }}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                canvasColor={canvasColor}
                eraserWidth={eraserWidth}
                onStroke={() => setCanvasReady(true)}
              />

              {!canvasReady && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-center p-4"
                  style={{ zIndex: 1 }}
                >
                  <span className="text-sm sm:text-base">
                    Draw your favorite sketch or drop an image here...
                  </span>
                </div>
              )}

              {!isExpanded && (
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 bg-gray-400 opacity-70 hover:opacity-100 cursor-se-resize flex items-center justify-center rounded-tl-md"
                  onMouseDown={handleResizeStart}
                  onTouchStart={handleResizeStart}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M0 10L10 10L10 0" fill="none" stroke="white" strokeWidth="1" />
                    <path d="M0 6L6 0" fill="none" stroke="white" strokeWidth="1" />
                    <path d="M0 2L2 0" fill="none" stroke="white" strokeWidth="1" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}