// app/login/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import Link from "next/link";

// ─── Schemas ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers, and underscores",
      ),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

// ─── API calls ───────────────────────────────────────────────────────────────

async function apiSignup(data: Omit<SignupValues, "confirm_password">) {
  const res = await fetch("http://localhost:9090/api/v1/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Signup failed");
  }
  return res.json();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-red-400">{message}</span>;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
function Field({ label, error, ...props }: InputProps) {
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

// ─── Login form ──────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (result?.error) {
      setServerError("Invalid email or password");
      return;
    }
    const session = await getSession();
    if (session) {
      router.back();
      localStorage.setItem("accessToken", session?.accessToken);
      toast.success("login successfully!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field
        label="Email"
        type="email"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Field
        label="Password"
        type="password"
        autoComplete="current-password"
        {...register("password")}
        error={errors.password?.message}
      />

      {serverError && (
        <p className="rounded-lg bg-red-950/40 px-4 py-3 text-sm text-red-400 border border-red-500/20">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="relative w-full overflow-hidden rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-white/90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> Signing in…
          </span>
        ) : (
          "Continue"
        )}
      </button>

      <p className="text-center text-sm text-white/40">
        Don&#39;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-white/70 underline-offset-2 hover:underline hover:text-white transition-colors"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}

// ─── Signup form ─────────────────────────────────────────────────────────────

function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupValues) => {
    setServerError(null);
    try {
      await apiSignup({
        email: values.email,
        username: values.username,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
      });
      // Auto sign-in after successful signup
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (result?.error) {
        onSwitch(); // fallback: go to login
        return;
      }
      router.push("/");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="First name"
          type="text"
          autoComplete="given-name"
          {...register("first_name")}
          error={errors.first_name?.message}
        />
        <Field
          label="Last name"
          type="text"
          autoComplete="family-name"
          {...register("last_name")}
          error={errors.last_name?.message}
        />
      </div>

      <Field
        label="Username"
        type="text"
        autoComplete="username"
        {...register("username")}
        error={errors.username?.message}
      />
      <Field
        label="Email"
        type="email"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Field
        label="Password"
        type="password"
        autoComplete="new-password"
        {...register("password")}
        error={errors.password?.message}
      />
      <Field
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        {...register("confirm_password")}
        error={errors.confirm_password?.message}
      />

      {serverError && (
        <p className="rounded-lg bg-red-950/40 px-4 py-3 text-sm text-red-400 border border-red-500/20">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-white/90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> Creating account…
          </span>
        ) : (
          "Create account"
        )}
      </button>

      <p className="text-center text-sm text-white/40">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-white/70 underline-offset-2 hover:underline hover:text-white transition-colors"
        >
          Log in
        </button>
      </p>
    </form>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2.5">
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
  );
}

// ─── OAuth button ────────────────────────────────────────────────────────────

function OAuthButton({
  provider,
  label,
  icon,
}: {
  provider: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => signIn(provider)}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.99]"
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {/* Subtle radial glow behind card */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-5">
          <Link href="/">
            <Logo />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {mode === "login" ? "Log in or sign up" : "Create your account"}
          </h1>
        </div>

        {/* OAuth options — show only on login */}
        {mode === "login" && (
          <>
            <div className="space-y-2.5 mb-5">
              <OAuthButton
                provider="google"
                label="Continue with Google"
                icon={
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                }
              />
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-black px-3 text-xs text-white/30">or</span>
              </div>
            </div>
          </>
        )}

        {/* Form */}
        <div
          key={mode}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {mode === "login" ? (
            <LoginForm onSwitch={() => setMode("signup")} />
          ) : (
            <SignupForm onSwitch={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
