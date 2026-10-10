"use client";
import type { Festival } from "@/lib/model";

const labels = {
  UPCOMING: "Upcoming",
  REGISTRATION: "Registration Open",
  LIVE: "Live",
  ENDED: "Ended",
} as const;

export default function ScheduleEditor({
  data,
  change,
}: {
  data: Festival;
  change: (fn: (d: Festival) => Festival) => void;
}) {
  function edit(id: string, patch: Partial<Festival["events"][number]>) {
    change((d) => ({
      ...d,
      events: d.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }
  return (
    <section className="card admin-section">
      <h2>Schedule & Live control</h2>
      <p>
        Add date/time, change live status, and pin a current top scorer. Press
        Save changes when finished.
      </p>
      <div className="grid2">
        {data.events.map((event) => {
          const candidates = event.publishedResults.length
            ? event.publishedResults
            : event.results;
          return (
            <article className="card" key={event.id}>
              <h3>{event.name}</h3>
              <label>
                Date and time
                <input
                  type="datetime-local"
                  value={event.scheduleAt}
                  onChange={(e) =>
                    edit(event.id, { scheduleAt: e.target.value })
                  }
                />
              </label>
              <label>
                Status
                <select
                  className="choice"
                  value={event.scheduleStatus}
                  onChange={(e) =>
                    edit(event.id, {
                      scheduleStatus: e.target
                        .value as typeof event.scheduleStatus,
                    })
                  }
                >
                  {Object.entries(labels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Pin live top scorer
                <select
                  className="choice"
                  value={event.pinnedTopScorerId}
                  onChange={(e) =>
                    edit(event.id, { pinnedTopScorerId: e.target.value })
                  }
                >
                  <option value="">No pinned scorer</option>
                  {candidates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · Chest {r.chest || "—"} · {r.team}
                    </option>
                  ))}
                </select>
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}
