import type { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";

export const Overlay = ({
  children,
  visible,
}: {
  children: ComponentChildren;
  visible: boolean;
}) => {
  return (
    typeof document !== "undefined" &&
    createPortal(
      visible && (
        <div class="fixed left-0 top-0 h-full w-full bg-black/50">
          {children}
        </div>
      ),
      document.body,
    )
  );
};
