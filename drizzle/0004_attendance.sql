CREATE TABLE IF NOT EXISTS event_attendance (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  registration_id TEXT NOT NULL,
  chest TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  team_id TEXT NOT NULL,
  marked_at TEXT NOT NULL,
  marked_by TEXT NOT NULL,
  UNIQUE(event_id, registration_id)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS event_attendance_event_idx ON event_attendance(event_id);
