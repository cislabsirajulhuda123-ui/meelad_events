"use client";
import { useEffect, useState } from "react";
import type { Festival } from "@/lib/model";

const homeTexts = [
  "2027 · KUNDUTHODE",
  "ORGANIZING SCHOOL NAME",
  "SCROLL TO DISCOVER ↓",
  "View Live Leaderboard",
  "Student Portal",
  "Event Results",
  " TEAMS · 4 CATEGORIES · ",
  " EVENTS",
  "DECIMAL VOICES | ",
  "THE NEXT DECIMAL",
  "The universe operates on absolute cosmic precision, not approximations. From galactic orbits to cellular differentiation, everything is controlled by microscopic measurements. Discover why the truth resides not in “rounding off” realities, but in the epistemic curiosity to search for the next decimal.",
  "[0.004] Read Full Concept ",
  "COSMIC PRECISION",
  "0.000000001…",
  "“Truth resides not in approximations, but in precision. Scroll less. Measure more.”",
  "DECIMAL VOICES 2026",
  "DISCOVER THE OFFICIAL ",
  "FESTIVAL BROCHURE",
  "Explore the official Cognizium 2026 digital brochure to discover the full Decimal Voices theme.",
  "[0.005] READ FULL BROCHURE ",
  "FESTIVAL ",
  "CATEGORIES & STAGES",
  "Events for High School, Upper Primary, Lower Primary and Kids, with published results and team standings.",
  "HIGH SCHOOL",
  "MAIN STAGE",
  "High School",
  "Main stage featuring premier fine arts, oil painting, water color impressionism, and flagship solo competitions.",
  "Main Auditorium & Studio A",
  "LOWER PRIMARY",
  "EXHIBITION HALL",
  "Lower Primary",
  "Dedicated arena for charcoal portraiture, clay modeling, graphic design, and expressive sketching events.",
  "Exhibition Hall 2 & Studio B",
  "UPPER PRIMARY",
  "AMPHITHEATRE",
  "Upper Primary",
  "Specialized stage featuring regional teams in high-energy contests.",
  "Open Air Amphitheatre",
  "KIDS",
  "KIDS CATEGORY",
  "Kids",
  "Competitions and published results for the Kids category.",
  "See individual events",
  "CHAMPIONSHIP ",
  "LEADERBOARD",
  "[0.006] Open Full Leaderboard ",
  "GALLERY & ",
  "HIGHLIGHTS",
  "Capturing unforgettable moments of artistic brilliance and stage performances.",
  "View all highlights →",
  "Check your results",
] as const;

export default function HomeEditor({
  data,
  change,
}: {
  data: Festival;
  change: (fn: (data: Festival) => Festival) => void;
}) {
  const [selected, setSelected] = useState("");
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.data?.type === "home-visual-edit" &&
        typeof event.data.key === "string"
      )
        setSelected(event.data.key);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  const setText = (key: string, value: string) =>
    change((d) => ({ ...d, content: { ...d.content, [key]: value } }));
  const resetValue = (key: string) =>
    change((d) => {
      const content = { ...d.content };
      delete content[key];
      return { ...d, content };
    });
  return (
    <section className="card admin-section">
      <h2>Home page editor</h2>
      <p>
        Edit the navbar, hero section, buttons, category cards, leaderboard,
        gallery and footer content. Press <strong>Save changes</strong> when
        finished.
      </p>
      <h3>Visual home editor</h3>
      <p>Preview-ൽ മാറ്റേണ്ട text അല്ലെങ്കിൽ image click ചെയ്യുക.</p>
      <div className="visual-home-editor">
        <iframe title="Home page visual editor" src="/?visualEdit=1" />
      </div>
      {selected && (
        <div className="card visual-selected-editor">
          <div className="split">
            <h3>Edit selected item</h3>
            <button
              className="btn outline small"
              onClick={() => setSelected("")}
            >
              Close
            </button>
          </div>
          <small>{selected}</small>
          <textarea
            rows={selected.length > 100 ? 5 : 2}
            value={
              data.content[selected] ??
              (selected.startsWith("image:") ? selected.slice(6) : selected)
            }
            onChange={(e) => setText(selected, e.target.value)}
          />
          {!selected.startsWith("image:") && (
            <div className="button-row visual-colour-row">
              <label>
                Text colour
                <input
                  type="color"
                  value={data.content[`color:${selected}`] || "#ffffff"}
                  onChange={(e) => setText(`color:${selected}`, e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn outline small"
                onClick={() => resetValue(`color:${selected}`)}
              >
                Reset colour
              </button>
            </div>
          )}
          <div className="visual-position-grid">
            <label>
              Left / Right (X)
              <input
                type="number"
                value={data.content[`position-x:${selected}`] || "0"}
                onChange={(e) =>
                  setText(`position-x:${selected}`, e.target.value)
                }
              />
            </label>
            <label>
              Up / Down (Y)
              <input
                type="number"
                value={data.content[`position-y:${selected}`] || "0"}
                onChange={(e) =>
                  setText(`position-y:${selected}`, e.target.value)
                }
              />
            </label>
          </div>
          <small>
            X: positive = right, negative = left. Y: positive = down, negative =
            up.
          </small>
          <div className="button-row">
            <button
              type="button"
              className="btn outline small"
              onClick={() => {
                resetValue(`position-x:${selected}`);
                resetValue(`position-y:${selected}`);
              }}
            >
              Reset position
            </button>
            {data.content[`hidden:${selected}`] === "1" ? (
              <button
                type="button"
                className="btn small"
                onClick={() => resetValue(`hidden:${selected}`)}
              >
                Restore item
              </button>
            ) : (
              <button
                type="button"
                className="btn danger small"
                onClick={() => setText(`hidden:${selected}`, "1")}
              >
                Delete / Hide item
              </button>
            )}
          </div>
          <p>മാറ്റം പൂർത്തിയായാൽ മുകളിലെ Save changes അമർത്തുക.</p>
        </div>
      )}

      <h3>Website identity & hero</h3>
      <div className="form-grid">
        {Object.entries({
          name: "Website name",
          subtitle: "Main hero heading",
          theme: "Festival theme",
          venue: "Venue",
          email: "Contact email",
          sourceNote: "Footer note",
        }).map(([key, label]) => (
          <label key={key}>
            {label}
            <textarea
              rows={2}
              value={data.settings[key as keyof Festival["settings"]]}
              onChange={(e) =>
                change((d) => ({
                  ...d,
                  settings: { ...d.settings, [key]: e.target.value },
                }))
              }
            />
          </label>
        ))}
        <label>
          Website logo URL
          <input
            value={
              data.content["image:/meelad-logo.webp"] || "/meelad-logo.webp"
            }
            onChange={(e) => setText("image:/meelad-logo.webp", e.target.value)}
          />
        </label>
        <label>
          Home background video URL
          <input
            value={data.content["video:home-hero"] || ""}
            placeholder="https://example.com/background.mp4"
            onChange={(e) => setText("video:home-hero", e.target.value)}
          />
          <small>
            Use a direct HTTPS MP4 or WEBM link. Leave empty to use the built-in
            animated background.
          </small>
        </label>
        <label>
          Brochure HTTPS link
          <input
            value={data.settings.brochureUrl}
            onChange={(e) =>
              change((d) => ({
                ...d,
                settings: { ...d.settings, brochureUrl: e.target.value },
              }))
            }
          />
        </label>
      </div>

      <h3>Navigation bar</h3>
      {data.navigation.map((item, index) => (
        <div className="card" key={index}>
          <div className="form-grid">
            <label>
              Menu name
              <input
                value={item.label}
                onChange={(e) =>
                  change((d) => ({
                    ...d,
                    navigation: d.navigation.map((n, i) =>
                      i === index ? { ...n, label: e.target.value } : n,
                    ),
                  }))
                }
              />
            </label>
            <label>
              Link
              <input
                value={item.href}
                onChange={(e) =>
                  change((d) => ({
                    ...d,
                    navigation: d.navigation.map((n, i) =>
                      i === index ? { ...n, href: e.target.value } : n,
                    ),
                  }))
                }
              />
            </label>
          </div>
          <label>
            <input
              type="checkbox"
              style={{ width: 20 }}
              checked={item.visible}
              onChange={(e) =>
                change((d) => ({
                  ...d,
                  navigation: d.navigation.map((n, i) =>
                    i === index ? { ...n, visible: e.target.checked } : n,
                  ),
                }))
              }
            />{" "}
            Show in navbar
          </label>
        </div>
      ))}

      <h3>Home page text</h3>
      <div className="form-grid">
        {homeTexts.map((key) => (
          <label key={key}>
            <small>Current text</small>
            <span style={{ display: "block", overflowWrap: "anywhere" }}>
              {key}
            </span>
            <textarea
              rows={key.length > 80 ? 4 : 2}
              value={data.content[key] ?? key}
              onChange={(e) => setText(key, e.target.value)}
            />
          </label>
        ))}
      </div>

      <h3>Home gallery preview</h3>
      <label>
        Image URLs — one HTTPS URL per line
        <textarea
          rows={7}
          value={data.settings.galleryUrls}
          onChange={(e) =>
            change((d) => ({
              ...d,
              settings: { ...d.settings, galleryUrls: e.target.value },
            }))
          }
        />
      </label>
    </section>
  );
}
