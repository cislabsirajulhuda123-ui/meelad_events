"use client";
import { useState } from "react";
import type { Festival } from "@/lib/model";
import { posterCategories, posterContentKey } from "@/lib/poster";

export default function PosterEditor({
  data,
  change,
}: {
  data: Festival;
  change: (fn: (data: Festival) => Festival) => void;
}) {
  const [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  async function upload(category: string, file?: File) {
    if (!file) return;
    setError("");
    if (file.size > 3_000_000) {
      setError("Choose an image under 3 MB.");
      return;
    }
    setBusy(category);
    try {
      const src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(Error("Could not read image"));
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/poster-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, src }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw Error(json.error || "Upload failed");
      change((d) => ({
        ...d,
        content: { ...d.content, [posterContentKey(category)]: json.url! },
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="card admin-section">
      <h2>Result poster drafts</h2>
      <p>
        Upload a separate blank poster design for each category. Use a 1080 ×
        1080 PNG, JPG or WEBP under 3 MB. After upload, press{" "}
        <strong>Save changes</strong>.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="grid2">
        {posterCategories.map(({ key, label }) => {
          const value =
            data.content[posterContentKey(key)] || "/hi-zone-poster.jpg";
          return (
            <article className="card" key={key}>
              <h3>{label}</h3>
              <img
                src={value}
                alt={`${label} poster draft`}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
              <label className="btn outline" style={{ marginTop: 12 }}>
                {busy === key ? "Uploading…" : "Change poster draft"}
                <input
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={!!busy}
                  onChange={(e) => void upload(key, e.target.files?.[0])}
                />
              </label>
              {value !== "/hi-zone-poster.jpg" && (
                <button
                  className="btn outline"
                  style={{ marginTop: 8 }}
                  onClick={() =>
                    change((d) => ({
                      ...d,
                      content: { ...d.content, [posterContentKey(key)]: "" },
                    }))
                  }
                >
                  Use default poster
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
