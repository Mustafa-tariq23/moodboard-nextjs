export type CanvasImageType = {
  id: string;
  src: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type CanvasProps = {
  images: CanvasImageType[];
  onImagesChange: (images: CanvasImageType[]) => void;
};

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
