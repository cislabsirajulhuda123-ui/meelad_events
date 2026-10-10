"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Event, Result } from "@/lib/model";

export default function ResultPoster({
  event,
  categoryLabel,
  templateUrl = "/hi-zone-poster.jpg",
}: {
  event: Event;
  categoryLabel?: string;
  templateUrl?: string;
}) {
  const [pages, setPages] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const snapshot = JSON.stringify(event.publishedResults);
  useEffect(() => {
    setPages([]);
    setError("");
  }, [event.id, event.name, event.type, categoryLabel, templateUrl, snapshot]);
  if (!event.published || event.zone === "GENERAL") return null;
  async function generate() {
    setBusy(true);
    setError("");
    try {
      const rows = [...event.publishedResults]
        .filter((r) => r.rank >= 1 && r.rank <= 3)
        .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
      if (!rows.length)
        throw Error("Publish results with ranks 1, 2 or 3 to create a poster.");
      const img = new Image();
      img.src = templateUrl;
      await img.decode();
      await Promise.all([
        document.fonts.load("700 28px aguda"),
        document.fonts.load("400 20px aguda"),
      ]);
      const output: string[] = [];
      const isGroup = event.type !== "Individual";
      // Each group poster has one member at each podium position. Rotate members
      // across posters so all entered team members appear, including tied teams.
      const ranked = [1, 2, 3].map((rank) =>
        rows.filter((r) => r.rank === rank),
      );
      const posterRows: (Result | null)[][] = isGroup
        ? Array.from(
            { length: Math.max(...ranked.map((r) => r.length)) },
            (_, page) =>
              ranked.map((r) => (r.length ? r[page % r.length] : null)),
          )
        : Array.from({ length: Math.ceil(rows.length / 3) }, (_, page) =>
            rows.slice(page * 3, page * 3 + 3),
          );
      for (let page = 0; page < posterRows.length; page++) {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d");
        if (!ctx)
          throw Error("Poster download is unavailable in this browser.");
        ctx.drawImage(img, 0, 0, 1080, 1080);
        // Replace only the sample result area; preserve the supplied artwork and logos.
        ctx.fillStyle = "#111111";
        ctx.fillRect(480, 440, 560, 405);
        const write = (
          value: string,
          x: number,
          y: number,
          width: number,
          size: number,
          color: string,
          weight = 400,
        ) => {
          ctx.fillStyle = color;
          let fontSize = size;
          ctx.font = `${weight} ${fontSize}px aguda, Arial, sans-serif`;
          while (ctx.measureText(value).width > width && fontSize > 14) {
            fontSize--;
            ctx.font = `${weight} ${fontSize}px aguda, Arial, sans-serif`;
          }
          ctx.fillText(value, x, y, width);
        };
        write(
          categoryLabel ||
            (event.zone === "HI_ZONE_INTER"
              ? "High School · Inter Campus"
              : "High School"),
          495,
          478,
          510,
          21,
          "#91cd79",
        );
        write(event.name.toUpperCase(), 495, 514, 510, 32, "#2fa58f", 700);
        posterRows[page].forEach((r, i) => {
          const cy = 581 + i * 88;
          const gradient = ctx.createLinearGradient(495, cy - 30, 555, cy + 30);
          gradient.addColorStop(0, "#8bd34f");
          gradient.addColorStop(1, "#20a18e");
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.arc(526, cy, 29, 0, Math.PI * 2);
          ctx.stroke();
          ctx.textAlign = "center";
          write(
            ["1st", "2nd", "3rd"][(r?.rank || i + 1) - 1],
            526,
            cy + 9,
            48,
            23,
            "#ffffff",
            700,
          );
          ctx.textAlign = "left";
          write(
            r ? r.name.toUpperCase() : "NOT ANNOUNCED",
            582,
            cy - 1,
            438,
            26,
            "#ffffff",
            700,
          );
          write(
            r ? "TEAM " + r.team.toUpperCase() : "",
            582,
            cy + 20,
            438,
            16,
            "#eeeeee",
          );
        });
        if (posterRows.length > 1)
          write(
            `PAGE ${page + 1} / ${posterRows.length}`,
            495,
            828,
            510,
            14,
            "#aaaaaa",
          );
        output.push(canvas.toDataURL("image/png"));
      }
      setPages(output);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not create the poster. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="result-poster"
      aria-label={`${categoryLabel || "Category"} result poster`}
    >
      <button className="btn outline" disabled={busy} onClick={generate}>
        <Download size={16} />
        {busy
          ? "Preparing poster…"
          : pages.length
            ? "Regenerate result poster"
            : "Download Result Poster"}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {pages.length > 0 && (
        <div className="grid2" style={{ marginTop: 20 }}>
          {pages.map((url, i) => (
            <div key={i} className="card">
              <img
                src={url}
                alt={`${event.name} result poster, page ${i + 1}`}
                style={{ width: "100%", height: "auto" }}
              />
              <a
                className="btn"
                style={{ marginTop: 12 }}
                href={url}
                download={`${event.name.replace(/[^a-z0-9]+/gi, "-")}-result-${i + 1}.png`}
              >
                Download PNG{pages.length > 1 ? ` · Page ${i + 1}` : ""}
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
