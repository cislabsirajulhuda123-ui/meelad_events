"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function GalleryMedia() {
  const [items, setItems] = useState<
    { id: string; title: string; kind: string }[]
  >([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/gallery")
      .then(async (r) => {
        if (!r.ok) throw Error();
        setItems((await r.json()).items);
      })
      .catch(() => setError("Gallery media could not load. Please refresh."));
  }, []);
  return (
    <>
      <div className="gallery-grid">
        {items.map((m) => (
          <figure className="gallery-item" key={m.id}>
            {m.kind === "photo" ? (
              <img
                src={"/api/gallery/" + m.id}
                alt={m.title}
                loading="lazy"
                style={{ width: "100%" }}
              />
            ) : (
              <video
                src={"/api/gallery/" + m.id}
                controls
                preload="metadata"
                style={{ width: "100%" }}
              />
            )}
            <figcaption>{m.title}</figcaption>
            <a
              className="btn outline small"
              href={`/api/gallery/${m.id}?download=1`}
              download
            >
              <Download size={15} />
              Download {m.kind === "photo" ? "Photo" : "Video"}
            </a>
          </figure>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
