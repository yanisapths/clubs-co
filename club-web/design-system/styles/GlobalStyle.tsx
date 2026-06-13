"use client";

import { useEffect } from "react";

import {
  createBorderRadiusCssVariables,
  createColorCssVariables,
  createEffectCssVariables,
  createSpacingCssVariables,
} from "@/design-system/constants";
export const GlobalStyle = () => {
  useEffect(() => {
    const asterDesignSystemTag = document.head.querySelector(
      "[aster-design-system]",
    );

    if (asterDesignSystemTag) {
      asterDesignSystemTag.remove();
    }

    const style = document.createElement("style");

    style.setAttribute("aster-design-system", "v1.0");

    style.innerHTML = `
      :root {
${createSpacingCssVariables().join("\n")}
${createColorCssVariables().join("\n")}
${createBorderRadiusCssVariables().join("\n")}
${createEffectCssVariables().join("\n")}
      }
    `;

    document.head.appendChild(style);
  }, []);

  return null;
};
