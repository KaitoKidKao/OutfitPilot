/** Downscale an uploaded photo so it fits comfortably in localStorage. */
export async function fileToDataUrl(file: File, max = 720): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("not-image");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function validateUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
    return null;
  } catch {
    return "That link doesn't look complete. Paste the full address starting with https:// · Link chưa đúng, hãy dán đầy đủ địa chỉ.";
  }
}

export function hostOf(url?: string) {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
