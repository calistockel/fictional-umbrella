import { useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-ink-950/40 px-4 py-10 backdrop-blur-[2px]">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`animate-fade-in-up relative w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-2xl border border-ink-150 bg-white shadow-pop`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-800">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
