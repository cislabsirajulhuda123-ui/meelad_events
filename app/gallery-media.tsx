"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type GalleryItem = { id: string; title: string; kind: string };

function useGalleryItems() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/gallery", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw Error();
        setItems((await r.json()).items);
      })
      .catch(() => setError("Gallery media could not load. Please refresh."));
  }, []);
  return { items, error };
}

export function HomeGalleryPreview({
  fallbackUrls,
}: {
  fallbackUrls: string[];
}) {
  const { items } = useGalleryItems();
  const photos = items.filter((item) => item.kind === "photo").slice(0, 4);
  return (
    <div className="gallery-grid home-latest-gallery">
      {photos.length
        ? photos.map((photo) => (
            <a href="/gallery" key={photo.id}>
              <img
                src={`/api/gallery/${photo.id}`}
                alt={photo.title}
                loading="lazy"
              />
            </a>
          ))
        : fallbackUrls.slice(0, 4).map((url, index) => (
            <a href="/gallery" key={url}>
              <img
                src={url}
                alt={`Festival moment ${index + 1}`}
                loading="lazy"
              />
            </a>
          ))}
    </div>
  );
}

export default function GalleryMedia() {
  const { items, error } = useGalleryItems();
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
