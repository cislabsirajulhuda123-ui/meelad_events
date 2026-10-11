"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Event, Result } from "@/lib/model";

export default function ResultPoster({
  event,
  categoryLabel,
  templateUrl = "/hi-zone-poster.jpg",
  uploadedPosterUrl,
}: {
  event: Event;
  categoryLabel?: string;
  templateUrl?: string;
  uploadedPosterUrl?: string;
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
  if (uploadedPosterUrl)
    return (
      <section className="result-poster uploaded-result-poster">
        <img src={uploadedPosterUrl} alt={`${event.name} result poster`} />
        <a
          className="btn"
          href={uploadedPosterUrl}
          download={`${event.name.replace(/[^a-z0-9]+/gi, "-")}-result.png`}
        >
          <Download size={16} /> Download Result Poster
        </a>
      </section>
    );
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
        canvas.height = Math.round(
          (1080 * img.naturalHeight) / img.naturalWidth,
        );
        const ctx = canvas.getContext("2d");
        if (!ctx)
          throw Error("Poster download is unavailable in this browser.");
        ctx.drawImage(img, 0, 0, 1080, canvas.height);
        // Uploaded drafts often contain a complete sample result. Put the live
        // result on one clean, template-coloured panel so none of that sample
        // copy can show through or collide with the real names.
        const customTemplate = templateUrl !== "/hi-zone-poster.jpg";
        const stampModel =
          customTemplate && img.naturalWidth / img.naturalHeight < 0.985;
        const corner = ctx.getImageData(35, 35, 1, 1).data;
        const greenModel =
          customTemplate &&
          !stampModel &&
          corner[1] > corner[0] * 1.35 &&
          corner[1] > corner[2] * 1.08;
        const headerX = customTemplate
          ? stampModel
            ? 220
            : greenModel
              ? 205
              : 430
          : 480;
        const headerY = customTemplate
          ? stampModel
            ? 330
            : greenModel
              ? 500
              : 430
          : 440;
        const textX = customTemplate
          ? stampModel
            ? 315
            : greenModel
              ? 300
              : 535
          : 582;
        const firstRowY = customTemplate
          ? stampModel
            ? 545
            : greenModel
              ? 675
              : 565
          : 580;
        const rowGap = customTemplate
          ? stampModel
            ? 84
            : greenModel
              ? 72
              : 79
          : 88;
        const cleanWithTemplateBackground = (
          x: number,
          y: number,
          width: number,
          height: number,
          sourceY = 330,
        ) => {
          ctx.save();
          ctx.filter = "blur(7px)";
          ctx.drawImage(
            img,
            x,
            sourceY,
            width,
            height,
            x - 5,
            y - 5,
            width + 10,
            height + 10,
          );
          ctx.restore();
        };
        const coloursForArea = (
          x: number,
          y: number,
          width: number,
          height: number,
        ) => {
          try {
            const pixels = ctx.getImageData(x, y, width, height).data;
            let light = 0;
            let samples = 0;
            for (let i = 0; i < pixels.length; i += 64) {
              light +=
                pixels[i] * 0.2126 +
                pixels[i + 1] * 0.7152 +
                pixels[i + 2] * 0.0722;
              samples++;
            }
            const average = light / Math.max(samples, 1);
            return average > 145
              ? { main: "#07120f", sub: "#173b32", accent: "#075f4c" }
              : { main: "#ffffff", sub: "#e8eeee", accent: "#91e2bd" };
          } catch {
            return { main: "#ffffff", sub: "#eeeeee", accent: "#91cd79" };
          }
        };
        if (customTemplate) {
          if (stampModel) {
            ctx.fillStyle = "#302d2b";
            ctx.beginPath();
            ctx.moveTo(220, 330);
            ctx.lineTo(850, 315);
            ctx.lineTo(868, 820);
            ctx.lineTo(218, 845);
            ctx.closePath();
            ctx.fill();
          } else if (greenModel) {
            // Rebuild the green model's text zone without adding a visible
            // card. This hides the baked-in sample result while preserving
            // the surrounding artwork and its original left alignment.
            const green = ctx.createLinearGradient(200, 480, 710, 850);
            green.addColorStop(0, "#0c5b4d");
            green.addColorStop(1, "#08483e");
            ctx.fillStyle = green;
            ctx.fillRect(200, 480, 510, 370);
          } else {
            ctx.fillStyle = "#111111";
            ctx.fillRect(430, 410, 455, 405);
          }
        } else {
          ctx.fillStyle = "#111111";
          ctx.fillRect(headerX, headerY, 550, 95);
        }
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
          ctx.textAlign = "center";
          if (customTemplate && greenModel) {
            ctx.fillStyle = "#0c594b";
            ctx.fillRect(205, 270, 205, 210);
            write(
              event.resultNumber.padStart(2, "0"),
              307,
              430,
              180,
              175,
              "#ffffff",
              700,
            );
            write("RESULT", 307, 465, 120, 22, "#e8c83e", 700);
          } else if (customTemplate) {
            const numberText = `RESULT #${event.resultNumber}`;
            ctx.font = "700 25px aguda, Arial, sans-serif";
            ctx.lineWidth = 6;
            ctx.lineJoin = "round";
            ctx.strokeStyle = "rgba(0,0,0,.78)";
            ctx.strokeText(numberText, 815, 144, 235);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(numberText, 815, 144, 235);
          } else {
            ctx.fillStyle = "rgba(10,10,10,.82)";
            ctx.fillRect(680, 105, 270, 58);
            write(
              `RESULT #${event.resultNumber}`,
              815,
              144,
              235,
              25,
              "#ffffff",
              700,
            );
          }
          ctx.textAlign = "left";
        }
        const headerColours = coloursForArea(
          headerX,
          headerY,
          customTemplate ? 600 : 550,
          95,
        );
        write(
          categoryLabel ||
            (event.zone === "HI_ZONE_INTER"
              ? "High School · Inter Campus"
              : "High School"),
          customTemplate ? (stampModel ? 275 : greenModel ? 300 : 535) : 495,
          customTemplate ? (stampModel ? 390 : greenModel ? 535 : 465) : 478,
          customTemplate ? (stampModel ? 520 : greenModel ? 380 : 315) : 510,
          21,
          headerColours.accent,
        );
        if (greenModel) {
          ctx.fillStyle = "#f1d12f";
          ctx.fillRect(215, 555, 485, 48);
        }
        write(
          event.name.toUpperCase(),
          customTemplate ? (stampModel ? 275 : greenModel ? 225 : 535) : 495,
          customTemplate ? (stampModel ? 435 : greenModel ? 590 : 505) : 514,
          customTemplate ? (stampModel ? 520 : greenModel ? 470 : 315) : 510,
          customTemplate && !stampModel ? 27 : 32,
          greenModel ? "#111111" : headerColours.main,
          700,
        );
        posterRows[page].forEach((r, i) => {
          const cy = firstRowY + i * rowGap;
          // If this rank was not awarded, cover its complete template slot,
          // including the baked-in rank marker. Do not show "Not announced".
          const coverX = r
            ? customTemplate
              ? 275
              : 570
            : customTemplate
              ? 205
              : 480;
          const coverWidth = r
            ? customTemplate
              ? 600
              : 465
            : customTemplate
              ? 670
              : 555;
          if (!customTemplate) {
            ctx.fillStyle = "#111111";
            ctx.fillRect(coverX, cy - 35, coverWidth, 65);
          }
          if (!r) return;
          const rowColours = coloursForArea(coverX, cy - 35, coverWidth, 65);
          ctx.textAlign = "left";
          if (customTemplate) {
            ctx.textAlign = "center";
            write(
              stampModel ? String(i + 1) : String(i + 1).padStart(2, "0"),
              stampModel ? 265 : greenModel ? 250 : 465,
              cy + 10,
              stampModel ? 40 : greenModel ? 45 : 55,
              stampModel ? 35 : greenModel ? 30 : 24,
              stampModel || greenModel ? "#ffffff" : "#f6d849",
              700,
            );
            ctx.textAlign = "left";
          }
          write(
            r.name.toUpperCase(),
            textX,
            cy,
            customTemplate ? (stampModel ? 500 : greenModel ? 390 : 330) : 438,
            26,
            rowColours.main,
            700,
          );
          write(
            "TEAM " + r.team.toUpperCase(),
            textX,
            cy + 22,
            customTemplate ? (stampModel ? 500 : greenModel ? 390 : 330) : 438,
            16,
            greenModel ? "#f1d12f" : rowColours.sub,
          );
        });
        if (posterRows.length > 1)
          write(
            `PAGE ${page + 1} / ${posterRows.length}`,
            customTemplate ? (stampModel ? 275 : 535) : 495,
            customTemplate ? (stampModel ? 800 : 790) : 828,
            customTemplate ? (stampModel ? 520 : 315) : 510,
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
