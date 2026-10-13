"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export default function ShareButton({
  title,
  text,
  url,
  fileUrl,
  fileName,
  className = "btn outline small",
}: {
  title: string;
  text: string;
  url?: string;
  fileUrl?: string;
  fileName?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const shareUrl = url
      ? new URL(url, window.location.origin).toString()
      : window.location.href;
    try {
      if (fileUrl && navigator.share && navigator.canShare) {
        try {
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const extension = blob.type.includes("video") ? "mp4" : "png";
          const file = new File(
            [blob],
            fileName || `meelad-share.${extension}`,
            { type: blob.type || "application/octet-stream" },
          );
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ title, text, files: [file] });
            return;
          }
        } catch (error) {
          if ((error as DOMException).name === "AbortError") return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        await navigator.clipboard.writeText(`${text}\n${shareUrl}`.trim());
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    }
  }
  return (
    <button type="button" className={className} onClick={share}>
      <Share2 size={15} /> {copied ? "Copied" : "Share"}
    </button>
  );
}
