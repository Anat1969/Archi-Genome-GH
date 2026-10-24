import React, { useCallback, useRef, useState, useEffect } from "react";
import { ImagePlus, Trash2, RefreshCw } from "lucide-react";

interface EditableImageSlotProps {
  storageKey: string;
  fallbackGradient: string;
  placeholderText?: string;
  className?: string;
}

const STORAGE_PREFIX = "editable-image-slot-";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EditableImageSlot: React.FC<EditableImageSlotProps> = ({
  storageKey,
  fallbackGradient,
  placeholderText = "תמונה להמחשה",
  className = "",
}) => {
  const fullKey = STORAGE_PREFIX + storageKey;
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(fullKey);
      if (saved) setImageURL(saved);
    } catch {}
  }, [fullKey]);

  const saveImage = useCallback(
    (dataURL: string) => {
      setImageURL(dataURL);
      try {
        localStorage.setItem(fullKey, dataURL);
      } catch {
        // localStorage quota exceeded – still show in session
      }
    },
    [fullKey]
  );

  const removeImage = useCallback(() => {
    setImageURL(null);
    try {
      localStorage.removeItem(fullKey);
    } catch {}
  }, [fullKey]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const dataURL = await readFileAsDataURL(file);
      saveImage(dataURL);
    },
    [saveImage]
  );

  // Drag & drop
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Paste
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
          }
          break;
        }
      }
    };
    container.addEventListener("paste", onPaste);
    return () => container.removeEventListener("paste", onPaste);
  }, [handleFile]);

  // File input change
  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`relative rounded-xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 ${className}`}
      style={{
        background: imageURL ? undefined : fallbackGradient,
        border: isDragging
          ? "2px dashed rgba(255,255,255,0.5)"
          : "1px solid rgba(255,255,255,0.06)",
        minHeight: "7rem",
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={!imageURL ? openFileDialog : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {imageURL ? (
        <>
          <img
            src={imageURL}
            alt={placeholderText}
            className="w-full h-full object-cover"
          />
          {/* Overlay controls on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
              className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
              title="החלף תמונה"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="p-2 rounded-lg bg-white/15 hover:bg-red-500/50 transition-colors"
              title="הסר תמונה"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-1.5 py-4">
          <ImagePlus
            className="w-6 h-6 transition-transform group-hover:scale-110"
            style={{ color: "hsl(var(--newton-muted))" }}
          />
          <span
            className="text-xs"
            style={{ color: "hsl(var(--newton-muted))" }}
          >
            {isDragging ? "שחררו כאן" : placeholderText}
          </span>
          <span
            className="text-[10px] opacity-60"
            style={{ color: "hsl(var(--newton-muted))" }}
          >
            גררו, הדביקו או לחצו להעלאה
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(EditableImageSlot);
