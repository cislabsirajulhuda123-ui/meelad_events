"use client";
import { useState } from "react";
import type { Festival } from "@/lib/model";

const logoKey = "image:/meelad-logo.webp";

export default function LogoUpload({
  data,
  change,
}: {
  data: Festival;
  change: (fn: (data: Festival) => Festival) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const value = data.content[logoKey] || "/meelad-logo.webp";

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
        body: JSON.stringify({ category: "site:logo", src }),
      });
      const json = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !json.url) throw Error(json.error || "Upload failed");
      change((d) => ({
        ...d,
        content: { ...d.content, [logoKey]: json.url! },
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
        <h3>Header logo</h3>
        <p>Used in the Admin header and public navigation bar.</p>
      </div>
      <img
        src={value}
        alt="Current header logo"
        style={{ width: 110, height: 110, objectFit: "contain" }}
      />
      {error && <p className="error">{error}</p>}
      <div className="button-row">
        <label className="btn outline small">
          {busy ? "Uploading…" : "Change logo"}
          <input
            hidden
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </label>
        {data.content[logoKey] && (
          <button
            type="button"
            className="btn danger small"
            onClick={() =>
              change((d) => ({
                ...d,
                content: { ...d.content, [logoKey]: "" },
              }))
            }
          >
            Use default logo
          </button>
        )}
      </div>
    </div>
  );
}
