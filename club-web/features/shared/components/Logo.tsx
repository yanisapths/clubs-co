import Link from "next/link";

export function Logo() {
  return (
    <Link href="/">
      <div className="flex gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black">
            <circle cx="8" cy="12" r="5" />
            <rect x="15" y="7" width="3" height="10" rx="1.5" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          clubspace
        </span>
      </div>
    </Link>
  );
}
