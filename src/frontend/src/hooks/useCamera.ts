import { useCallback, useRef, useState } from "react";

export interface CameraConfig {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CameraError {
  type: "permission" | "not-supported" | "not-found" | "unknown" | "timeout";
  message: string;
}

export interface UseCameraReturn {
  isActive: boolean;
  isSupported: boolean | null;
  error: CameraError | null;
  isLoading: boolean;
  currentFacingMode: "user" | "environment";
  startCamera: () => Promise<boolean>;
  stopCamera: () => Promise<void>;
  capturePhoto: () => Promise<File | null>;
  switchCamera: (newFacingMode?: "user" | "environment") => Promise<boolean>;
  retry: () => Promise<boolean>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useCamera(config: CameraConfig = {}): UseCameraReturn {
  const {
    facingMode: initialFacing = "environment",
    width = 1280,
    height = 720,
    quality = 0.92,
    format = "image/jpeg",
  } = config;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<
    "user" | "environment"
  >(initialFacing);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
      setError({
        type: "not-supported",
        message: "Camera is not supported in this browser.",
      });
      return false;
    }
    setIsSupported(true);
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      return true;
    } catch (err) {
      const e = err as Error;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError({
          type: "permission",
          message: "Camera permission denied. Please allow camera access.",
        });
      } else if (
        e.name === "NotFoundError" ||
        e.name === "DevicesNotFoundError"
      ) {
        setError({
          type: "not-found",
          message: "No camera found on this device.",
        });
      } else {
        setError({
          type: "unknown",
          message: e.message ?? "Failed to start camera.",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentFacingMode, width, height]);

  const stopCamera = useCallback(async (): Promise<void> => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isActive) return null;
    canvas.width = video.videoWidth || width;
    canvas.height = video.videoHeight || height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(new File([blob], "capture.jpg", { type: format }));
        },
        format,
        quality,
      );
    });
  }, [isActive, width, height, format, quality]);

  const switchCamera = useCallback(
    async (newFacingMode?: "user" | "environment"): Promise<boolean> => {
      await stopCamera();
      const next =
        newFacingMode ??
        (currentFacingMode === "user" ? "environment" : "user");
      setCurrentFacingMode(next);
      return startCamera();
    },
    [stopCamera, startCamera, currentFacingMode],
  );

  const retry = useCallback(async (): Promise<boolean> => {
    setError(null);
    return startCamera();
  }, [startCamera]);

  return {
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  };
}
