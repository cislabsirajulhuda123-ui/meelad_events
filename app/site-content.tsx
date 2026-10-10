"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
const Context = createContext<Record<string, string>>({});
export function ContentProvider({
  value,
  children,
}: {
  value: Record<string, string>;
  children: ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
function useVisualEditor() {
  const [active, setActive] = useState(false);
  useEffect(
    () =>
      setActive(
        new URLSearchParams(window.location.search).get("visualEdit") === "1",
      ),
    [],
  );
  return active;
}
function select(key: string) {
  window.parent.postMessage(
    { type: "home-visual-edit", key },
    window.location.origin,
  );
}
export function SiteText({ value }: { value: string }) {
  const content = useContext(Context),
    active = useVisualEditor();
  const shown = content[value] ?? value,
    color = content[`color:${value}`],
    hidden = content[`hidden:${value}`] === "1",
    x = Number(content[`position-x:${value}`] || 0),
    y = Number(content[`position-y:${value}`] || 0);
  if (hidden && !active) return null;
  return active || color || x || y || hidden ? (
    <span
      className={`${active ? "visual-edit-target" : ""}${hidden ? " visual-edit-hidden" : ""}`}
      style={{
        ...(color
          ? { color, WebkitTextFillColor: color, background: "none" }
          : {}),
        ...(x || y
          ? { position: "relative", left: `${x}px`, top: `${y}px` }
          : {}),
      }}
      title={active ? "Click to edit" : undefined}
      onClick={
        active
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              select(value);
            }
          : undefined
      }
    >
      {hidden && active ? `[Hidden] ${shown}` : shown}
    </span>
  ) : (
    <>{shown}</>
  );
}
export function SiteImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const content = useContext(Context),
    active = useVisualEditor();
  const key = "image:" + props.src;
  const hidden = content[`hidden:${key}`] === "1",
    x = Number(content[`position-x:${key}`] || 0),
    y = Number(content[`position-y:${key}`] || 0);
  if (hidden && !active) return null;
  return (
    <img
      {...props}
      className={`${props.className || ""}${active ? " visual-edit-target" : ""}${hidden ? " visual-edit-hidden" : ""}`}
      style={{
        ...props.style,
        ...(x || y
          ? { position: "relative", left: `${x}px`, top: `${y}px` }
          : {}),
      }}
      onClick={
        active
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              select(key);
            }
          : props.onClick
      }
      src={content[key] || props.src}
    />
  );
}
