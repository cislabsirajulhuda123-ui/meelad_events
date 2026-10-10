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
            Array.from(
              { length: 3 },
              (_, position) => rows[page * 3 + position] || null,
            ),
          );
      for (let page = 0; page < posterRows.length; page++) {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d");
        if (!ctx)
          throw Error("Poster download is unavailable in this browser.");
        ctx.drawImage(img, 0, 0, 1080, 1080);
        // Cover only the sample words. The template's existing 1/2/3 artwork
        // stays visible and becomes the rank marker for the generated result.
        const customTemplate = templateUrl !== "/hi-zone-poster.jpg";
        const headerX = customTemplate ? 275 : 480;
        const headerY = customTemplate ? 520 : 440;
        const textX = customTemplate ? 300 : 582;
        const firstRowY = customTemplate ? 655 : 580;
        const rowGap = customTemplate ? 75 : 88;
        ctx.fillStyle = customTemplate ? "rgba(10,20,18,.88)" : "#111111";
        ctx.fillRect(headerX, headerY, customTemplate ? 600 : 550, 95);
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
        if (event.resultNumber) {
          ctx.fillStyle = "rgba(10,10,10,.82)";
          ctx.fillRect(680, 105, 270, 58);
          ctx.textAlign = "center";
          write(
            `RESULT #${event.resultNumber}`,
            815,
            144,
            235,
            25,
            "#ffffff",
            700,
          );
          ctx.textAlign = "left";
        }
        write(
          categoryLabel ||
            (event.zone === "HI_ZONE_INTER"
              ? "High School · Inter Campus"
              : "High School"),
          customTemplate ? 300 : 495,
          customTemplate ? 552 : 478,
          customTemplate ? 550 : 510,
          21,
          "#91cd79",
        );
        write(
          event.name.toUpperCase(),
          customTemplate ? 300 : 495,
          customTemplate ? 592 : 514,
          customTemplate ? 550 : 510,
          32,
          "#2fa58f",
          700,
        );
        posterRows[page].forEach((r, i) => {
          const cy = firstRowY + i * rowGap;
          // If this rank was not awarded, cover its complete template slot,
          // including the baked-in rank marker. Do not show "Not announced".
          ctx.fillStyle = customTemplate ? "rgba(10,20,18,.94)" : "#111111";
          ctx.fillRect(
            r ? (customTemplate ? 275 : 570) : customTemplate ? 205 : 480,
            cy - 35,
            r ? (customTemplate ? 600 : 465) : customTemplate ? 670 : 555,
            65,
          );
          if (!r) return;
          ctx.textAlign = "left";
          write(
            r.name.toUpperCase(),
            textX,
            cy,
            customTemplate ? 550 : 438,
            26,
            "#ffffff",
            700,
          );
          write(
            "TEAM " + r.team.toUpperCase(),
            textX,
            cy + 22,
            customTemplate ? 550 : 438,
            16,
            "#eeeeee",
          );
        });
        if (posterRows.length > 1)
          write(
            `PAGE ${page + 1} / ${posterRows.length}`,
            customTemplate ? 300 : 495,
            customTemplate ? 875 : 828,
            customTemplate ? 550 : 510,
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
