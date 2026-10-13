"use client";

import { useEffect, useState } from "react";
import type { Festival } from "@/lib/model";

type GalleryItem = { id: string; title: string; kind: string };

export default function ShareEditor({
  data,
  change,
}: {
  data: Festival;
  change: (fn: (data: Festival) => Festival) => void;
}) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  useEffect(() => {
    fetch("/api/gallery", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => setGallery(result.items || []))
      .catch(() => setGallery([]));
  }, []);
  const setText = (key: string, value: string) =>
    change((current) => ({
      ...current,
      content: { ...current.content, [key]: value },
    }));
  return (
    <section className="card admin-section">
      <h2>Share messages</h2>
      <p>
        Default message എല്ലാത്തിനും ഉപയോഗിക്കും. ഒരു item-ന് separate message
        നൽകിയാൽ അതിന് default-ന് പകരം ആ message share ചെയ്യും.
      </p>
      <div className="grid2 share-default-grid">
        <label>
          Default result share text
          <textarea
            rows={4}
            placeholder="Check out this result from Meelad Kunduthode."
            value={data.content["share:result-default"] || ""}
            onChange={(event) =>
              setText("share:result-default", event.target.value)
            }
          />
        </label>
        <label>
          Default gallery share text
          <textarea
            rows={4}
            placeholder="View this moment from Meelad Kunduthode."
            value={data.content["share:gallery-default"] || ""}
            onChange={(event) =>
              setText("share:gallery-default", event.target.value)
            }
          />
        </label>
      </div>
      <h3>Separate result messages</h3>
      <div className="share-message-list">
        {data.events
          .filter((event) => event.published)
          .map((event) => (
            <label className="card" key={event.id}>
              {event.name}
              <textarea
                rows={3}
                placeholder="Leave empty to use default result text"
                value={data.content[`share:result:${event.id}`] || ""}
                onChange={(input) =>
                  setText(`share:result:${event.id}`, input.target.value)
                }
              />
            </label>
          ))}
      </div>
      <h3>Separate gallery messages</h3>
      <div className="share-message-list">
        {gallery.map((item) => (
          <label className="card" key={item.id}>
            {item.title} · {item.kind}
            <textarea
              rows={3}
              placeholder="Leave empty to use default gallery text"
              value={data.content[`share:gallery:${item.id}`] || ""}
              onChange={(input) =>
                setText(`share:gallery:${item.id}`, input.target.value)
              }
            />
          </label>
        ))}
        {!gallery.length && <p className="muted">No gallery items found.</p>}
      </div>
    </section>
  );
}
