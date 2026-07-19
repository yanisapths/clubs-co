export function MemberAvatar({
  displayName,
  size = "md",
}: {
  displayName: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-md";

  return (
    <div
      className={`${sizeClass} relative bg-black font-semibold flex shrink-0 items-center justify-center rounded-full text-white uppercase`}
      style={{
        boxShadow:
          "inset 0 0 16px 6px rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <span className="relative z-10">{displayName[0]}</span>
    </div>
  );
}
