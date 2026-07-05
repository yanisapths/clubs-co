import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system/components/button";
import { UploadIcon, X, ImageOff, Loader2, Trash2 } from "lucide-react";
import { uploadFile } from "@/features/studio/api/file";
import { getStoredToken } from "@/lib/storage";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg";
const TEMP_DEST_PATH = "club/temp";

type BannerStatus = "idle" | "uploading" | "uploaded" | "error";

export interface EditBannerModalResult {
  // New temp-storage URL to promote to the permanent banner slot on save.
  // Null means "no new image was uploaded".
  tempUrl: string | null;
  // True if the owner explicitly cleared the banner (maps to bannerUrl: null).
  removeBanner: boolean;
}

interface EditBannerModalProps {
  currentBannerUrl?: string | null;
  onSave: (result: EditBannerModalResult) => void;
  onClose: () => void;
}

export function EditBannerModal({
  currentBannerUrl,
  onSave,
  onClose,
}: EditBannerModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentBannerUrl ?? null,
  );
  const [status, setStatus] = useState<BannerStatus>("idle");
  const [tempUrl, setTempUrl] = useState<string | null>(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const uploadOne = async (file: File) => {
    const token = getStoredToken();
    if (!token) {
      setStatus("error");
      setError("Not signed in.");
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      // Same convention as gallery uploads: unique temp name, permanent
      // name/path assigned server-side (MoveObject) when the patch lands.
      const tempFilename = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const result = await uploadFile(
        token,
        file,
        tempFilename,
        TEMP_DEST_PATH,
      );

      setTempUrl(result.url);
      setRemoveBanner(false);
      setStatus("uploaded");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  const validateAndUpload = (file: File) => {
    const isAcceptedType =
      ACCEPTED_TYPES.includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);

    if (!isAcceptedType) {
      setError(`"${file.name}" isn't a PNG or JPG file.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which is over the 2MB limit.`,
      );
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localPreview = URL.createObjectURL(file);
    objectUrlRef.current = localPreview;
    setPreviewUrl(localPreview);
    setError(null);

    uploadOne(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleRemoveBanner = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    setTempUrl(null);
    setRemoveBanner(true);
    setStatus("idle");
    setError(null);
  };

  const isUploading = status === "uploading";
  const hasChanges = !!tempUrl || removeBanner;

  const handleSave = () => {
    if (isUploading) return;
    onSave({ tempUrl, removeBanner });
    onClose();
  };

  return (
    <div
      className="fixed h-full inset-0 z-50 flex items-center justify-center px-4 place-content-center"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[640px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.95)",
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-white">Edit banner</h2>
            <p className="text-sm text-white/50 mt-0.5">
              PNG or JPG, up to 2MB. Changes save when you click Save below.
            </p>
          </div>
          <Button
            onClick={onClose}
            className="rounded-full p-3 border border-white/30 text-white/90 hover:bg-white/5"
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative aspect-[3/1] w-full overflow-hidden rounded-xl border transition-colors ${
              isDragging
                ? "border-white/50 bg-white/5"
                : "border-white/15 border-dashed"
            }`}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Banner preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Loader2 className="h-5 w-5 animate-spin text-white/90" />
                  </div>
                )}

                {status === "error" && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 px-2 text-center"
                  >
                    <ImageOff className="h-4 w-4 text-red-300" />
                    <span className="text-[11px] text-red-300 underline">
                      Failed — tap to retry
                    </span>
                  </button>
                )}

                {status !== "uploading" && (
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    aria-label="Remove banner image"
                    className="absolute top-2 right-2 cursor-pointer rounded-full bg-black/70 p-1.5 text-white/90 hover:bg-black/90"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <p className="text-white/80 font-medium">No banner set</p>
                <p className="text-white/40 text-sm">
                  Upload an image to showcase your club
                </p>
                <Button
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full bg-white px-6 text-black hover:bg-white/90 mt-2"
                >
                  <UploadIcon /> Upload image
                </Button>
              </div>
            )}
          </div>

          {previewUrl && (
            <Button
              onClick={() => inputRef.current?.click()}
              className="rounded-full border border-white/30 bg-transparent px-4 text-white/90 hover:bg-white/5 text-sm mt-3"
            >
              <UploadIcon className="h-4 w-4" /> Replace image
            </Button>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              <ImageOff className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>

        <div className="flex items-center justify-end border-t border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUploading || !hasChanges || status === "error"}
              className="flex items-center gap-2 cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isUploading ? "Uploading..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
