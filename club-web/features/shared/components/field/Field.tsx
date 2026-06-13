function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-red-400">{message}</span>;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, ...props }: InputProps) {
  return (
    <div className="group">
      <div
        className={`relative rounded-xl border transition-colors duration-200 ${
          error
            ? "border-red-500/60 bg-red-950/20"
            : "border-white/10 bg-white/5 focus-within:border-white/30 focus-within:bg-white/8"
        }`}
      >
        <input
          {...props}
          placeholder=" "
          className="peer w-full bg-transparent px-4 pb-2.5 pt-6 text-sm text-white outline-none placeholder-transparent"
        />
        <label className="pointer-events-none absolute left-4 top-4 text-xs text-white/40 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-xs">
          {label}
        </label>
      </div>
      <FieldError message={error} />
    </div>
  );
}
