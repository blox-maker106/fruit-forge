export type DrawingData = string; // canvas dataURL

export interface GenerationRequest {
  drawingBase64: string;
  prompt: string;
}

export type GenerationStatus =
  | { kind: "pending" }
  | { kind: "processing" }
  | { kind: "complete" }
  | { kind: "failed"; error: string };

export interface Generation {
  id: number;
  prompt: string;
  imageUrl: string;
  status: GenerationStatus;
  createdAt: number;
}
