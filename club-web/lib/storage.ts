export function getStoredToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("accessToken") ?? undefined;
}

export function setStoredToken(token: string, expiresIn?: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
  if (expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem("accessTokenExpiresAt", String(expiresAt));
  }
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("accessTokenExpiresAt");
}

export function isTokenExpired(): boolean {
  if (typeof window === "undefined") return false;
  const expiresAt = localStorage.getItem("accessTokenExpiresAt");
  if (!expiresAt) return false;
  return Date.now() > parseInt(expiresAt, 10);
}
