import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { Generation, GenerationRequest } from "../types";

interface UseGenerateDesignResult {
  generate: (request: GenerationRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  data: Generation | null;
}

// Simulates AI generation for cup art design
// When backend method generateDesign is available via bindgen, wire it through useActor
async function mockGenerateDesign(
  request: GenerationRequest,
): Promise<Generation> {
  // Simulate network delay for AI generation
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Return a mock generation result
  return {
    id: Date.now(),
    prompt: request.prompt,
    imageUrl: "https://placehold.co/800x300/FF3CA0/white?text=Cup+Design",
    status: { kind: "complete" },
    createdAt: Date.now(),
  };
}

export function useGenerateDesign(): UseGenerateDesignResult {
  const { setCurrentGeneration } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Generation | null>(null);

  const generate = async (request: GenerationRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mockGenerateDesign(request);
      setData(result);
      setCurrentGeneration(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate design";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading, error, data };
}
