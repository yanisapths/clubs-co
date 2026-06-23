import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/design-system/components/button";
import { UploadIcon, X, ImageOff, Loader2 } from "lucide-react";
import { uploadFile } from "@/features/studio/api/file";
import { getStoredToken } from "@/lib/storage";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg";
const TEMP_DEST_PATH = "club/temp";
const MAX_IMAGES = 20; // mirrors backend MaxGalleryImages

export interface ExistingGalleryImage {
  url: string;
}

interface AddGalleryModalProps {
  existingImages: ExistingGalleryImage[];
  onSave: (result: {
    tempUrlsToAdd: string[];
    existingUrlsToRemove: string[];
  }) => void;
  onClose: () => void;
}

type ImageStatus = "uploading" | "uploaded" | "error";

interface NewGalleryFile {
  id: string;
  file: File;
  previewUrl: string;
  status: ImageStatus;
  tempUrl?: string;
  errorMessage?: string;
}

interface ExistingGalleryItem {
  url: string;
  markedForRemoval: boolean;
}

export function AddGalleryModal({
  existingImages,
  onSave,
  onClose,
}: AddGalleryModalProps) {
  const [newFiles, setNewFiles] = useState<NewGalleryFile[]>([]);
  const [existingItems, setExistingItems] = useState<ExistingGalleryItem[]>(
    () =>
      existingImages.map((img) => ({ url: img.url, markedForRemoval: false })),
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      newFiles.forEach((g) => URL.revokeObjectURL(g.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleExistingCount = existingItems.filter(
    (i) => !i.markedForRemoval,
  ).length;
  const totalCount = visibleExistingCount + newFiles.length;

  const uploadOne = useCallback(async (galleryFile: NewGalleryFile) => {
    const token = getStoredToken();
    if (!token) {
      setNewFiles((prev) =>
        prev.map((g) =>
          g.id === galleryFile.id
            ? { ...g, status: "error", errorMessage: "Not signed in." }
            : g,
        ),
      );
      return;
    }

    try {
      const ext = galleryFile.file.name.split(".").pop() || "jpg";
      // Temp filename just needs to be unique long enough to survive until
      // promotion; the permanent, convention-following name is generated
      // server-side in MoveObject/GalleryFilename at save time.
      const tempFilename = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const result = await uploadFile(
        token,
        galleryFile.file,
        tempFilename,
        TEMP_DEST_PATH,
      );

      setNewFiles((prev) =>
        prev.map((g) =>
          g.id === galleryFile.id
            ? { ...g, status: "uploaded", tempUrl: result.url }
            : g,
        ),
      );
    } catch (err) {
      setNewFiles((prev) =>
        prev.map((g) =>
          g.id === galleryFile.id
            ? {
                ...g,
                status: "error",
                errorMessage:
                  err instanceof Error ? err.message : "Upload failed.",
              }
            : g,
        ),
      );
    }
  }, []);

  const validateAndAddFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      const accepted: NewGalleryFile[] = [];
      const rejectedReasons: string[] = [];

      const remainingSlots = MAX_IMAGES - totalCount;
      if (remainingSlots <= 0) {
        setError(`You can have up to ${MAX_IMAGES} gallery images.`);
        return;
      }

      for (const file of incoming) {
        if (accepted.length >= remainingSlots) {
          rejectedReasons.push(
            `Only ${remainingSlots} more image${
              remainingSlots === 1 ? "" : "s"
            } can be added (max ${MAX_IMAGES}).`,
          );
          break;
        }

        const isAcceptedType =
          ACCEPTED_TYPES.includes(file.type) ||
          /\.(png|jpe?g)$/i.test(file.name);

        if (!isAcceptedType) {
          rejectedReasons.push(`"${file.name}" isn't a PNG or JPG file.`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          rejectedReasons.push(
            `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(
              1,
            )}MB, which is over the 2MB limit.`,
          );
          continue;
        }

        accepted.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
            .toString(36)
            .slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: "uploading",
        });
      }

      setError(rejectedReasons.length > 0 ? rejectedReasons.join(" ") : null);

      if (accepted.length > 0) {
        setNewFiles((prev) => [...prev, ...accepted]);
        // Fire uploads to club/temp immediately, per file, in parallel —
        // per the spec this happens on select, not on the page-level Save.
        accepted.forEach((g) => uploadOne(g));
      }
    },
    [totalCount, uploadOne],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveNew = (id: string) => {
    setNewFiles((prev) => {
      const target = prev.find((g) => g.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((g) => g.id !== id);
    });
  };

  const handleRetry = (id: string) => {
    const target = newFiles.find((g) => g.id === id);
    if (!target) return;
    setNewFiles((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "uploading" } : g)),
    );
    uploadOne({ ...target, status: "uploading" });
  };

  // Existing images aren't deleted from GCS here — only marked, per the
  // "delete on final Save" decision. The parent applies this on its next
  // successful patch by sending existingUrlsToRemove.
  const toggleExistingRemoval = (url: string) => {
    setExistingItems((prev) =>
      prev.map((item) =>
        item.url === url
          ? { ...item, markedForRemoval: !item.markedForRemoval }
          : item,
      ),
    );
  };

  const handleSave = () => {
    const stillUploading = newFiles.some((g) => g.status === "uploading");
    if (stillUploading) return; // Save button is disabled in this state anyway

    const tempUrlsToAdd = newFiles
      .filter((g) => g.status === "uploaded" && g.tempUrl)
      .map((g) => g.tempUrl as string);

    const existingUrlsToRemove = existingItems
      .filter((i) => i.markedForRemoval)
      .map((i) => i.url);

    onSave({ tempUrlsToAdd, existingUrlsToRemove });
    onClose();
  };

  const isUploading = newFiles.some((g) => g.status === "uploading");
  const hasAnyImages = totalCount > 0 || existingItems.length > 0;
  const hasErrors = newFiles.some((g) => g.status === "error");

  return (
    <div
      className="fixed h-full inset-0 z-50 flex items-center justify-center px-4 place-content-center"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[900px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.95)",
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-white">Galleries</h2>
            <p className="text-sm text-white/50 mt-0.5">
              PNG or JPG, up to 2MB per file. Changes save when you click Save
              below.
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
          {!hasAnyImages ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col gap-3 rounded-xl border border-dashed py-14 justify-center items-center transition-colors ${
                isDragging ? "border-white/50 bg-white/5" : "border-white/15"
              }`}
            >
              <div className="flex flex-col justify-center items-center gap-1 text-center">
                <p className="text-white/80 font-medium">Empty Gallery</p>
                <p className="text-white/60">
                  Upload images to showcase club gallery
                </p>
                <p className="text-white/40 text-sm mt-1">
                  PNG or JPG, up to 2MB per file
                </p>
              </div>
              <Button
                onClick={() => inputRef.current?.click()}
                className="rounded-full bg-white px-6 text-black hover:bg-white/90 mt-2"
              >
                <UploadIcon /> Upload image
              </Button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-xl ${isDragging ? "ring-2 ring-white/40" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-sm">
                  {totalCount} of {MAX_IMAGES} images
                </p>
                <Button
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full border border-white/30 bg-transparent px-4 text-white/90 hover:bg-white/5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <UploadIcon className="h-4 w-4" /> Add more
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {existingItems.map((item) => (
                  <div
                    key={item.url}
                    className={`group relative aspect-video overflow-hidden rounded-xl border transition-opacity ${
                      item.markedForRemoval
                        ? "border-red-500/50 opacity-40"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt="Gallery image"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {item.markedForRemoval && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="text-[11px] text-red-300 font-medium">
                          Will be removed
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleExistingRemoval(item.url)}
                      aria-label={
                        item.markedForRemoval
                          ? "Keep this image"
                          : "Remove this image"
                      }
                      className="absolute top-2 right-2 cursor-pointer rounded-full bg-black/70 p-1.5 text-white/90 opacity-0 transition-opacity hover:bg-black/90 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {newFiles.map((g) => (
                  <div
                    key={g.id}
                    className={`group relative aspect-video overflow-hidden rounded-xl border ${
                      g.status === "error"
                        ? "border-red-500/50"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={g.previewUrl}
                      alt={g.file.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    {g.status === "uploading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Loader2 className="h-5 w-5 animate-spin text-white/90" />
                      </div>
                    )}

                    {g.status === "error" && (
                      <button
                        type="button"
                        onClick={() => handleRetry(g.id)}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 px-2 text-center"
                      >
                        <ImageOff className="h-4 w-4 text-red-300" />
                        <span className="text-[11px] text-red-300 underline">
                          Failed — tap to retry
                        </span>
                      </button>
                    )}

                    {g.status !== "uploading" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNew(g.id)}
                        aria-label={`Remove ${g.file.name}`}
                        className="absolute top-2 right-2 cursor-pointer rounded-full bg-black/70 p-1.5 text-white/90 opacity-0 transition-opacity hover:bg-black/90 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {g.status === "uploaded" && (
                      <div className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4 text-[11px] text-white/80">
                        {g.file.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
            multiple
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
              disabled={
                isUploading ||
                (hasErrors && newFiles.every((g) => g.status !== "uploaded"))
              }
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
