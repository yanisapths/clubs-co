import { useEffect } from "react";

export const useOverflowDebugger = () => {
  useEffect(() => {
    let mousetrapRef: Mousetrap.MousetrapInstance | undefined = undefined;
    import("mousetrap").then(({ default: mousetrap }) => {
      mousetrapRef = mousetrap.bind(["command+i", "ctrl+i", "alt+i"], () => {
        document.body.classList.toggle("inspect");
      });
    });

    return () => {
      mousetrapRef?.unbind(["command+i", "ctrl+i", "alt+i"]);
    };
  }, []);
};
