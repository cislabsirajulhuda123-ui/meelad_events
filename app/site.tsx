"use client";
import { useEffect, useState } from "react";
import {
  Home,
  Trophy,
  Activity,
  Layers,
  BookOpen,
  FileText,
  User,
  Menu,
  X,
  ArrowUpRight,
  MapPin,
  Search,
  ArrowLeft,
  Printer,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Festival,
  type Event,
  standings,
  zones,
  defaultNavigation,
} from "@/lib/model";
import { Choice } from "./ui";
import { ContentProvider, SiteText, SiteImage } from "./site-content";
import GalleryMedia from "./gallery-media";
import ResultPoster from "./result-poster";
import { posterCategoryKey, posterContentKey } from "@/lib/poster";
const links = [
  ["/", "Home", Home],
  ["/standings", "Leaderboard", Trophy],
  ["/results", "Results", Activity],
  ["/#zones", "Categories", Layers],
  ["/concept", "Concept", BookOpen],
  ["/brochure", "Brochure", FileText],
] as const;
const scheduleLabels = {
  UPCOMING: "Upcoming",
  REGISTRATION: "Registration Open",
  LIVE: "Live",
  ENDED: "Ended",
} as const;
export function Header({
  name = "MEELAD KUNDUTHODE",
  navigation = defaultNavigation,
}: {
  name?: string;
  navigation?: Festival["navigation"];
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container nav">
        <a href="/" className="brand" aria-label={name + " home"}>
          <SiteImage
            src="/meelad-logo.webp"
            alt="Meelad Kunduthode"
            width="54"
            height="54"
          />
        </a>
        <nav
          className={open ? "nav-links expanded" : "nav-links"}
          aria-label="Main navigation"
        >
          {navigation
            .filter((n) => n.visible)
            .map(({ href: url, label: title }) => (
              <a key={url + title} href={url}>
                {<SiteText value={title} />}
              </a>
            ))}
        </nav>
        <a href="/student" className="btn small">
          <User size={15} />
          <SiteText value={"Student Portal"} />
        </a>
        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
function Scorecard({
  event,
  labels,
}: {
  event: Event;
  labels: Record<string, string>;
}) {
  const rows = [...event.results].sort(
    (a, b) => (a.rank || 999) - (b.rank || 999) || b.points - a.points,
  );
  return (
    <>
      <div className="split">
        <div>
          <div className="eyebrow">
            {event.category}
            <SiteText value={" · "} />
            {labels[event.zone]}
          </div>
          <h1>{event.name}</h1>
          <p>
            {event.type}
            <SiteText value={" · "} />
            {event.venue}
          </p>
        </div>
        <button className="btn outline" onClick={() => window.print()}>
          <Printer size={16} />
          <SiteText value={"Print scorecard"} />
        </button>
      </div>
      {!event.published ? (
        <div className="empty">
          <Activity />
          <h2>
            <SiteText value={"Results not published yet"} />
          </h2>
          <p>
            <SiteText
              value={"The scorecard will appear when the admin publishes it."}
            />
          </p>
        </div>
      ) : (
        <>
          <div className="grid3 podium">
            {rows
              .filter((r) => r.rank > 0 && r.rank <= 3)
              .map((r) => (
                <article className={"card place-" + r.rank} key={r.id}>
                  <div className="eyebrow">
                    {r.rank === 1 ? "1st" : r.rank === 2 ? "2nd" : "3rd"}
                    <SiteText value={" PLACE"} />
                  </div>
                  <h3>{r.name}</h3>
                  <p>{r.team}</p>
                  <div className="split">
                    <span>
                      <SiteText value={"Grade: "} />
                      {r.grade || "—"}
                    </span>
                    <strong className="points">
                      {r.points}{" "}
                      <small>
                        <SiteText value={"pts"} />
                      </small>
                    </strong>
                  </div>
                </article>
              ))}
          </div>
          <div className="table-box">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SiteText value={"Rank"} />
                  </TableHead>
                  <TableHead>
                    <SiteText value={"Participant"} />
                  </TableHead>
                  <TableHead>
                    <SiteText value={"Team"} />
                  </TableHead>
                  <TableHead>
                    <SiteText value={"Grade"} />
                  </TableHead>
                  <TableHead>
                    <SiteText value={"Points"} />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.rank || "—"}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.team}</TableCell>
                    <TableCell>{r.grade || "—"}</TableCell>
                    <TableCell>{r.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  );
}
function Ranking({
  data,
  zone = "OVERALL",
}: {
  data: Festival;
  zone?: string;
}) {
  const rows = standings(data, zone);
  return (
    <>
      <div className="grid3 podium">
        {rows.slice(0, 3).map((r, i) => (
          <article className={"card place-" + (i + 1)} key={r.id}>
            <div className="split eyebrow">
              <span>
                <SiteText value={"CODE: "} />
                {r.code}
              </span>
              <span>
                <SiteText value={"RANK #"} />
                {rows.findIndex((x) => x.points === r.points) + 1}
              </span>
            </div>
            <h3>{r.name}</h3>
            <div className="score">
              <small>
                <SiteText value={"TOTAL POINTS"} />
              </small>
              <strong>
                {r.points}{" "}
                <small>
                  <SiteText value={"pts"} />
                </small>
              </strong>
            </div>
          </article>
        ))}
      </div>
      <div className="table-box">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SiteText value={"Rank & Team"} />
              </TableHead>
              <TableHead className="right">
                <SiteText value={"Championship Points"} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t, i) => (
              <TableRow key={t.id}>
                <TableCell>
                  <span className="rank">
                    <SiteText value={"#"} />
                    {rows.findIndex((x) => x.points === t.points) + 1}
                  </span>
                  <strong>{t.name}</strong>
                  <span className="code">{t.code}</span>
                </TableCell>
                <TableCell className="right aqua">
                  {t.points}
                  <SiteText value={" points"} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
function Concept() {
  return (
    <article className="reading">
      <div className="eyebrow">
        <SiteText value={"CONCEPT NOTE 2026"} />
      </div>
      <h1>
        <SiteText value={"DECIMAL VOICES |"} />
        <br />
        <span className="gradient">
          <SiteText value={"THE NEXT DECIMAL"} />
        </span>
      </h1>
      <p className="lead">
        <SiteText
          value={"“The universe is an absolute totality of Cosmic Precision.”"}
        />
      </p>
      <h2>
        <SiteText value={"Sacred & foundational rationales"} />
      </h2>
      <div className="grid3">
        <div className="card">
          <div className="eyebrow">
            <SiteText value={"SURAH AL-QAMAR 54:49"} />
          </div>
          <p lang="ar" dir="rtl" className="arabic">
            <SiteText value={"إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ"} />
          </p>
          <p>
            <SiteText
              value={
                "“Indeed, all things We created with predetermined measure.”"
              }
            />
          </p>
        </div>
        <div className="card">
          <div className="eyebrow">
            <SiteText value={"SURAH AR-RAHMAN 55:7"} />
          </div>
          <p lang="ar" dir="rtl" className="arabic">
            <SiteText value={"وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ"} />
          </p>
          <p>
            <SiteText
              value={"“And the heaven He raised and imposed the balance.”"}
            />
          </p>
        </div>
        <div className="card">
          <div className="eyebrow">
            <SiteText value={"SURAH AS-SAJDAH 32:7"} />
          </div>
          <p lang="ar" dir="rtl" className="arabic">
            <SiteText value={"الَّذِي أَحْسَنَ كُلَّ شَيْءٍ خَلَقَهُ"} />
          </p>
          <p>
            <SiteText value={"“Who perfected everything which He created.”"} />
          </p>
        </div>
      </div>
      <h2>
        <SiteText value={"The epistemic mandate: beyond approximations"} />
      </h2>
      <p>
        <SiteText
          value={
            "The universe operates on absolute cosmic precision, not approximations. From galactic orbits and gravitational equilibrium to subatomic interactions and cellular differentiation, everything in nature is governed by microscopic measurements. These calculations never end in an integer; rather, they unfold dynamically across infinite fractional dimensions."
          }
        />
      </p>
      <p>
        <SiteText
          value={
            "Truth resides not in “rounding off” realities, but in the epistemic curiosity to search for the next decimal. Complex human conditions, ethical decisions, and artistic endeavors should not be flattened into coarse averages and convenient approximations."
          }
        />
      </p>
      <h2>
        <SiteText value={"The primary academic objectives"} />
      </h2>
      <div className="grid2">
        {[
          [
            "Information Technology Analytics",
            "Extract the nuances of truth from information overload. Filter out algorithmic noise to discover subtle, verified signals.",
          ],
          [
            "Intellectual Discipline",
            "Challenge assumptions through careful inquiry and evidence.",
          ],
          [
            "Social Responsibility",
            "Recognize that systemic integrity begins with individual accountability to the smallest detail.",
          ],
          [
            "Ecological Interdependence",
            "Respect the subtle identities and connections within oneself, society, and the universe.",
          ],
        ].map(([title, desc], i) => (
          <div className="card" key={title}>
            <div className="eyebrow">
              <SiteText value={"[OBJ // 0"} />
              {i + 1}
              <SiteText value={"]"} />
            </div>
            <h3>{<SiteText value={title} />}</h3>
            <p>{<SiteText value={desc} />}</p>
          </div>
        ))}
      </div>
      <blockquote>
        <SiteText
          value={
            "“Scroll less. Measure more. The next decimal is where the noise ends and the signal begins.”"
          }
        />
      </blockquote>
      <p className="muted">
        <SiteText value={"Concept adapted from "} />
        <a href="https://www.cognizium.in/concept">
          <SiteText value={"Cognizium’s original concept note ↗"} />
        </a>
        <SiteText value={"."} />
      </p>
    </article>
  );
}
function FestivalSite({
  initial,
  view,
  eventId,
}: {
  initial: Festival;
  view: string;
  eventId?: string;
}) {
  const [data, setData] = useState(initial),
    [query, setQuery] = useState(""),
    [zone, setZone] = useState(view === "standings" ? "OVERALL" : "ALL"),
    [status, setStatus] = useState("ALL"),
    [scheduleCategory, setScheduleCategory] = useState<"Stage" | "Off-Stage">(
      "Stage",
    ),
    [error, setError] = useState(""),
    [refreshing, setRefreshing] = useState(false);
  async function refresh() {
    setRefreshing(true);
    try {
      const r = await fetch("/api/festival", { cache: "no-store" });
      const j = (await r.json()) as { error: string; data: Festival };
      if (!r.ok) throw Error(j.error);
      setData(j.data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }
  useEffect(() => {
    const update = () => {
      if (!document.hidden) void refresh();
    };
    const timer = setInterval(update, 10000);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    window.addEventListener("online", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
      window.removeEventListener("online", update);
    };
  }, []);
  const { settings } = data;
  const categoryNames = { ...zones, ...data.categoryLabels };
  const filtered = data.events.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) &&
      (zone === "ALL" || e.zone === zone) &&
      (status === "ALL" || (status === "PUBLISHED") === e.published),
  );
  const event = data.events.find((e) => e.id === eventId);
  const candidateResults =
    query.trim().length >= 2
      ? data.events
          .filter((e) => e.published)
          .flatMap((e) =>
            e.results
              .filter(
                (r) =>
                  r.name.toLowerCase().includes(query.trim().toLowerCase()) ||
                  (r.chest &&
                    r.chest.toLowerCase() === query.trim().toLowerCase()),
              )
              .map((r) => ({
                ...r,
                event: e,
                isTopScorer:
                  e.scheduleStatus === "LIVE" && e.pinnedTopScorerId === r.id,
              })),
          )
      : [];
  let customHomeTextIds: string[] = [];
  try {
    customHomeTextIds = JSON.parse(
      data.content["custom-home-text-ids"] || "[]",
    );
  } catch {}
  return (
    <ContentProvider value={data.content}>
      <Header name={settings.name} navigation={data.navigation} />
      {view === "home" ? (
        <main className="home-page">
          <div className="custom-home-text-layer">
            {customHomeTextIds.map((key) => (
              <SiteText value={key} key={key} />
            ))}
          </div>
          <div className="home-background" aria-hidden="true">
            <div className="hero-motion" aria-hidden="true" />
            {data.content["video:home-hero"] && (
              <video
                className="hero-video"
                src={data.content["video:home-hero"]}
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <div className="hero-shade" aria-hidden="true" />
          </div>
          <section className="hero">
            <div className="hero-date-place">
              <span>
                <SiteText value={"2027 · KUNDUTHODE"} />
              </span>
              <small>
                <SiteText value={"ORGANIZING SCHOOL NAME"} />
              </small>
            </div>
            <h1>
              {settings.subtitle.split(" ").slice(0, -1).join(" ") || "ZARRAH"}{" "}
              <span className="gradient">
                {settings.subtitle.split(" ").at(-1)}
              </span>
            </h1>
            <a className="scroll-cue" href="#discover">
              <SiteText value={"SCROLL TO DISCOVER ↓"} />
            </a>
          </section>
          <div className="container">
            <section className="quick-actions" id="discover">
              <div className="button-row">
                <a className="btn" href="/standings">
                  <Trophy size={18} />
                  <SiteText value={"View Live Leaderboard"} />
                </a>
                <a className="btn outline" href="/student">
                  <User size={18} />
                  <SiteText value={"Student Portal"} />
                </a>
                <a className="btn outline" href="/results">
                  <Activity size={18} />
                  <SiteText value={"Event Results"} />
                </a>
              </div>
              <p className="eyebrow">
                {data.teams.length}
                <SiteText value={" TEAMS · 4 CATEGORIES · "} />
                {data.events.length}
                <SiteText value={" EVENTS"} />
              </p>
            </section>
            <section className="section grid2">
              <div>
                <h2>
                  <SiteText value={"DECIMAL VOICES | "} />
                  <span className="gradient">
                    <SiteText value={"THE NEXT DECIMAL"} />
                  </span>
                </h2>
                <p>
                  <SiteText
                    value={
                      "The universe operates on absolute cosmic precision, not approximations. From galactic orbits to cellular differentiation, everything is controlled by microscopic measurements. Discover why the truth resides not in “rounding off” realities, but in the epistemic curiosity to search for the next decimal."
                    }
                  />
                </p>
                <a className="text-link" href="/concept">
                  <SiteText value={"[0.004] Read Full Concept "} />
                  <ArrowUpRight size={16} />
                </a>
              </div>
              <div className="card precision">
                <div className="eyebrow">
                  <SiteText value={"COSMIC PRECISION"} />
                </div>
                <strong className="gradient">
                  <SiteText value={"0.000000001…"} />
                </strong>
                <blockquote>
                  <SiteText
                    value={
                      "“Truth resides not in approximations, but in precision. Scroll less. Measure more.”"
                    }
                  />
                </blockquote>
                <span className="eyebrow">
                  <SiteText value={"DECIMAL VOICES 2026"} />
                </span>
              </div>
            </section>
            <section className="section">
              <h2>
                <SiteText value={"DISCOVER THE OFFICIAL "} />
                <span className="gradient">
                  <SiteText value={"FESTIVAL BROCHURE"} />
                </span>
              </h2>
              <p>
                <SiteText
                  value={
                    "Explore the official Cognizium 2026 digital brochure to discover the full Decimal Voices theme."
                  }
                />
              </p>
              <a className="text-link" href="/brochure">
                <SiteText value={"[0.005] READ FULL BROCHURE "} />
                <ArrowUpRight size={16} />
              </a>
            </section>
            <section className="section" id="zones">
              <h2>
                <SiteText value={"FESTIVAL "} />
                <span className="gradient">
                  <SiteText value={"CATEGORIES & STAGES"} />
                </span>
              </h2>
              <p>
                <SiteText
                  value={
                    "Events for High School, Upper Primary, Lower Primary and Kids, with published results and team standings."
                  }
                />
              </p>
              <div className="grid3">
                {[
                  [
                    "HIGH SCHOOL",
                    "MAIN STAGE",
                    "High School",
                    "Main stage featuring premier fine arts, oil painting, water color impressionism, and flagship solo competitions.",
                    "Main Auditorium & Studio A",
                  ],
                  [
                    "LOWER PRIMARY",
                    "EXHIBITION HALL",
                    "Lower Primary",
                    "Dedicated arena for charcoal portraiture, clay modeling, graphic design, and expressive sketching events.",
                    "Exhibition Hall 2 & Studio B",
                  ],
                  [
                    "UPPER PRIMARY",
                    "AMPHITHEATRE",
                    "Upper Primary",
                    "Specialized stage featuring regional teams in high-energy contests.",
                    "Open Air Amphitheatre",
                  ],
                  [
                    "KIDS",
                    "KIDS CATEGORY",
                    "Kids",
                    "Competitions and published results for the Kids category.",
                    "See individual events",
                  ],
                ].map(([label, sub, title, desc, venue]) => (
                  <article className="card" key={label}>
                    <div className="split eyebrow">
                      <span className="badge">
                        {<SiteText value={label} />}
                      </span>
                      <span>{<SiteText value={sub} />}</span>
                    </div>
                    <h3>{<SiteText value={title} />}</h3>
                    <p>{<SiteText value={desc} />}</p>
                    <div className="venue">
                      <MapPin size={15} />
                      {<SiteText value={venue} />}
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="section">
              <h2>
                <SiteText value={"CHAMPIONSHIP "} />
                <span className="gradient">
                  <SiteText value={"LEADERBOARD"} />
                </span>
              </h2>
              <Ranking data={data} />
              <a className="text-link" href="/standings">
                <SiteText value={"[0.006] Open Full Leaderboard "} />
                <ArrowUpRight size={16} />
              </a>
            </section>
            <section className="section">
              <h2>
                <SiteText value={"GALLERY & "} />
                <span className="gradient">
                  <SiteText value={"HIGHLIGHTS"} />
                </span>
              </h2>
              <p>
                <SiteText
                  value={
                    "Capturing unforgettable moments of artistic brilliance and stage performances."
                  }
                />
              </p>
              <div className="gallery-grid">
                {settings.galleryUrls
                  .split(/\n/)
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((url, i) => (
                    <a key={url} href="/gallery">
                      <SiteImage
                        src={url}
                        alt={"Cognizium festival moment " + (i + 1)}
                        loading="lazy"
                      />
                    </a>
                  ))}
              </div>
              <a className="text-link" href="/gallery">
                <SiteText value={"View all highlights →"} />
              </a>
            </section>
          </div>
          <a className="btn floating" href="/results">
            <Trophy size={18} />
            <SiteText value={"Check your results"} />
          </a>
        </main>
      ) : (
        <main className="container page">
          <a className="back" href="/">
            <ArrowLeft size={16} />
            <SiteText value={"Back to festival"} />
          </a>
          {view === "results" && (
            <>
              <div className="split">
                <div>
                  <div className="eyebrow">
                    <SiteText value={"COMPETITION RESULTS & SCORECARDS"} />
                  </div>
                  <h1>
                    <SiteText value={"Event Scorecard "} />
                    <span className="gradient">
                      <SiteText value={"Directory"} />
                    </span>
                  </h1>
                  <p>
                    <SiteText
                      value={
                        "Candidate ranks, awarded grades, and published team points."
                      }
                    />
                  </p>
                </div>
                <div className="stat">
                  <strong>{data.events.length}</strong>
                  <SiteText value={" TOTAL EVENTS "} />
                  <strong>
                    {data.events.filter((e) => e.published).length}
                  </strong>
                  <SiteText value={" PUBLISHED"} />
                </div>
              </div>
              <div className="filters">
                <label className="search">
                  <Search size={18} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search events…"
                    aria-label="Search events"
                  />
                </label>
                <Choice
                  label="Filter by category"
                  value={zone}
                  onChange={setZone}
                  items={{ ALL: "All categories", ...categoryNames }}
                />
                <Choice
                  label="Publication status"
                  value={status}
                  onChange={setStatus}
                  items={{
                    ALL: "All statuses",
                    PUBLISHED: "Published",
                    PENDING: "Pending",
                  }}
                />
              </div>
              <div className="grid3 events">
                {filtered.map((e, i) => (
                  <a
                    className="card event-card"
                    key={e.id}
                    href={"/results/" + e.id}
                  >
                    <div className="split eyebrow">
                      <span>
                        <SiteText value={"[0."} />
                        {String(i + 1).padStart(2, "0")}
                        <SiteText value={"] "} />
                        {e.category}
                      </span>
                      <span className={e.published ? "badge" : "badge pending"}>
                        {e.published ? "PUBLISHED" : "PENDING"}
                      </span>
                    </div>
                    <h3>{e.name}</h3>
                    <div className="split">
                      <small>
                        <MapPin size={13} />
                        {e.venue}
                      </small>
                      <span className="aqua">
                        {e.published ? "View ranks" : "Status details"}
                        <SiteText value={" →"} />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
              {!filtered.length && (
                <div className="empty">
                  <SiteText value={"No events match these filters."} />
                </div>
              )}
            </>
          )}
          {view === "scorecard" && event && (
            <>
              <a className="text-link" href="/results">
                <SiteText value={"← All events"} />
              </a>
              <Scorecard event={event} labels={categoryNames} />
              <ResultPoster
                event={event}
                categoryLabel={categoryNames[event.zone]}
                templateUrl={
                  (posterCategoryKey(event.zone) &&
                    data.content[
                      posterContentKey(posterCategoryKey(event.zone)!)
                    ]) ||
                  "/hi-zone-poster.jpg"
                }
              />
            </>
          )}
          {view === "standings" && (
            <>
              <div className="split">
                <div>
                  <h1>
                    <SiteText value={"CHAMPIONSHIP "} />
                    <span className="gradient">
                      <SiteText value={"LEADERBOARD"} />
                    </span>
                  </h1>
                  <p>
                    <SiteText
                      value={
                        "Ranked automatically by total published points. Updates every 10 seconds."
                      }
                    />
                  </p>
                </div>
                <button
                  className="btn outline"
                  disabled={refreshing}
                  onClick={refresh}
                >
                  {refreshing ? "Refreshing…" : "Refresh leaderboard"}
                </button>
              </div>
              <div className="filters">
                <Choice
                  label="Leaderboard category"
                  value={zone}
                  onChange={setZone}
                  items={{ OVERALL: "Overall Championship", ...categoryNames }}
                />
              </div>
              <Ranking data={data} zone={zone} />
            </>
          )}
          {view === "schedule" && (
            <>
              <div className="eyebrow">EVENT PROGRAMME</div>
              <h1>
                Schedule & <span className="gradient">Live Status</span>
              </h1>
              <p>
                Upcoming events, registration announcements, live competitions
                and completed events.
              </p>
              <div className="schedule-tabs" role="tablist">
                {(["Stage", "Off-Stage"] as const).map((category) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={scheduleCategory === category}
                    className={scheduleCategory === category ? "active" : ""}
                    onClick={() => setScheduleCategory(category)}
                    key={category}
                  >
                    {category === "Stage" ? "Stage" : "Off-Stage"}
                  </button>
                ))}
              </div>
              <section className="schedule-section">
                <h2>{scheduleCategory} Events</h2>
                <div className="events schedule-list">
                  {[...data.events]
                    .filter((event) => event.category === scheduleCategory)
                    .sort((a, b) => {
                      const order = {
                        ENDED: 0,
                        LIVE: 1,
                        UPCOMING: 2,
                        REGISTRATION: 3,
                      } as const;
                      return (
                        order[a.scheduleStatus] - order[b.scheduleStatus] ||
                        (a.scheduleAt || "9999").localeCompare(
                          b.scheduleAt || "9999",
                        )
                      );
                    })
                    .map((item) => {
                      const scorer = (
                        item.publishedResults.length
                          ? item.publishedResults
                          : item.results
                      ).find((r) => r.id === item.pinnedTopScorerId);
                      return (
                        <a
                          className="card event-card"
                          key={item.id}
                          href={"/results/" + item.id}
                        >
                          <div className="split">
                            <span
                              className={`schedule-status status-${item.scheduleStatus.toLowerCase()}`}
                            >
                              {scheduleLabels[item.scheduleStatus]}
                            </span>
                            {item.resultNumber && (
                              <span className="eyebrow">
                                RESULT #{item.resultNumber}
                              </span>
                            )}
                          </div>
                          <h3>{item.name}</h3>
                          <p>
                            {categoryNames[item.zone]} · {item.type}
                          </p>
                          <div className="venue">
                            <Activity size={15} />
                            {item.scheduleAt
                              ? new Date(item.scheduleAt).toLocaleString(
                                  "en-IN",
                                  { dateStyle: "medium", timeStyle: "short" },
                                )
                              : "Time will be announced"}
                          </div>
                          {item.scheduleStatus === "LIVE" && scorer && (
                            <div className="top-scorer">
                              <strong>LIVE TOP SCORER</strong>
                              <span>
                                {scorer.name} · Chest {scorer.chest || "—"}
                              </span>
                            </div>
                          )}
                        </a>
                      );
                    })}
                </div>
              </section>
            </>
          )}
          {view === "gallery" && (
            <>
              <h1>
                <SiteText value={"GALLERY & "} />
                <span className="gradient">
                  <SiteText value={"HIGHLIGHTS"} />
                </span>
              </h1>
              <p>
                <SiteText value={"Moments from Cognizium 2026."} />
              </p>
              <div className="gallery-grid">
                {settings.galleryUrls
                  .split(/\n/)
                  .filter(Boolean)
                  .map((url, i) => (
                    <a href={url} key={url} target="_blank" rel="noreferrer">
                      <SiteImage
                        src={url}
                        alt={"Festival moment " + (i + 1)}
                        loading="lazy"
                      />
                    </a>
                  ))}
              </div>
              <GalleryMedia />
              {!settings.galleryUrls && (
                <p>
                  <SiteText
                    value={"See the latest gallery photos and videos below."}
                  />
                </p>
              )}
            </>
          )}
          {view === "concept" && <Concept />}
          {view === "brochure" && (
            <>
              <div className="eyebrow">
                <SiteText value={"COGNIZIUM 2026"} />
              </div>
              <h1>
                <SiteText value={"THE FESTIVAL "} />
                <span className="gradient">
                  <SiteText value={"BROCHURE"} />
                </span>
              </h1>
              <p>
                <SiteText
                  value={
                    "Discover the theme, festival vision and program details."
                  }
                />
              </p>
              <div className="card brochure-cover">
                <SiteImage src="/meelad-logo.webp" alt="Meelad Kunduthode" />
                <h2 className="gradient">{settings.theme}</h2>
                <p>{settings.subtitle}</p>
                {settings.brochureUrl ? (
                  <a
                    className="btn"
                    href={settings.brochureUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <SiteText value={"Open festival brochure "} />
                    <ArrowUpRight size={18} />
                  </a>
                ) : (
                  <p>
                    <SiteText value={"The brochure will be available soon."} />
                  </p>
                )}
              </div>
              <p className="muted">
                <SiteText value={"The brochure opens in a new tab."} />
              </p>
            </>
          )}
          {view === "student" && (
            <>
              <div className="eyebrow">
                <SiteText value={"STUDENT PORTAL"} />
              </div>
              <h1>
                <SiteText value={"YOUR "} />
                <span className="gradient">
                  <SiteText value={"RESULTS."} />
                </span>
              </h1>
              <p>
                <SiteText
                  value={
                    "Search your name or an admin-assigned chest number to find your published scorecards."
                  }
                />
              </p>
              <label className="search">
                <Search />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name or chest number"
                  aria-label="Candidate name or chest number"
                />
              </label>
              {query.trim().length < 2 ? (
                <div className="empty">
                  <SiteText
                    value={
                      "Enter at least two characters to search published results."
                    }
                  />
                </div>
              ) : candidateResults.length ? (
                <div className="grid3 events">
                  {candidateResults.map((r) => (
                    <a
                      className="card"
                      key={r.id}
                      href={"/results/" + r.event.id}
                    >
                      <span className="eyebrow">{r.event.name}</span>
                      {r.isTopScorer && (
                        <span className="schedule-status status-live">
                          LIVE TOP SCORER
                        </span>
                      )}
                      <h3>{r.name}</h3>
                      <p>
                        {r.team}
                        <SiteText value={" · Rank "} />
                        {r.rank || "—"}
                        <SiteText value={" · Grade "} />
                        {r.grade || "—"}
                      </p>
                      <strong className="points">
                        {r.points}{" "}
                        <small>
                          <SiteText value={"pts"} />
                        </small>
                      </strong>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <SiteText
                    value={
                      "No published results match that name or chest number."
                    }
                  />
                </div>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </main>
      )}
      <footer>
        <div className="container footer-grid">
          <div>
            <SiteImage
              src="/meelad-logo.webp"
              width="90"
              height="90"
              alt="Meelad Kunduthode"
            />
            <p>
              <SiteText
                value={
                  "The Next Decimal. A cultural and intellectual festival."
                }
              />
            </p>
            <span className="eyebrow">
              <SiteText value={"ORIGINAL FESTIVAL ORGANIZER"} />
            </span>
            <SiteImage src="/hidalogo.webp" width="75" alt="HIDA" />
          </div>
          <div>
            <h3>
              <SiteText value={"PLATFORM DIRECTORY"} />
            </h3>
            {data.navigation
              .filter((n) => n.visible)
              .map(({ href: url, label }) => (
                <a key={label} href={url}>
                  {<SiteText value={label} />}
                </a>
              ))}
            <a href="/admin">
              <SiteText value={"Admin"} />
            </a>
          </div>
          <div>
            <h3>
              <SiteText value={"VENUE & CONNECT"} />
            </h3>
            <p>{settings.venue}</p>
            {settings.email && (
              <a href={"mailto:" + settings.email}>{settings.email}</a>
            )}
            <a href="https://www.cognizium.in" target="_blank" rel="noreferrer">
              <SiteText value={"Original Cognizium site ↗"} />
            </a>
          </div>
        </div>
        <div className="container disclosure">{settings.sourceNote}</div>
      </footer>
    </ContentProvider>
  );
}

export default function Site(props: {
  initial: Festival;
  view: string;
  eventId?: string;
}) {
  return (
    <ContentProvider value={props.initial.content}>
      <FestivalSite {...props} />
    </ContentProvider>
  );
}
