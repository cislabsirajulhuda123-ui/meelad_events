"use client";
import { useEffect } from "react";

export default function BrowserTitleSync() {
  useEffect(() => {
    let active = true;
    const update = async () => {
      try {
        const response = await fetch("/api/festival", { cache: "no-store" });
        const json = (await response.json()) as {
          data?: {
            settings?: { name?: string };
            content?: Record<string, string>;
          };
        };
        const title =
          json.data?.content?.["browser-title"] || json.data?.settings?.name;
        if (active && title) document.title = title;
      } catch {}
    };
    void update();
    const onFocus = () => void update();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const timer = window.setInterval(update, 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);
  return null;
}
