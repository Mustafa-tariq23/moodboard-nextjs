import { useState, useCallback, useRef } from 'react';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import { PreserveAspectRatioOption } from '../types';
import { toBase64 } from '../utils/imageUtils';

export function useDrawingCanvas() {
  const canvasSketchRef = useRef<ReactSketchCanvasRef>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(10);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [canvasColor, setCanvasColor] = useState("#ffffff");
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<PreserveAspectRatioOption>("AspectRatio");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [originalImage, setOriginalImage] = useState("");

  const handleEraserClick = useCallback(() => {
    setEraseMode(true);
    canvasSketchRef.current?.eraseMode(true);
  }, []);

  const handlePenClick = useCallback(() => {
    setEraseMode(false);
    canvasSketchRef.current?.eraseMode(false);
  }, []);

  const handleStrokeWidthChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStrokeWidth(Math.min(50, Math.max(1, +event.target.value)));
  }, []);

  const handleEraserWidthChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEraserWidth(Math.min(50, Math.max(1, +event.target.value)));
  }, []);

  const handleClearClick = useCallback(() => {
    canvasSketchRef.current?.clearCanvas();
  }, []);

  const handleStrokeColorChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStrokeColor(event.target.value);
  }, []);

  const handleCanvasColorChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasColor(event.target.value);
  }, []);

  const handlePreserveAspectRatioChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setPreserveAspectRatio(event.target.value as PreserveAspectRatioOption);
    }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        return false;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBackgroundImage(result);
        setOriginalImage(result);
      };
      reader.readAsDataURL(file);
      return true;
    }
    return false;
  }, []);

  const handleSketchImageDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBackgroundImage(result);
        setOriginalImage(result);
      };
      reader.readAsDataURL(file);
      return true;
    }

    const imageUrl = e.dataTransfer.getData('text/plain');
    if (imageUrl) {
      try {
        const dataUrl = await toBase64(imageUrl);
        setBackgroundImage(dataUrl);
        setOriginalImage(dataUrl);
        return true;
      } catch (error) {
        console.error("Error loading image:", error);
        return false;
      }
    }
    return false;
  }, []);

  const handleDownloadSketch = useCallback(async () => {
    try {
      const canvasData = await canvasSketchRef.current?.exportImage("jpeg");
      if (canvasData) {
        const link = document.createElement("a");
        link.href = canvasData;
        link.download = `drawing-${Date.now()}.jpeg`;
        link.click();
        return true;
      }
    } catch (error) {
      console.error("Error exporting drawing:", error);
    }
    return false;
  }, []);

  return {
    canvasSketchRef,
    canvasReady,
    setCanvasReady,
    eraseMode,
    strokeWidth,
    eraserWidth,
    strokeColor,
    canvasColor,
    preserveAspectRatio,
    backgroundImage,
    originalImage,
    setBackgroundImage,
    setOriginalImage,
    handleEraserClick,
    handlePenClick,
    handleStrokeWidthChange,
    handleEraserWidthChange,
    handleClearClick,
    handleStrokeColorChange,
    handleCanvasColorChange,
    handlePreserveAspectRatioChange,
    handleFileInputChange,
    handleSketchImageDrop,
    handleDownloadSketch,
  };
} 