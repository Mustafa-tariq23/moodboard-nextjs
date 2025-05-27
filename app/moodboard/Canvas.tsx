import {
  useState,
  useRef,
  type ChangeEvent,
  useMemo,
  useEffect
} from 'react';

import CanvasImage from '../../components/CanvasImage';

import ReactCrop, { Crop as cropImage, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
} from "@/components/ui/tabs"

import { Button } from '@/components/ui/button';
import { BrushCleaning, Crop, Download, Eraser, ImageUpscale, Pen, Redo2, Undo2, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
type CanvasImageType = {
  id: string;
  src: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type CanvasProps = {
  images: CanvasImageType[];
  onImagesChange: (images: CanvasImageType[]) => void;
};

export default function Canvas({ images, onImagesChange }: CanvasProps) {
  const canvasSketchRef = useRef<ReactSketchCanvasRef>(null);

  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (canvasSketchRef.current !== null) {
      setCanvasReady(true);
    }
  }, [canvasSketchRef.current]);


  const somePreserveAspectRatio = useMemo(
    () => [
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
    ] as const,
    []
  );

  type SomePreserveAspectRatio = (typeof somePreserveAspectRatio)[number];

  const [activeTab, setActiveTab] = useState("images");

  // const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState<cropImage>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropModal, setShowCropModal] = useState(false);

  const [eraseMode, setEraseMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(10);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [canvasColor, setCanvasColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState("")
  const [originalImage, setOriginalImage] = useState("") // Add this line
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<SomePreserveAspectRatio>("AspectRatio");

  // Resize states
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [currentImageForResize, setCurrentImageForResize] = useState<string | null>(null);

  // const [open, setOpen] = useState(false);
  const isInternalDrag = useRef(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // sketch canvas functions

  const handleEraserClick = () => {
    setEraseMode(true);
    canvasSketchRef.current?.eraseMode(true);
  };

  const handlePenClick = () => {
    setEraseMode(false);
    canvasSketchRef.current?.eraseMode(false);
  };

  const handleStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStrokeWidth(+event.target.value);
  };

  const handleEraserWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEraserWidth(+event.target.value);
  };

  const handleClearClick = () => {
    canvasSketchRef.current?.clearCanvas();
  };

  // color functions
  const handleStrokeColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStrokeColor(event.target.value);
  };

  const handleCanvasColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCanvasColor(event.target.value);
  };

  // undo and redo

  const handleUndoClick = () => {
    canvasSketchRef.current?.undo();
  };

  const handleRedoClick = () => {
    canvasSketchRef.current?.redo();
  };

  // image

  const handlePreserveAspectRatioChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setPreserveAspectRatio(event.target.value as SomePreserveAspectRatio);
  };

  // const handleBackgroundImageChange = async (
  //   event: ChangeEvent<HTMLInputElement>,
  // ) => {
  //   try {
  //     const imageSrc = await toBase64(event.target.value);
  //     setBackgroundImage(imageSrc);
  //     console.log(imageSrc);
  //   } catch (error) {
  //     console.error("Error converting image to base64:", error);
  //   }
  // };

  // download image

  const handleDownloadSketch = async () => {
    const canvasData = await canvasSketchRef.current?.exportImage("jpeg");
    if (canvasData) {
      const link = document.createElement("a");
      link.href = canvasData;
      link.download = `drawing-${Date.now()}.jpeg`;
      link.click();
    }

    console.log(canvasData);
  };

  // image function

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setBackgroundImage(result);
          setOriginalImage(result); // Store original
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSketchImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Handle file drops
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBackgroundImage(result);
        setOriginalImage(result); // Store original
      };
      reader.readAsDataURL(file);
      return;
    }

    // Handle URL drops from sidebar
    const imageUrl = e.dataTransfer.getData('text/plain');
    if (imageUrl) {
      try {
        const dataUrl = await toBase64(imageUrl);
        setBackgroundImage(dataUrl);
        setOriginalImage(dataUrl); // Store original
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }
  };

  // crop function

  // crop function
  const handleCropClick = () => {
    if (!originalImage) return; // Use original image
    setShowCropModal(true);
    // Initialize crop to center 50% of image
    setCrop({
      unit: '%',
      x: 25,
      y: 25,
      width: 50,
      height: 50
    });
  };

  // Update the applyCrop function with better handling
  const applyCrop = () => {
    if (!completedCrop || !originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.onload = () => {
      // Set canvas dimensions to match crop
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      
      // Draw the cropped portion
      ctx?.drawImage(
        image,
        completedCrop.x,
        completedCrop.y,
        completedCrop.width,
        completedCrop.height,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      
      // Generate high-quality PNG
      const croppedImageUrl = canvas.toDataURL('image/png', 1.0);
      
      // First clear existing canvas content
      canvasSketchRef.current?.clearCanvas();
      
      // Then update state - React will handle the rerender
      setShowCropModal(false);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setCanvasReady(false);
      
      // Use setTimeout to ensure DOM updates before setting new background
      setTimeout(() => {
        setBackgroundImage(croppedImageUrl);
      }, 50);
    };

    image.src = originalImage;
  };

  const cancelCrop = () => {
    setShowCropModal(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  // Resize functions
  const handleResizeClick = () => {
    if (!backgroundImage) return;
    const img = new Image();
    img.onload = () => {
      setResizeWidth(img.width.toString());
      setResizeHeight(img.height.toString());
      setCurrentImageForResize(backgroundImage);
      setShowResizeModal(true);
    };
    img.src = backgroundImage;
  };

  const applyResize = () => {
    if (!currentImageForResize || !resizeWidth || !resizeHeight) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const newWidth = parseInt(resizeWidth, 10);
      const newHeight = parseInt(resizeHeight, 10);

      if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
        alert("Invalid dimensions. Please enter positive numbers for width and height.");
        return;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      const resizedImageUrl = canvas.toDataURL('image/png', 1.0);

      canvasSketchRef.current?.clearCanvas(); // Clear drawings
      
      setBackgroundImage(resizedImageUrl);
      setOriginalImage(resizedImageUrl); // Update originalImage as well, so crop works on resized
      setCanvasReady(false);
      cancelResize(); // Close modal and reset states
    };
    img.src = currentImageForResize;
  };

  const cancelResize = () => {
    setShowResizeModal(false);
    setResizeWidth('');
    setResizeHeight('');
    setCurrentImageForResize(null);
  };

  // end of sketch canvas functions


  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const activeId = active.id as string;

    onImagesChange(
      images.map((img: CanvasImageType) => {
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
    )
  }

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
      alert(`Failed to save the design. Please try again.`);
      console.error("Error fetching images:", error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }
    ))
  // Use useEffect to handle DOM operations after component mounts
  useEffect(() => {
    const handleLoad = () => {
      const canvas_with_mask = document.querySelector("#react-sketch-canvas__stroke-group-0");
      canvas_with_mask?.removeAttribute("mask");
    };

    // Run once on mount and also add load event listener
    handleLoad();
    window.addEventListener('load', handleLoad);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [])

  return (

    <Tabs onValueChange={setActiveTab} defaultValue="images" className="w-full h-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="images">MoodBoard</TabsTrigger>
        <TabsTrigger value="draw">Drawing Canvas</TabsTrigger>
      </TabsList>
      <TabsContent value="images">
        <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-xl opacity-80 p-4 text-gray-700 overflow-scroll" >
          <div className="flex justify-between items-center mb-4"
            onClick={() => setSelectedImageId("")}
          >
            <h2 className="text-xl font-bold">Canvas</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className='w-4 h-4' />
              </button>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
            <div
              ref={canvasRef}
              className="flex-1 relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-md overflow-hidden opacity-100"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => setSelectedImageId("")}
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
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Drag and drop images here
                </div>
              )}
            </div>
          </DndContext>
        </div>
      </TabsContent>

      <TabsContent value="draw">
        {activeTab === 'draw' && (
          <div className="w-full h-full flex flex-col bg-white opacity-80 rounded-lg p-4 text-gray-700">
            <h2 className="text-xl font-bold text-center">Drawing Canvas</h2>
            <div className="flex justify-between items-center mb-4 p-0">
              <div className='flex flex-col justify-center items-center gap-2 w-full'>
                {/* buttons */}
                <div className='flex items-center justify-between gap-4 py-4 w-full'>
                  <div className='flex gap-2'>
                    <Button
                      type="button"
                      className="btn btn-sm btn-outline-primary bg-green-600 hover:bg-green-700"
                      disabled={!eraseMode}
                      onClick={handlePenClick}
                    >
                      <Pen />
                    </Button>
                    <Button
                      type="button"
                      className="btn btn-sm btn-outline-primary bg-green-600 hover:bg-green-700"
                      disabled={eraseMode}
                      onClick={handleEraserClick}
                    >
                      <Eraser />
                    </Button>
                    <Button
                      type="button"
                      className="btn btn-sm btn-outline-primary bg-blue-500 hover:bg-blue-600"
                      onClick={handleUndoClick}
                    >
                      <Undo2 />
                    </Button>
                    <Button
                      type="button"
                      className="btn btn-sm btn-outline-primary bg-blue-500 hover:bg-blue-600"
                      onClick={handleRedoClick}
                    >
                      <Redo2 />
                    </Button>
                    <Button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={handleClearClick}
                    >
                      <BrushCleaning />
                    </Button>
                  </div>
                  <div className='flex gap-6 items-center'>

                    <Button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      onClick={handleDownloadSketch}
                    >
                      <Download />
                    </Button>
                  </div>
                </div>
                {/* filters */}
                <div className='flex items-end justify-between w-full gap-4 pb-4'>
                  {/* pen width */}
                  <div className='flex items-center gap-4'>
                    <div className='flex flex-col items-start gap-1'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <label htmlFor="strokeWidth" className="form-label border px-3 py-1 h-8 text-sm rounded-md text-gray-500 cursor-pointer">
                            Stroke width: {strokeWidth}
                          </label>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit">
                          <input
                            disabled={eraseMode}
                            type="range"
                            className="form-range"
                            min="1"
                            max="20"
                            step="1"
                            id="strokeWidth"
                            value={strokeWidth}
                            onChange={handleStrokeWidthChange}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {/* eraser width */}
                    <div className='flex flex-col items-start gap-1'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <label htmlFor="eraserWidth" className="form-label border px-3 py-1 h-8 text-sm rounded-md text-gray-500 cursor-pointer">
                            Eraser width: {eraserWidth}
                          </label>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit">
                          <input
                            disabled={!eraseMode}
                            type="range"
                            className="form-range"
                            min="1"
                            max="20"
                            step="1"
                            id="eraserWidth"
                            value={eraserWidth}
                            onChange={handleEraserWidthChange}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  {/* pen color */}
                  <div className='flex items-center gap-4'>
                    <div className='flex flex-col gap-2 items-center'>
                      <div className="flex flex-col gap-2 align-items-center width-fit text-nowrap text-center">
                        <label htmlFor="color">Stroke</label>
                        <input
                          type="color"
                          value={strokeColor}
                          onChange={handleStrokeColorChange}
                          className='cursor-pointer rounded-md'
                        />
                      </div>
                    </div>
                    {/* canvas color */}
                    <div className='flex flex-col gap-2 items-center w-fit text-nowrap'>
                      <label htmlFor="color">Canvas</label>
                      <input
                        type="color"
                        value={canvasColor}
                        onChange={handleCanvasColorChange}
                        className='cursor-pointer rounded-md border-gray-300 border'
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className='flex items-center justify-center gap-2'>
                    {!backgroundImage && (
                      <div className='space-x-2 flex items-center justify-center w-fit'>
                        <Input type='file' className='h-8' placeholder='Browse File' onChange={(e) => handleFileInputChange(e)} />
                        <span>OR</span>
                      </div>
                    )}
                    {/* background image */}
                    <div className='flex flex-col gap-4 items-center justify-center'>
                      <div className='flex items-center gap-1 border px-3 py-1 rounded-md h-8'>
                        <div
                          className="form-control border-gray-300 text-gray-500 text-sm rounded-md w-full h-8 flex items-center justify-center cursor-move"
                          onDrop={handleSketchImageDrop}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          {backgroundImage ? 'Image uploaded' : 'Drop image here...'}
                        </div>
                        {backgroundImage && <div onClick={() => {
                          setBackgroundImage("");
                          setOriginalImage(""); // Clear both
                        }}><X className='bg-gray-800 text-white hover:bg-gray-900 border rounded-full p-1 h-5 w-5' /></div>
                        }
                      </div>
                    </div>

                    {/* edit options */}
                    {backgroundImage && (
                      <div className='flex items-center justify-center gap-2'>
                        {/* preserve aspect ratio */}
                        <div className='flex flex-col items-center justify-center gap-2'>
                          <select
                            id="preserveAspectRatio"
                            className="form-select form-select-sm border border-gray-300 text-gray-500 text-sm p-1 h-8 rounded-md cursor-pointer"
                            aria-label="Preserve Aspect Ratio options"
                            value={preserveAspectRatio}
                            onChange={handlePreserveAspectRatioChange}
                          >
                            {somePreserveAspectRatio.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* crop */}
                        <div
                          className={`h-8 w-8 border rounded-md flex items-center justify-center cursor-pointer ${showCropModal ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'
                            }`}
                          onClick={handleCropClick}
                        >
                          <Crop className='text-white h-4 w-4' />
                        </div>
                        {/* resize */}
                        <div 
                          className='h-8 w-8 bg-black hover:bg-gray-800 border rounded-md flex items-center justify-center cursor-pointer'
                          onClick={handleResizeClick}
                        >
                          <ImageUpscale className='text-white h-4 w-4' />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
            {/* Crop Modal */}
            {showCropModal && originalImage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
                  <h3 className="text-lg font-semibold mb-4">Crop Image</h3>

                  <div className="flex flex-col items-center gap-4">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={undefined} // Allow free aspect ratio
                      minWidth={10}
                      minHeight={10}
                    >
                      <img
                        src={originalImage}
                        alt="Crop preview"
                        style={{ maxWidth: '70vw', maxHeight: '50vh' }}
                        onLoad={(e) => {
                          const { width, height } = e.currentTarget;
                          setCrop({
                            unit: '%',
                            x: 25,
                            y: 25,
                            width: 50,
                            height: 50
                          });
                        }}
                      />
                    </ReactCrop>

                    <div className="flex gap-2">
                      <Button onClick={applyCrop} className="bg-green-600 hover:bg-green-700">
                        Apply Crop
                      </Button>
                      <Button onClick={cancelCrop} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Resize Modal */}
            {showResizeModal && currentImageForResize && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">Resize Image</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="resizeWidth" className="block text-sm font-medium text-gray-700">Width (px)</label>
                      <Input
                        type="number"
                        id="resizeWidth"
                        value={resizeWidth}
                        onChange={(e) => setResizeWidth(e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="e.g., 800"
                      />
                    </div>
                    <div>
                      <label htmlFor="resizeHeight" className="block text-sm font-medium text-gray-700">Height (px)</label>
                      <Input
                        type="number"
                        id="resizeHeight"
                        value={resizeHeight}
                        onChange={(e) => setResizeHeight(e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="e.g., 600"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button onClick={applyResize} className="bg-green-600 hover:bg-green-700">
                        Apply Resize
                      </Button>
                      <Button onClick={cancelResize} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 border-2 border-gray-300 rounded-md border-dashed overflow-hidden relative"
              onDrop={handleSketchImageDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <ReactSketchCanvas
                key={backgroundImage + Date.now()} // More aggressive remounting
                className="opacity-100"
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

              {/* Optional: Overlay to prompt user to draw */}
              {!canvasReady && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400"
                  style={{ zIndex: 1 }}
                >
                  Draw your favourite sketch or drop an image here...
                </div>
              )}
            </div>

          </div>
        )}
      </TabsContent>
    </Tabs >
  );
}