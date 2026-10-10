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
    color = content[`color:${value}`];
  return active || color ? (
    <span
      className={active ? "visual-edit-target" : undefined}
      style={
        color
          ? { color, WebkitTextFillColor: color, background: "none" }
          : undefined
      }
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
      {shown}
    </span>
  ) : (
    <>{shown}</>
  );
}
export function SiteImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const content = useContext(Context),
    active = useVisualEditor();
  const key = "image:" + props.src;
  return (
    <img
      {...props}
      className={`${props.className || ""}${active ? " visual-edit-target" : ""}`}
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
