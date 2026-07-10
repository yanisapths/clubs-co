"use client";

import { Button as HeroUIButton } from "@heroui/react";
import type { ButtonRootProps } from "@heroui/react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@heroui/react";
import type { ReactNode } from "react";

const buttonVariants = tv({
  base: "",
  variants: {
    color: {
      default:
        "bg-white/4 hover:bg-white/16 focus:shadow-focus-ring-primary disabled:opacity-60",
      primary:
        "bg-[#29FF9F] text-[#16422F] hover:opacity-90 focus:shadow-focus-ring-primary",
      secondary: "bg-white/4 focus:shadow-focus-ring-primary",
      warning:
        "bg-[#FDFF73] hover:bg-[#FDFF73]/90 text-[#5B5C08] focus:shadow-focus-ring-primary",
      accent:
        "bg-[#A889FF] text-[#380556] hover:bg-[#A889FF]/90 focus:shadow-focus-ring-primary",
      danger: "focus:shadow-focus-ring-danger",
      transparent:
        "bg-transparent hover:bg-transparent focus:shadow-none active:shadow-none",
      theme:
        "bg-clip-text text-heading-lg font-bold text-transparent bg-gradient-to-r from-teal-500 to-sky-500 rounded-full after:rounded-full",
      "default-text":
        "text-grey-300 hover:text-primary focus:text-teal-800 disabled:text-grey-900 bg-transparent hover:bg-transparent focus:shadow-none active:shadow-none",
    },
    weight: {
      regular: "font-regular",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    customSize: {
      lg: "rounded-full py-lg px-2xl text-base",
      md: "rounded-full py-md px-lg text-base",
      sm: "rounded-full py-sm px-md text-sm",
    },
    customVariant: {
      bordered: "border bg-transparent text-white hover:bg-white/4",
      ghost: "border-none text-white hover:bg-white/4",
      text: "border-none bg-transparent",
      outline:
        "border border-grey-500 bg-transparent text-white hover:bg-white/4",
    },
    iconOnly: {
      true: "!p-0",
    },
    content: {
      base: "px-3 py-4 font-semibold text-lg focus:outline focus:ring focus:ring-teal-800",
      text: "normal-case hover:outline-none focus:outline-none focus:ring-0",
    },
    hidden: {
      true: "hidden",
    },
    // v3: use isPending for loading state — handled via className only
    isLoading: {
      true: "opacity-100 bg-white/4 text-white/16",
    },
    // v3: isDisabled is a valid ButtonRootProps — only style override here
    isDisabledStyle: {
      true: "opacity-100 bg-white/4 text-white/16 cursor-not-allowed pointer-events-auto",
    },
  },
  compoundVariants: [
    {
      customVariant: "bordered",
      isDisabledStyle: true,
      class:
        "opacity-100 border-grey-900 bg-transparent hover:bg-transparent cursor-not-allowed",
    },
    {
      customVariant: "ghost",
      isDisabledStyle: true,
      class:
        "opacity-100 bg-transparent hover:bg-transparent cursor-not-allowed",
    },
    {
      customVariant: "text",
      isDisabledStyle: true,
      class:
        "opacity-100 bg-transparent hover:bg-transparent cursor-not-allowed",
    },
  ],
  defaultVariants: {
    customSize: "md",
    color: "default",
    weight: "regular",
    hidden: false,
  },
});

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps = Omit<ButtonRootProps, "children"> &
  ButtonVariantProps & {
    children?: ReactNode;
  };

export function Button({
  // our custom variant props
  color,
  weight,
  customSize,
  customVariant,
  variant,
  iconOnly,
  content,
  hidden,
  isLoading,
  isDisabledStyle,
  className,
  isDisabled,
  isPending,
  isIconOnly,
  children,
  ...props
}: ButtonProps) {
  return (
    <HeroUIButton
      {...props}
      isDisabled={isDisabled}
      isPending={isPending ?? isLoading}
      isIconOnly={isIconOnly ?? iconOnly}
      variant={variant}
      className={cn(
        buttonVariants({
          color,
          weight,
          customSize,
          customVariant,
          iconOnly,
          content,
          hidden,
          isLoading,
          isDisabledStyle: isDisabledStyle ?? isDisabled,
        }),
        className,
      )}
    >
      {children}
    </HeroUIButton>
  );
}

export type { ButtonVariantProps };
