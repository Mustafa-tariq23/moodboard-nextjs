import {
  useState,
  useRef,
  type ChangeEvent,
  useMemo
} from 'react';

import CanvasImage from '../../components/CanvasImage';

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
import { CrossIcon, X } from 'lucide-react';
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

  const somePreserveAspectRatio = useMemo(
    () => [
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

  const [eraseMode, setEraseMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(10);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [canvasColor, setCanvasColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState("")
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<SomePreserveAspectRatio>("none");


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

  const handleBackgroundImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      const imageSrc = await toBase64(event.target.value);
      setBackgroundImage(imageSrc);
      console.log(imageSrc);
    } catch (error) {
      console.error("Error converting image to base64:", error);
    }
  };

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

  return (

    <Tabs onValueChange={setActiveTab} defaultValue="images" className="w-full h-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="draw">Draw</TabsTrigger>
      </TabsList>
      <TabsContent value="images">
        <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-md p-4 text-gray-700 overflow-scroll" >
          <div className="flex justify-between items-center mb-4"
            onClick={() => setSelectedImageId("")}
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

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
            <div
              ref={canvasRef}
              className="flex-1 relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-md overflow-hidden"
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
          <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-md p-4 text-gray-700">
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
                      Pen
                    </Button>
                    <Button
                      type="button"
                      className="btn btn-sm btn-outline-primary bg-green-600 hover:bg-green-700"
                      disabled={eraseMode}
                      onClick={handleEraserClick}
                    >
                      Eraser
                    </Button>
                    <Button
                      type="button"
                      className="btn btn-sm btn-outline-primary bg-blue-500 hover:bg-blue-600"
                      onClick={handleUndoClick}
                    >
                      Undo
                    </Button>
                    <Button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleRedoClick}
                    >
                      Redo
                    </Button>
                    <Button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={handleClearClick}
                    >
                      Clear
                    </Button>
                  </div>
                  <div>
                    <Button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={handleDownloadSketch}
                    >
                      Download
                    </Button>
                  </div>
                </div>
                {/* filters */}
                <div className='flex items-center justify-center gap-4'>
                  {/* pen width */}
                  <div>
                    <label htmlFor="strokeWidth" className="form-label">
                      Stroke width
                    </label>
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
                  </div>
                  {/* eraser width */}
                  <div>
                    <label htmlFor="eraserWidth" className="form-label">
                      Eraser width
                    </label>
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
                  </div>
                  {/* pen color */}
                  <div className='flex flex-col gap-2 items-center'>
                    <div className="d-flex gap-2 align-items-center ">
                      <label htmlFor="color">Stroke color</label>
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={handleStrokeColorChange}
                      />
                    </div>
                  </div>
                  {/* canvas color */}
                  <div className='flex flex-col gap-2 items-center'>
                    <label htmlFor="color">Canvas color</label>
                    <input
                      type="color"
                      value={canvasColor}
                      onChange={handleCanvasColorChange}
                    />
                  </div>
                </div>

                {/* third row - background image */}
                <div className='flex items-center justify-center gap-4'>
                  {/* background image */}
                  <div className='flex flex-col gap-2 items-center justify-center'>
                    <label htmlFor="backgroundImage" className="form-label">
                      Background Image
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        type="text"
                        className="form-control border border-gray-300 p-2 rounded-md"
                        id="backgroundImage"
                        placeholder="URL of the image to use as a background"
                        value={backgroundImage}
                        onChange={handleBackgroundImageChange}
                      />
                      {backgroundImage && <div onClick={() => setBackgroundImage("")}><X className='bg-white hover:bg-gray-300 rounded-md' /></div>
                      }
                    </div>
                  </div>
                  {/* preserve aspect ratio */}
                  <div className='flex flex-col items-center justify-center gap-2'>
                    <label htmlFor="preserveAspectRatio" className="form-label ">
                      Preserve Aspect Ratio
                    </label>
                    <select
                      id="preserveAspectRatio"
                      className="form-select form-select-sm border border-gray-300 p-2 rounded-md"
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
                </div>
              </div>
            </div>
            <div className="flex-1 border-2 border-gray-300 rounded-md overflow-hidden">
              <ReactSketchCanvas

                ref={canvasSketchRef}
                backgroundImage={backgroundImage}
                preserveBackgroundImageAspectRatio={preserveAspectRatio}
                width="100%"
                height="100%"
                strokeColor={strokeColor}
                canvasColor={canvasColor}
                strokeWidth={strokeWidth}
                eraserWidth={eraserWidth}
              />
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs >
  );
}