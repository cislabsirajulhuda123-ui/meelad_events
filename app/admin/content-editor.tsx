"use client";
import { useState } from "react";
import type { Festival } from "@/lib/model";
import { zones } from "@/lib/model";
import catalog from "@/data/content-catalog.json";
export default function ContentEditor({
  data,
  change,
}: {
  data: Festival;
  change: (fn: (d: Festival) => Festival) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("ALL");
  const [newCategoryKey, setNewCategoryKey] = useState("");
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const groups = ["ALL", ...Array.from(new Set(catalog.map((c) => c.group)))];
  return (
    <section className="card admin-section">
      <h2>All public pages</h2>
      <p>
        Complete content control for Home, Results, Scorecards, Leaderboard,
        Concept, Brochure, Gallery, Student page, navbar and footer. Save
        changes using the button at the top.
      </p>
      <h3>Navigation bar</h3>
      <p>Change labels and links, hide items, or change their order.</p>
      {data.navigation.map((item, i) => (
        <div className="card" key={i}>
          <div className="form-grid">
            <label>
              Label
              <input
                value={item.label}
                onChange={(e) =>
                  change((d) => ({
                    ...d,
                    navigation: d.navigation.map((n, j) =>
                      j === i ? { ...n, label: e.target.value } : n,
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
                    navigation: d.navigation.map((n, j) =>
                      j === i ? { ...n, href: e.target.value } : n,
                    ),
                  }))
                }
              />
            </label>
          </div>
          <div className="button-row">
            <label>
              <input
                type="checkbox"
                style={{ width: 20 }}
                checked={item.visible}
                onChange={(e) =>
                  change((d) => ({
                    ...d,
                    navigation: d.navigation.map((n, j) =>
                      j === i ? { ...n, visible: e.target.checked } : n,
                    ),
                  }))
                }
              />{" "}
              Visible
            </label>
            <button
              type="button"
              className="btn outline small"
              disabled={i === 0}
              onClick={() =>
                change((d) => {
                  const navigation = [...d.navigation];
                  [navigation[i - 1], navigation[i]] = [
                    navigation[i],
                    navigation[i - 1],
                  ];
                  return { ...d, navigation };
                })
              }
            >
              Move up
            </button>
            <button
              type="button"
              className="btn outline small"
              onClick={() =>
                change((d) => ({
                  ...d,
                  navigation: d.navigation.filter((_, j) => j !== i),
                }))
              }
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn outline"
        disabled={data.navigation.length >= 20}
        onClick={() =>
          change((d) => ({
            ...d,
            navigation: [
              ...d.navigation,
              { label: "New link", href: "/", visible: true },
            ],
          }))
        }
      >
        Add navigation link
      </button>
      <h3>Category names</h3>
      <div className="form-grid">
        {Object.entries(zones).map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={data.categoryLabels[key] ?? label}
              onChange={(e) =>
                change((d) => ({
                  ...d,
                  categoryLabels: {
                    ...d.categoryLabels,
                    [key]: e.target.value,
                  },
                }))
              }
            />
          </label>
        ))}
      </div>
      <div className="card" style={{marginTop:12}}>
        <h4>Custom categories</h4>
        <p>Add categories for future events. Delete a custom category only after moving its events to another category.</p>
        <div className="form-grid">
          <label>Category key<input value={newCategoryKey} onChange={(e)=>setNewCategoryKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g,"_"))} placeholder="E.G. JUNIOR" maxLength={100}/></label>
          <label>Display name<input value={newCategoryLabel} onChange={(e)=>setNewCategoryLabel(e.target.value)} placeholder="Junior category" maxLength={100}/></label>
        </div>
        <button type="button" className="btn outline" disabled={!newCategoryKey.trim() || !newCategoryLabel.trim() || Boolean(data.categoryLabels[newCategoryKey]) || Boolean(zones[newCategoryKey])} onClick={()=>{change(d=>({...d,categoryLabels:{...d.categoryLabels,[newCategoryKey]:newCategoryLabel.trim()}}));setNewCategoryKey("");setNewCategoryLabel("");}}>Add category</button>
        <div className="grid3" style={{marginTop:12}}>{Object.entries(data.categoryLabels).filter(([key])=>!zones[key]).map(([key,label])=>{const used=data.events.some(event=>event.zone===key);return <div className="card" key={key}><strong>{label}</strong><small>{key}</small>{used&&<small className="muted">In use by an event. Move the event before deleting.</small>}<button type="button" className="btn outline small danger" disabled={used} onClick={()=>{if(confirm(`Delete category ${label}?`)) change(d=>({...d,categoryLabels:Object.fromEntries(Object.entries(d.categoryLabels).filter(([k])=>k!==key))}));}}>Delete category</button></div>})}</div>
      </div>
      <h3>Page text & images</h3>
      <div className="form-grid">
        <label>
          Page section
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            {groups.map((name) => (
              <option key={name} value={name}>
                {name === "ALL" ? "All pages" : name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Find text or image
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: Concept, brochure, footer…"
          />
        </label>
      </div>
      <div className="form-grid">
        {catalog
          .filter(
            (c) =>
              (group === "ALL" || c.group === group) &&
              (c.key + " " + c.group + " " + (data.content[c.key] || ""))
                .toLowerCase()
                .includes(query.toLowerCase()),
          )
          .map((c) => (
            <label key={c.key}>
              <small>{c.kind === "image" ? "Image URL" : c.group}</small>
              <span style={{ display: "block", overflowWrap: "anywhere" }}>
                {c.key.slice(0, 90)}
              </span>
              <textarea
                rows={c.key.length > 100 ? 4 : 2}
                value={
                  data.content[c.key] ??
                  (c.kind === "image" ? c.key.slice(6) : c.key)
                }
                onChange={(e) =>
                  change((d) => ({
                    ...d,
                    content: { ...d.content, [c.key]: e.target.value },
                  }))
                }
              />
            </label>
          ))}
      </div>
    </section>
  );
}
