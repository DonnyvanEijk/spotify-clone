"use client";

import { useEffect, useState } from "react";
import { HiX } from "react-icons/hi";

interface Props {
  src: string;
  onClose: () => void;
}

export function ImageLightbox({ src, onClose }: Props) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        title="Close (Esc)"
      >
        <HiX size={20} />
      </button>
      <img
        src={src}
        alt="Image"
        onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
        className={`max-w-[90vw] max-h-[90vh] object-contain rounded-lg select-none transition-transform duration-200 ${
          zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
        }`}
      />
    </div>
  );
}
