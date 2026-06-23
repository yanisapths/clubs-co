import { clearStoredToken } from "./storage";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  code?: number;
  message?: string;
}

export class ApiError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(url, options);
  const json: ApiResponse<T> = await res.json();

  if (res.status === 401) {
    clearStoredToken();

    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
    throw new Error("Unauthorized: session expired");
  }
  if (!json.success) {
    throw new ApiError(
      json.message ?? "Something went wrong",
      json.code ?? res.status,
    );
  }
  return json;
}
