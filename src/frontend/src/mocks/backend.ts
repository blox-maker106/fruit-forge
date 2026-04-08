import type { backendInterface } from "../backend";

export const mockBackend: backendInterface = {
  generateDesign: async (_request) => ({
    __kind__: "ok",
    ok: {
      id: BigInt(1),
      status: { __kind__: "success", success: null },
      createdAt: BigInt(Date.now()),
      imageUrl:
        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
      prompt: "A colorful floral pattern for a mug",
    },
  }),
  getRecentGenerations: async () => [
    {
      id: BigInt(1),
      status: { __kind__: "success", success: null },
      createdAt: BigInt(Date.now() - 60000),
      imageUrl:
        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
      prompt: "A colorful floral pattern for a mug",
    },
  ],
  transform: async (input) => ({
    status: BigInt(200),
    body: input.response.body,
    headers: [],
  }),
};
