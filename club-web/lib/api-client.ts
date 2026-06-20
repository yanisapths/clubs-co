// lib/api-client.ts
import { getSession } from "@/lib/auth";

const BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Pass a token explicitly when calling from the client side */
  token?: string;
};

async function resolveToken(override?: string): Promise<string | undefined> {
  if (override) return override;
  if (typeof window === "undefined") {
    // Server-side: use next-auth session
    const session = await getSession();
    return session?.accessToken;
  }
  // Client-side: read from localStorage
  return localStorage.getItem("accessToken") ?? undefined;
}

async function request<T>(
  path: string,
  { body, token, ...init }: RequestOptions = {},
): Promise<T> {
  const accessToken = await resolveToken(token);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...init.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const err = await res.json();
      message = err?.message ?? message;
    } catch {}
    throw new ApiError(res.status, message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string, opts?: RequestOptions) {
    return request<T>(path, { ...opts, method: "GET" });
  },
  post<T>(path: string, body: unknown, opts?: RequestOptions) {
    return request<T>(path, { ...opts, method: "POST", body });
  },
  put<T>(path: string, body: unknown, opts?: RequestOptions) {
    return request<T>(path, { ...opts, method: "PUT", body });
  },
  patch<T>(path: string, body: unknown, opts?: RequestOptions) {
    return request<T>(path, { ...opts, method: "PATCH", body });
  },
  delete<T>(path: string, opts?: RequestOptions) {
    return request<T>(path, { ...opts, method: "DELETE" });
  },
};

export { ApiError };
