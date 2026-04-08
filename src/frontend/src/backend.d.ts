import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type GenerationId = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface GenerationRequest {
    drawingBase64: string;
    prompt: string;
}
export interface Generation {
    id: GenerationId;
    status: GenerationStatus;
    createdAt: bigint;
    imageUrl: string;
    prompt: string;
}
export type GenerationStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "success";
    success: null;
} | {
    __kind__: "failed";
    failed: string;
};
export type GenerationResult = {
    __kind__: "ok";
    ok: Generation;
} | {
    __kind__: "err";
    err: string;
};
export interface backendInterface {
    generateDesign(request: GenerationRequest): Promise<GenerationResult>;
    getRecentGenerations(): Promise<Array<Generation>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
