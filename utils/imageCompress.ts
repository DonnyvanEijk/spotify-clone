// Turn an image File into a compressed data-URI so it can be stored inline in
// a message (no object storage). Images are downscaled and re-encoded to keep
// them small enough to live in a DB row and travel over Realtime.

const PREFIX = "data:image/";

export function isImageDataUrl(value: string | null | undefined): value is string {
  return !!value && value.startsWith(PREFIX);
}

export async function fileToCompressedDataUrl(
  file: File,
  maxDim = 1024,
  quality = 0.8
): Promise<string> {
  const originalUrl = await readAsDataUrl(file);
  const img = await loadImage(originalUrl);

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return originalUrl;
  ctx.drawImage(img, 0, 0, width, height);

  // Prefer WebP for size; fall back to JPEG if the browser can't encode it.
  const webp = canvas.toDataURL("image/webp", quality);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", quality);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
