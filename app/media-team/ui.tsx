"use client";
import { useEffect, useState } from "react";

type Media = { id: string; title: string; kind: "photo" | "video" };
export default function MediaPortal() {
  const [items, setItems] = useState<Media[]>([]),
    [title, setTitle] = useState(""),
    [kind, setKind] = useState<"photo" | "video">("photo"),
    [url, setUrl] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function load() {
    const r = await fetch("/api/gallery", { cache: "no-store" }),
      j = await r.json();
    if (r.ok) setItems(j.items || []);
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setMessage("");
    try {
      let src = url.trim();
      if (file) {
        if (file.size > 3 * 1024 * 1024)
          throw Error(
            "Large files: use a direct HTTPS media link. You can add unlimited gallery items.",
          );
        src = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(Error("Could not read file"));
          reader.readAsDataURL(file);
        });
      }
      if (!src) throw Error("Select a file or enter a direct media URL.");
      const r = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, kind, src }),
        }),
        j = await r.json();
      if (!r.ok) throw Error(j.error);
      setTitle("");
      setUrl("");
      setFile(null);
      form.reset();
      setMessage("Added to the public gallery.");
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function rename(item: Media) {
    const next = prompt("New caption", item.title)?.trim();
    if (!next || next === item.title) return;
    setBusy(true);
    const r = await fetch("/api/gallery/" + item.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: next }),
      }),
      j = await r.json();
    setMessage(r.ok ? "Caption updated." : j.error);
    await load();
    setBusy(false);
  }
  async function remove(item: Media) {
    if (!confirm("Delete “" + item.title + "” from gallery?")) return;
    setBusy(true);
    const r = await fetch("/api/gallery/" + item.id, { method: "DELETE" }),
      j = await r.json();
    setMessage(r.ok ? "Media deleted." : j.error);
    await load();
    setBusy(false);
  }
  return (
    <main className="container page">
      <div className="split">
        <h1>Media Team</h1>
        <form action="/api/admin/logout" method="post">
          <button className="btn outline">Sign out</button>
        </form>
      </div>
      <p>
        Full gallery control: add, rename and delete photos or videos. There is
        no limit on the number of gallery items.
      </p>
      <form className="card auth-form" onSubmit={save}>
        <fieldset disabled={busy}>
          <label>
            Caption
            <input
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Media type
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as "photo" | "video")}
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label>
            Upload file
            <input
              type="file"
              accept={
                kind === "photo"
                  ? "image/png,image/jpeg,image/webp,image/gif"
                  : "video/mp4,video/webm"
              }
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <label>
            Or direct HTTPS photo/video URL
            <input
              type="url"
              value={url}
              disabled={!!file}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
          </label>
          <p>
            Large photos or videos: use a direct HTTPS link. Any number of items
            can be added.
          </p>
          <button className="btn">
            {busy ? "Working…" : "Add to gallery"}
          </button>
        </fieldset>
      </form>
      {message && <p role="status">{message}</p>}
      <div className="split">
        <h2>Gallery items ({items.length})</h2>
        <a href="/gallery" target="_blank">
          View public gallery
        </a>
      </div>
      <div className="gallery-grid">
        {items.map((item) => (
          <figure className="card" key={item.id}>
            {item.kind === "photo" ? (
              <img
                src={"/api/gallery/" + item.id}
                alt={item.title}
                loading="lazy"
              />
            ) : (
              <video
                src={"/api/gallery/" + item.id}
                controls
                preload="metadata"
              />
            )}
            <figcaption>{item.title}</figcaption>
            <div className="button-row">
              <button
                className="btn outline small"
                disabled={busy}
                onClick={() => rename(item)}
              >
                Edit caption
              </button>
              <button
                className="btn outline small danger"
                disabled={busy}
                onClick={() => remove(item)}
              >
                Delete
              </button>
            </div>
          </figure>
        ))}
      </div>
      {!items.length && <p>No gallery items yet.</p>}
    </main>
  );
}
