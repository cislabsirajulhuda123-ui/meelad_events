"use client";
import { useEffect, useState } from "react";
import type { Registration } from "@/lib/registration";
import { zones } from "@/lib/model";
import { Choice } from "../ui";
type Options = {
  registrationOpen: boolean;
  canEdit: boolean;
  registrations: Registration[];
  teams: { id: string; name: string }[];
  events: { id: string; name: string; zone: string }[];
  categoryLabels: Record<string, string>;
};
export default function RegistrationPortal({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [data, setData] = useState<Options | null>(null),
    [form, setForm] = useState<Registration | null>(null),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const r = await fetch("/api/registrations", { cache: "no-store" }),
        j = (await r.json()) as Options & { error?: string };
      if (!r.ok) throw Error(j.error || "Request failed");
      setData(j);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
    const update = () => {
      if (!document.hidden) void load();
    };
    const timer = setInterval(update, 10000);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);
  function add() {
    setForm({
      id: crypto.randomUUID(),
      name: "",
      chest: "",
      teamId: data?.teams[0]?.id || "",
      zone: "HI_ZONE_CAMPUS",
      eventIds: [],
      revision: 0,
    });
    setMessage("");
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError("");
    try {
      const { revision, ...registration } = form;
      const r = await fetch("/api/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registration, revision }),
        }),
        j = (await r.json()) as Options & { error?: string };
      if (!r.ok) throw Error(j.error || "Request failed");
      setForm(null);
      setMessage(
        "Participant registered. Results and points are managed by the main admin.",
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string, name: string) {
    if (!confirm("Delete " + name + "?")) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/registrations", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }),
        j = await r.json();
      if (!r.ok) throw Error(j.error || "Request failed");
      setForm(null);
      setMessage("Participant deleted.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const labels = { ...zones, ...data?.categoryLabels };
  return (
    <section className={embedded ? "admin-section" : "container page"}>
      {!embedded && (
        <>
          <div className="split">
            <h1>Participant registration</h1>
            <form action="/api/admin/logout" method="post">
              <button className="btn outline">Sign out</button>
            </form>
          </div>
          <p>Register participants and select their competitions.</p>
        </>
      )}
      {error && (
        <p role="alert" className="error">
          {error} <button onClick={load}>Reload</button>
        </p>
      )}
      {message && (
        <p role="status" className="success">
          {message}
        </p>
      )}
      {data && (
        <>
          <p
            role="status"
            className={data.registrationOpen ? "success" : "error"}
          >
            {data.registrationOpen
              ? "Registration is open"
              : "Registration is closed"}
            {!data.registrationOpen && data.canEdit
              ? " — Main Admin can still edit."
              : ""}
          </p>
          <div className="split">
            <input
              aria-label="Search registrations"
              placeholder="Name or chest number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn" disabled={!data.canEdit} onClick={add}>
              Register participant
            </button>
          </div>
          {form && (
            <form className="card" onSubmit={save}>
              <h2>{form.revision ? "Edit participant" : "New participant"}</h2>
              <fieldset
                disabled={busy || !data.canEdit}
                className="admin-fieldset"
              >
                <div className="form-grid">
                  <label>
                    Name
                    <input
                      required
                      maxLength={200}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Chest number
                    <input
                      required
                      maxLength={40}
                      value={form.chest}
                      onChange={(e) =>
                        setForm({ ...form, chest: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Team
                    <Choice
                      label="Participant team"
                      value={form.teamId}
                      onChange={(v) => setForm({ ...form, teamId: v })}
                      items={Object.fromEntries(
                        data.teams.map((t) => [t.id, t.name]),
                      )}
                    />
                  </label>
                  <label>
                    Category
                    <Choice
                      label="Participant category"
                      value={form.zone}
                      onChange={(v) =>
                        setForm({ ...form, zone: v, eventIds: [] })
                      }
                      items={labels}
                    />
                  </label>
                </div>
                <h3>Competitions</h3>
                <div className="grid2">
                  {data.events
                    .filter((e) => e.zone === form.zone)
                    .map((e) => (
                      <label
                        key={e.id}
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{ width: 20 }}
                          checked={form.eventIds.includes(e.id)}
                          onChange={(x) =>
                            setForm({
                              ...form,
                              eventIds: x.target.checked
                                ? [...form.eventIds, e.id]
                                : form.eventIds.filter((id) => id !== e.id),
                            })
                          }
                        />
                        {e.name}
                      </label>
                    ))}
                </div>
                {!data.events.some((e) => e.zone === form.zone) && (
                  <p>Main admin must add events in this category first.</p>
                )}
                <div className="button-row" style={{ marginTop: 20 }}>
                  <button className="btn" disabled={!form.eventIds.length}>
                    {busy ? "Saving…" : "Save registration"}
                  </button>
                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => setForm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </fieldset>
            </form>
          )}
          <div className="table-box" style={{ marginTop: 20 }}>
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Chest</th>
                  <th>Name</th>
                  <th>Team / category</th>
                  <th>Competitions</th>
                  <th>Control</th>
                </tr>
              </thead>
              <tbody>
                {data.registrations
                  .filter((p) =>
                    (p.name + " " + p.chest)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((p) => (
                    <tr key={p.id}>
                      <td>{p.chest}</td>
                      <td>{p.name}</td>
                      <td>
                        {data.teams.find((t) => t.id === p.teamId)?.name ||
                          "Removed team"}{" "}
                        / {labels[p.zone]}
                      </td>
                      <td>
                        {p.eventIds
                          .map(
                            (id) =>
                              data.events.find((e) => e.id === id)?.name ||
                              "Removed event",
                          )
                          .join(", ")}
                      </td>
                      <td>
                        <div className="button-row">
                          <button
                            className="btn outline small"
                            disabled={!data.canEdit}
                            onClick={() => {
                              setForm(p);
                              setMessage("");
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn outline small danger"
                            disabled={!data.canEdit || busy}
                            onClick={() => remove(p.id, p.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!data.registrations.length && <p>No participants registered yet.</p>}
        </>
      )}
    </section>
  );
}
