export type PreserveAspectRatioOption =
  | "AspectRatio"
  | "none"
  | "xMinYMin"
  | "xMidYMin"
  | "xMaxYMin"
  | "xMinYMid"
  | "xMidYMid"
  | "xMaxYMid"
  | "xMinYMax"
  | "xMidYMax"
  | "xMaxYMax";

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasImage {
  id: string;
  src: string;
  position: Position;
}

export interface CanvasProps {
  images: CanvasImage[];
  onImagesChange: (images: CanvasImage[]) => void;
}

export interface CanvasSize {
  width: string;
  height: string;
}

export interface CropState {
  x: number;
  y: number;
}

export interface ResizeState {
  width: string;
  height: string;
  currentImage: string | null;
} 