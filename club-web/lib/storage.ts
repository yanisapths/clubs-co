export function getStoredToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem("accessToken") ?? undefined;
}

export function setStoredToken(token: string, expiresIn?: number): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("accessToken", token);
  if (expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000;
    sessionStorage.setItem("accessTokenExpiresAt", String(expiresAt));
  }
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessTokenExpiresAt");
}

export function isTokenExpired(): boolean {
  if (typeof window === "undefined") return false;
  const expiresAt = sessionStorage.getItem("accessTokenExpiresAt");
  if (!expiresAt) return false;
  return Date.now() > parseInt(expiresAt, 10);
}
