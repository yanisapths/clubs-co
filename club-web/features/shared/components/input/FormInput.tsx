"use client";

import {
  ChangeEvent,
  SelectHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FormInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
  error?: string;
}

export function FormInput({
  id,
  label,
  value,
  onChange,
  hint,
  maxLength,
  showCount = false,
  error,
  placeholder,
  type = "text",
  ...rest
}: FormInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = maxLength
      ? e.target.value.slice(0, maxLength)
      : e.target.value;
    onChange(next);
  };

  return (
    <div>
      <label htmlFor={id} className="text-base font-semibold text-white">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-describedby={hint || error ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        className={[
          "mt-3 w-full rounded-2xl border bg-zinc-900 px-5 py-4",
          "text-base text-white placeholder-zinc-500 outline-none transition-colors",
          error
            ? "border-red-500 focus:border-red-400"
            : "border-zinc-700 focus:border-zinc-500",
        ].join(" ")}
        {...rest}
      />
      {(hint || error || (showCount && maxLength !== undefined)) && (
        <div
          id={`${id}-hint`}
          className="mt-2 flex items-center justify-between text-sm"
        >
          <span className={error ? "text-red-400" : "text-zinc-500"}>
            {error ?? hint ?? ""}
          </span>
          {showCount && maxLength !== undefined && (
            <span className="font-mono text-zinc-500">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface FormTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
  error?: string;
}

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  hint,
  maxLength,
  showCount = false,
  error,
  rows = 3,
  placeholder,
  ...rest
}: FormTextareaProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = maxLength
      ? e.target.value.slice(0, maxLength)
      : e.target.value;
    onChange(next);
  };

  return (
    <div>
      <label htmlFor={id} className="text-base font-semibold text-white">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-describedby={hint || error ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        className={[
          "mt-3 w-full resize-none rounded-2xl border bg-zinc-900 px-5 py-4",
          "text-base text-white placeholder-zinc-500 outline-none transition-colors",
          error
            ? "border-red-500 focus:border-red-400"
            : "border-zinc-700 focus:border-zinc-500",
        ].join(" ")}
        {...rest}
      />
      {(hint || error || (showCount && maxLength !== undefined)) && (
        <div
          id={`${id}-hint`}
          className="mt-2 flex items-center justify-between text-sm"
        >
          <span className={error ? "text-red-400" : "text-zinc-500"}>
            {error ?? hint ?? ""}
          </span>
          {showCount && maxLength !== undefined && (
            <span className="font-mono text-zinc-500">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface SelectOption {
  value: string | number;
  label: string;
}

type FormSelectVariant = "sm" | "default";

interface FormSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "value"
> {
  id: string;
  label?: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
  variant?: FormSelectVariant;
}

const SIZE_STYLES: Record<
  FormSelectVariant,
  {
    select: string;
    chevron: string;
    chevronPos: string;
    wrapperMargin: string;
  }
> = {
  default: {
    select:
      "w-full appearance-none rounded-2xl border bg-zinc-900 px-5 py-4 text-base",
    chevron: "h-4 w-4",
    chevronPos: "right-5",
    wrapperMargin: "mt-3",
  },
  sm: {
    select:
      "appearance-none rounded-full border-0 pl-4 pr-8 py-2 text-sm font-medium",
    chevron: "h-3.5 w-3.5",
    chevronPos: "right-3",
    wrapperMargin: "",
  },
};

export function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  hint,
  error,
  variant = "default",
  className,
  ...rest
}: FormSelectProps) {
  const s = SIZE_STYLES[variant];
  const isSm = variant === "sm";

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="text-base font-semibold text-white">
          {label}
        </label>
      ) : null}

      <div className={["relative", s.wrapperMargin].join(" ")}>
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={hint || error ? `${id}-hint` : undefined}
          aria-invalid={!!error}
          className={[
            s.select,
            "text-white outline-none transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            isSm
              ? "bg-white/[0.08]"
              : error
                ? "border-red-500 focus:border-red-400"
                : "border-zinc-700 focus:border-zinc-500",
            className ?? "",
          ].join(" ")}
          {...rest}
        >
          {!isSm && (
            <option value="" disabled className="cursor-pointer text-zinc-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ color: "#000" }}
              className="cursor-pointer"
            >
              {opt.label}
            </option>
          ))}
        </select>

        <svg
          className={[
            "cursor-pointer pointer-events-none absolute top-1/2 -translate-y-1/2",
            s.chevron,
            s.chevronPos,
            isSm ? "text-white/50" : "text-zinc-400",
          ].join(" ")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {(hint || error) && (
        <div id={`${id}-hint`} className="mt-2 text-sm">
          <span className={error ? "text-red-400" : "text-zinc-500"}>
            {error ?? hint}
          </span>
        </div>
      )}
    </div>
  );
}
