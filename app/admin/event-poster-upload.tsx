"use client";
import { useState } from "react";
import type { Festival } from "@/lib/model";

export default function EventPosterUpload({
  eventId,
  data,
  change,
}: {
  eventId: string;
  data: Festival;
  change: (fn: (data: Festival) => Festival) => void;
}) {
  const key = `event-poster:${eventId}`;
  const value = data.content[key] || "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 3_000_000) {
      setError("Choose an image under 3 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(Error("Could not read image"));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/poster-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: `event:${eventId}`, src }),
      });
      const json = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !json.url) throw Error(json.error || "Upload failed");
      change((d) => ({
        ...d,
        content: { ...d.content, [key]: json.url! },
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card event-poster-upload">
      <div>
        <h3>Separate poster for this result</h3>
        <p>
          Optional. Uploading this hides the automatic poster. Press Save
          changes after upload.
        </p>
      </div>
      {value && <img src={value} alt="Uploaded result poster" />}
      {error && <p className="error">{error}</p>}
      <div className="button-row">
        <label className="btn outline small">
          {busy ? "Uploading…" : value ? "Change poster" : "Upload poster"}
          <input
            hidden
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </label>
        {value && (
          <button
            type="button"
            className="btn danger small"
            onClick={() =>
              change((d) => ({
                ...d,
                content: { ...d.content, [key]: "" },
              }))
            }
          >
            Remove uploaded poster
          </button>
        )}
      </div>
    </div>
  );
}
