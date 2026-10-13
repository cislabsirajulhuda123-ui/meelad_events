"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Save,
  Globe,
  LogOut,
  Trash2,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { type Festival, type Event, type Result, zones } from "@/lib/model";
import { Choice } from "../ui";
import ContentEditor from "./content-editor";
import HomeEditor from "./home-editor";
import PosterEditor from "./poster-editor";
import ScheduleEditor from "./schedule-editor";
import RegistrationPortal from "../sub-admin/ui";
import EventPosterUpload from "./event-poster-upload";
import LogoUpload from "./logo-upload";
import ShareEditor from "./share-editor";
export default function Admin({
  initial,
  initialRevision,
}: {
  initial: Festival;
  initialRevision: number;
}) {
  const [data, setData] = useState(initial),
    [revision, setRevision] = useState(initialRevision),
    [selected, setSelected] = useState(initial.events[0]?.id || ""),
    [query, setQuery] = useState(""),
    [eventCategoryFilter, setEventCategoryFilter] = useState("ALL"),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [dirty, setDirty] = useState(false),
    [remove, setRemove] = useState<string | null>(null);
  const categoryNames = { ...zones, ...data.categoryLabels };
  const event = data.events.find((e) => e.id === selected);
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [dirty]);
  function change(fn: (d: Festival) => Festival) {
    setData(fn);
    setDirty(true);
    setMessage("");
  }
  function editEvent(p: Partial<Event>) {
    change((d) => ({
      ...d,
      events: d.events.map((e) => (e.id === selected ? { ...e, ...p } : e)),
    }));
  }
  function editRow(id: string, p: Partial<Result>) {
    if (event)
      editEvent({
        results: event.results.map((r) => (r.id === id ? { ...r, ...p } : r)),
      });
  }
  async function save(action = "save") {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await fetch("/api/festival", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, revision, action, eventId: selected }),
      });
      const j = (await r.json()) as {
        error?: string;
        data: Festival;
        revision: number;
      };
      if (!r.ok) throw Error(j.error || "Could not save");
      setData(j.data);
      setRevision(j.revision);
      setDirty(false);
      setMessage(
        action === "publish"
          ? "Scorecard published. The public leaderboard is updated."
          : action === "unpublish"
            ? "Scorecard unpublished. Results are hidden from the public."
            : "Changes saved. Result edits stay in draft until you publish.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function importParticipants() {
    if (!event) return;
    setError("");
    try {
      const res = await fetch("/api/registrations", { cache: "no-store" }),
        j = (await res.json()) as {
          error?: string;
          registrations: import("@/lib/registration").Registration[];
        };
      if (!res.ok) throw Error(j.error || "Could not load registrations");
      const rows = j.registrations
        .filter((p: import("@/lib/registration").Registration) =>
          p.eventIds.includes(event.id),
        )
        .filter(
          (p: import("@/lib/registration").Registration) =>
            !event.results.some(
              (r) =>
                r.id === p.id ||
                r.chest.toUpperCase() === p.chest.toUpperCase(),
            ),
        )
        .map((p: import("@/lib/registration").Registration) => ({
          id: p.id,
          name: p.name,
          chest: p.chest,
          team: data.teams.find((t) => t.id === p.teamId)?.name || "",
          rank: 0,
          grade: "" as const,
          points: 0,
        }));
      editEvent({ results: [...event.results, ...rows] });
      setMessage(
        rows.length +
          " registered participants added to this results draft. Save to keep them.",
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function newEvent() {
    const id = crypto.randomUUID();
    change((d) => ({
      ...d,
      events: [
        ...d.events,
        {
          id,
          name: "New event",
          category: "Stage",
          zone: "HI_ZONE_CAMPUS",
          venue: "Festival Stage",
          resultNumber: "",
          scheduleAt: "",
          scheduleStatus: "UPCOMING",
          pinnedTopScorerId: "",
          type: "Individual",
          published: false,
          results: [],
          publishedResults: [],
        },
      ],
    }));
    setSelected(id);
    setQuery("");
  }
  function newRow() {
    if (!event) return;
    if (!data.teams.length) {
      setError("Add a team first.");
      return;
    }
    editEvent({
      results: [
        ...event.results,
        {
          id: crypto.randomUUID(),
          name: "",
          team: data.teams[0].name,
          chest: "",
          rank: 0,
          grade: "",
          points: 0,
        },
      ],
    });
  }
  return (
    <>
      <header className="admin-header">
        <div className="container split">
          <a className="brand" href="/">
            <img
              src={
                data.content["image:/meelad-logo.webp"] || "/meelad-logo.webp"
              }
              width="58"
              height="58"
              alt="Meelad Kunduthode"
            />
          </a>
          <div className="button-row">
            <a className="btn outline small" href="/" target="_blank">
              <Globe size={15} />
              Public site
            </a>
            <a className="btn outline small" href="/admin/password">
              Portal passwords
            </a>
            <form action="/api/admin/logout" method="post">
              <button className="btn outline small">
                <LogOut size={15} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="container admin-page">
        <div className="split">
          <div>
            <div className="eyebrow">FESTIVAL MANAGEMENT</div>
            <h1>
              ADMIN <span className="gradient">CONTROL.</span>
            </h1>
            <p>
              Manage all pages, categories, participants, teams and results.
            </p>
          </div>
          <button className="btn" disabled={busy} onClick={() => save()}>
            <Save size={17} />
            {busy ? "Saving…" : dirty ? "Save changes" : "Save"}
          </button>
        </div>
        <div className="admin-stats">
          <span>
            <strong>{data.events.length}</strong> Events
          </span>
          <span>
            <strong>{data.events.filter((e) => e.published).length}</strong>{" "}
            Published
          </span>
          <span>
            <strong>{data.teams.length}</strong> Teams
          </span>
          <span className={dirty ? "yellow" : "muted"}>
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
        </div>
        {message && (
          <p role="status" className="success">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <fieldset disabled={busy} className="admin-fieldset">
          <Tabs defaultValue="events">
            <TabsList className="admin-tabs">
              <TabsTrigger value="events">Events & results</TabsTrigger>
              <TabsTrigger value="home">Home page</TabsTrigger>
              <TabsTrigger value="schedule">Schedule & Live</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="posters">Poster drafts</TabsTrigger>
              <TabsTrigger value="sharing">Share messages</TabsTrigger>
              <TabsTrigger value="settings">Site settings</TabsTrigger>
              <TabsTrigger value="content">All public pages</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
            </TabsList>
            <TabsContent value="events">
              <div className="admin-layout">
                <aside className="event-sidebar">
                  <div className="split">
                    <h2>Events</h2>
                    <button
                      className="icon-btn"
                      onClick={newEvent}
                      aria-label="Add event"
                    >
                      <Plus />
                    </button>
                  </div>
                  <label className="search">
                    <Search size={16} />
                    <input
                      placeholder="Find event"
                      aria-label="Find event"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <Choice
                    label="Filter events by category"
                    value={eventCategoryFilter}
                    onChange={setEventCategoryFilter}
                    items={{ ALL: "All categories", ...categoryNames }}
                  />
                  <div className="event-list">
                    {data.events
                      .filter(
                        (e) =>
                          e.name.toLowerCase().includes(query.toLowerCase()) &&
                          (eventCategoryFilter === "ALL" ||
                            e.zone === eventCategoryFilter),
                      )
                      .map((e) => (
                        <button
                          key={e.id}
                          className={selected === e.id ? "selected" : ""}
                          onClick={() => setSelected(e.id)}
                        >
                          <span>{e.name}</span>
                          <small>
                            {e.published ? "Published" : "Draft"} ·{" "}
                            {categoryNames[e.zone]}
                          </small>
                        </button>
                      ))}
                  </div>
                </aside>
                <div className="editor">
                  {event ? (
                    <>
                      <div className="split">
                        <h2>{event.name}</h2>
                        <div className="button-row">
                          <a
                            href={"/results/" + event.id}
                            target="_blank"
                            className="icon-btn"
                            aria-label="View public scorecard"
                          >
                            <ArrowUpRight />
                          </a>
                          <button
                            className="icon-btn danger"
                            aria-label="Delete event"
                            onClick={() => setRemove(event.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="form-grid">
                        <label>
                          Event name
                          <input
                            value={event.name}
                            onChange={(e) =>
                              editEvent({ name: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Venue
                          <input
                            value={event.venue}
                            onChange={(e) =>
                              editEvent({ venue: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Result number
                          <input
                            value={event.resultNumber}
                            placeholder="Example: 90"
                            onChange={(e) =>
                              editEvent({ resultNumber: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Category
                          <Choice
                            label="Event category"
                            value={event.category}
                            onChange={(v) =>
                              editEvent({ category: v as Event["category"] })
                            }
                            items={{ Stage: "Stage", "Off-Stage": "Off-Stage" }}
                          />
                        </label>
                        <label>
                          Zone
                          <Choice
                            label="Event zone"
                            value={event.zone}
                            onChange={(v) =>
                              editEvent({ zone: v as Event["zone"] })
                            }
                            items={categoryNames}
                          />
                        </label>
                        <label>
                          Event type
                          <Choice
                            label="Event type"
                            value={event.type}
                            onChange={(v) =>
                              editEvent({ type: v as Event["type"] })
                            }
                            items={{
                              Individual: "Individual",
                              "Group 2": "Group 2",
                              "Group 3": "Group 3",
                              "Group 4": "Group 4",
                              "Group 5": "Group 5",
                            }}
                          />
                        </label>
                        <div className="field-note">
                          Status:{" "}
                          <span className="badge">
                            {event.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                      <EventPosterUpload
                        eventId={event.id}
                        data={data}
                        change={change}
                      />
                      <div className="split results-heading">
                        <div>
                          <h3>Results draft</h3>
                          <p>
                            Enter final points. Rank 0 means no place. For group
                            events, the highest participant score per team
                            counts once.
                          </p>
                        </div>
                        <button
                          className="btn outline small"
                          onClick={importParticipants}
                        >
                          Import registrations
                        </button>
                        <button className="btn outline small" onClick={newRow}>
                          <Plus size={16} />
                          Add participant
                        </button>
                      </div>
                      {event.results.length ? (
                        <div className="table-box editor-table">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Participant</TableHead>
                                <TableHead>Team</TableHead>
                                <TableHead>Chest no.</TableHead>
                                <TableHead>Rank</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Remove</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {event.results.map((r, i) => (
                                <TableRow key={r.id}>
                                  <TableCell>
                                    <input
                                      aria-label={"Participant " + (i + 1)}
                                      value={r.name}
                                      onChange={(e) =>
                                        editRow(r.id, { name: e.target.value })
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Choice
                                      label={"Team for participant " + (i + 1)}
                                      value={r.team}
                                      onChange={(v) =>
                                        editRow(r.id, { team: v })
                                      }
                                      items={Object.fromEntries(
                                        data.teams.map((t) => [t.name, t.name]),
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <input
                                      aria-label={
                                        "Chest number for participant " +
                                        (i + 1)
                                      }
                                      value={r.chest}
                                      onChange={(e) =>
                                        editRow(r.id, { chest: e.target.value })
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <input
                                      type="number"
                                      min="0"
                                      max="1000"
                                      aria-label={
                                        "Rank for participant " + (i + 1)
                                      }
                                      value={r.rank}
                                      onChange={(e) =>
                                        editRow(r.id, {
                                          rank: Number(e.target.value),
                                        })
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Choice
                                      label={"Grade for participant " + (i + 1)}
                                      value={r.grade}
                                      onChange={(v) =>
                                        editRow(r.id, {
                                          grade: v as Result["grade"],
                                        })
                                      }
                                      items={{
                                        "": "None",
                                        A: "A",
                                        B: "B",
                                        C: "C",
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <input
                                      type="number"
                                      min="0"
                                      max="10000"
                                      step="0.5"
                                      aria-label={
                                        "Points for participant " + (i + 1)
                                      }
                                      value={r.points}
                                      onChange={(e) =>
                                        editRow(r.id, {
                                          points: Number(e.target.value),
                                        })
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <button
                                      className="icon-btn"
                                      aria-label={
                                        "Remove participant " + (i + 1)
                                      }
                                      onClick={() =>
                                        editEvent({
                                          results: event.results.filter(
                                            (x) => x.id !== r.id,
                                          ),
                                        })
                                      }
                                    >
                                      <XIcon />
                                    </button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="empty">
                          No participants yet. Add a participant to enter
                          results.
                        </div>
                      )}
                      <div className="publish-box">
                        <div>
                          <h3>
                            {event.published
                              ? "Update published scorecard"
                              : "Publish this event"}
                          </h3>
                          <p>
                            Publishing makes this draft visible to everyone and
                            recalculates team points.
                          </p>
                        </div>
                        <div className="button-row">
                          {event.published && (
                            <button
                              className="btn outline"
                              onClick={() => save("unpublish")}
                            >
                              Unpublish
                            </button>
                          )}
                          <button
                            className="btn"
                            disabled={!event.results.length}
                            onClick={() => save("publish")}
                          >
                            <Globe size={16} />
                            Publish results
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="empty">Add an event to get started.</div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="home">
              <HomeEditor data={data} change={change} />
            </TabsContent>
            <TabsContent value="sharing">
              <ShareEditor data={data} change={change} />
            </TabsContent>
            <TabsContent value="schedule">
              <ScheduleEditor data={data} change={change} />
            </TabsContent>
            <TabsContent value="teams">
              <section className="card admin-section">
                <div className="split">
                  <div>
                    <h2>Teams</h2>
                    <p>Points are calculated from published results.</p>
                  </div>
                  <button
                    className="btn outline"
                    onClick={() =>
                      change((d) => ({
                        ...d,
                        teams: [
                          ...d.teams,
                          {
                            id: crypto.randomUUID(),
                            name: "New team " + (d.teams.length + 1),
                            code: "NEW",
                          },
                        ],
                      }))
                    }
                  >
                    <Plus size={16} />
                    Add team
                  </button>
                </div>
                <div className="grid3">
                  {data.teams.map((t) => {
                    const used = data.events.some((e) =>
                      [...e.results, ...e.publishedResults].some(
                        (r) => r.team === t.name,
                      ),
                    );
                    return (
                      <div className="card" key={t.id}>
                        <label>
                          Team name
                          <input
                            value={t.name}
                            onChange={(e) =>
                              change((d) => ({
                                ...d,
                                teams: d.teams.map((x) =>
                                  x.id === t.id
                                    ? { ...x, name: e.target.value }
                                    : x,
                                ),
                                events: d.events.map((ev) => ({
                                  ...ev,
                                  results: ev.results.map((r) =>
                                    r.team === t.name
                                      ? { ...r, team: e.target.value }
                                      : r,
                                  ),
                                  publishedResults: ev.publishedResults.map(
                                    (r) =>
                                      r.team === t.name
                                        ? { ...r, team: e.target.value }
                                        : r,
                                  ),
                                })),
                              }))
                            }
                          />
                        </label>
                        <label>
                          Code
                          <input
                            value={t.code}
                            onChange={(e) =>
                              change((d) => ({
                                ...d,
                                teams: d.teams.map((x) =>
                                  x.id === t.id
                                    ? { ...x, code: e.target.value }
                                    : x,
                                ),
                              }))
                            }
                          />
                        </label>
                        {used && (
                          <small className="muted">
                            Renaming also updates linked results.
                          </small>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </TabsContent>
            <TabsContent value="posters">
              <PosterEditor data={data} change={change} />
            </TabsContent>
            <TabsContent value="settings">
              <section className="card admin-section">
                <h2>Site settings</h2>
                <p>Save changes to update the public website.</p>
                <LogoUpload data={data} change={change} />
                <label style={{ display: "grid", gap: 8, marginBottom: 18 }}>
                  Browser tab name
                  <input
                    value={data.content["browser-title"] || data.settings.name}
                    onChange={(e) =>
                      change((d) => ({
                        ...d,
                        content: {
                          ...d.content,
                          "browser-title": e.target.value,
                        },
                      }))
                    }
                  />
                  <small className="muted">
                    This changes the name shown on the browser tab.
                  </small>
                </label>
                <div className="form-grid">
                  {Object.entries({
                    name: "Festival name",
                    subtitle: "Hero title",
                    theme: "Festival theme",
                    venue: "Venue",
                    email: "Public contact email",
                    brochureUrl: "Brochure link (HTTPS)",
                    galleryUrls: "Gallery image URLs (one per line)",
                    sourceNote: "Source / footer note",
                  }).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <textarea
                        rows={key === "galleryUrls" ? 5 : 2}
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
                </div>
                <p className="muted">
                  Portal passwords are managed using the Portal passwords link.
                  Main Admin can edit the website; Sub-admin can only register
                  participants.
                </p>
              </section>
            </TabsContent>
            <TabsContent value="content">
              <ContentEditor data={data} change={change} />
            </TabsContent>
            <TabsContent value="participants">
              <section className="card admin-section">
                <h2>Sub-admin registration access</h2>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <input
                    type="checkbox"
                    style={{ width: 24 }}
                    checked={data.registrationOpen}
                    onChange={(e) =>
                      change((d) => ({
                        ...d,
                        registrationOpen: e.target.checked,
                      }))
                    }
                  />
                  {data.registrationOpen
                    ? "Registration Open"
                    : "Registration Closed"}
                </label>
                <p>
                  Save changes to apply this setting. When closed, sub-admins
                  can view registrations but cannot add or edit participants.
                  Main Admin can still make changes.
                </p>
              </section>
              <RegistrationPortal embedded />
            </TabsContent>
          </Tabs>
        </fieldset>
      </main>
      <AlertDialog
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this event?</AlertDialogTitle>
            <AlertDialogDescription>
              Its scorecard and points will be removed after you save changes.
              Cancel to keep the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                change((d) => ({
                  ...d,
                  events: d.events.filter((e) => e.id !== remove),
                }));
                if (selected === remove)
                  setSelected(
                    data.events.find((e) => e.id !== remove)?.id || "",
                  );
                setRemove(null);
              }}
            >
              Remove event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
function XIcon() {
  return <span aria-hidden="true">×</span>;
}
