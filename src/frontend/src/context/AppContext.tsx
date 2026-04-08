import { type ReactNode, createContext, useContext, useState } from "react";
import type { DrawingData, Generation } from "../types";

interface AppState {
  drawingDataURL: DrawingData | null;
  setDrawingDataURL: (dataURL: DrawingData | null) => void;
  currentGeneration: Generation | null;
  setCurrentGeneration: (generation: Generation | null) => void;
  designPrompt: string;
  setDesignPrompt: (prompt: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [drawingDataURL, setDrawingDataURL] = useState<DrawingData | null>(
    null,
  );
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(
    null,
  );
  const [designPrompt, setDesignPrompt] = useState("");

  return (
    <AppContext.Provider
      value={{
        drawingDataURL,
        setDrawingDataURL,
        currentGeneration,
        setCurrentGeneration,
        designPrompt,
        setDesignPrompt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
