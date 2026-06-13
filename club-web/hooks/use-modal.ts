"use client";

import { useCallback, useState } from "react";

interface ModalOptions {
  initialVisible?: boolean;
}

export const useModal = (options?: ModalOptions) => {
  const [visible, setVisible] = useState(options?.initialVisible || false);

  const show = useCallback(() => setVisible(true), []);

  const close = useCallback(() => setVisible(false), []);

  const toggle = useCallback(() => setVisible((prev) => !prev), []);

  return {
    visible,
    show,
    close,
    toggle,
  };
};
