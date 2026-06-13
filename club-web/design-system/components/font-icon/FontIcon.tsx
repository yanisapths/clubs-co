import * as Icons from "@untitledui/icons";
import { type SVGProps } from "react";

import { fontSizes, textColor } from "@/design-system/constants";

export type IconNames = keyof typeof Icons;

export interface FontIconProps extends SVGProps<SVGSVGElement> {
  variant?: "solid" | "regular";
  name: IconNames;
  size?: keyof typeof fontSizes;
  color?: keyof typeof textColor;
}

export const FontIcon = ({
  variant = "regular",
  name,
  color,
  size,
  className,
  ...props
}: FontIconProps) => {
  const Icon = Icons[name];

  const iconSize = size == null ? fontSizes.lg : fontSizes[size];
  const iconColor = color == null ? undefined : textColor[color];

  return (
    <Icon
      {...props}
      key={name}
      fill={variant === "solid" ? iconColor : "none"}
      width={iconSize}
      height={iconSize}
      color={iconColor}
      className={className}
    />
  );
};
