import { cn } from "@heroui/react";
import {
  Tooltip as HeroUITooltip,
  TooltipProps as HeroUITooltipProps,
} from "@heroui/tooltip";

export const Tooltip = ({
  children,
  content,
  ...tooltipProps
}: HeroUITooltipProps) => {
  const isContentString = typeof content === "string";

  return (
    <HeroUITooltip
      shadow="none"
      showArrow
      {...tooltipProps}
      content={isContentString ? <p>{content}</p> : content}
      classNames={{
        ...tooltipProps.classNames,
        content: cn(
          "py-lg px-lg rounded-sm bg-white",
          tooltipProps.classNames?.content,
        ),
        base: cn(
          "before:bg-white before:rounded-none",
          tooltipProps.classNames?.base,
        ),
      }}
    >
      {children}
    </HeroUITooltip>
  );
};
