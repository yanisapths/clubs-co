function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const GRADIENTS: [string, string][] = [
  ["#9333EA", "#C084FC"], // purple
  ["#2563EB", "#38BDF8"], // blue
  ["#059669", "#34D399"], // green
  ["#DB2777", "#F472B6"], // pink
  ["#D97706", "#FBBF24"], // amber
  ["#DC2626", "#F87171"], // red
  ["#0891B2", "#67E8F9"], // cyan
  ["#7C3AED", "#A78BFA"], // violet
];

export function getGradient(seedKey: string): [string, string] {
  const seed = hashString(seedKey.toLowerCase().trim() || "anon");
  return GRADIENTS[seed % GRADIENTS.length];
}
