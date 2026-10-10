"use client";

import type { Festival } from "@/lib/model";

const homeTexts = [
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
  const setText = (key: string, value: string) =>
    change((d) => ({ ...d, content: { ...d.content, [key]: value } }));
  return (
    <section className="card admin-section">
      <h2>Home page editor</h2>
      <p>
        Edit the navbar, hero section, buttons, category cards, leaderboard,
        gallery and footer content. Press <strong>Save changes</strong> when
        finished.
      </p>

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
