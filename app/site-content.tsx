"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ImgHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
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
function startDrag(
  event: ReactPointerEvent<HTMLSpanElement>,
  key: string,
  startX: number,
  startY: number,
) {
  event.preventDefault();
  event.stopPropagation();
  const element = event.currentTarget;
  const originX = event.clientX;
  const originY = event.clientY;
  let latestX = startX;
  let latestY = startY;
  element.setPointerCapture(event.pointerId);
  const move = (moveEvent: PointerEvent) => {
    latestX = Math.round(startX + moveEvent.clientX - originX);
    latestY = Math.round(startY + moveEvent.clientY - originY);
    element.style.position = "relative";
    element.style.left = `${latestX}px`;
    element.style.top = `${latestY}px`;
  };
  const finish = () => {
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", finish);
    element.removeEventListener("pointercancel", finish);
    window.parent.postMessage(
      { type: "home-visual-position", key, x: latestX, y: latestY },
      window.location.origin,
    );
    select(key);
  };
  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", finish);
  element.addEventListener("pointercancel", finish);
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
      title={active ? "Drag to move · Click to edit" : undefined}
      onPointerDown={
        active ? (event) => startDrag(event, value, x, y) : undefined
      }
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
