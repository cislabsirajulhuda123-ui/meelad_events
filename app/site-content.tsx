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
  const [preview, setPreview] = useState(value);
  useEffect(() => setPreview(value), [value]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.data?.type === "home-visual-preview" &&
        event.data.content &&
        typeof event.data.content === "object"
      )
        setPreview(event.data.content as Record<string, string>);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  return <Context.Provider value={preview}>{children}</Context.Provider>;
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
  event: ReactPointerEvent<HTMLElement>,
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
  const group = event.currentTarget.dataset.visualGroup;
  const members = group
    ? Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-visual-group="${group}"]`,
        ),
      )
    : [element];
  const memberStarts = members.map((member) => ({
    member,
    key: member.dataset.visualKey || key,
    x: Number(member.dataset.visualX || 0),
    y: Number(member.dataset.visualY || 0),
  }));
  const verticalGuide = document.createElement("div");
  const horizontalGuide = document.createElement("div");
  verticalGuide.className = "visual-alignment-guide vertical";
  horizontalGuide.className = "visual-alignment-guide horizontal";
  document.body.append(verticalGuide, horizontalGuide);
  element.setPointerCapture(event.pointerId);
  const move = (moveEvent: PointerEvent) => {
    latestX = Math.round(startX + moveEvent.clientX - originX);
    latestY = Math.round(startY + moveEvent.clientY - originY);
    element.style.position = "relative";
    element.style.left = `${latestX}px`;
    element.style.top = `${latestY}px`;
    const rect = element.getBoundingClientRect();
    const distanceX = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const distanceY = window.innerHeight / 2 - (rect.top + rect.height / 2);
    verticalGuide.classList.toggle("active", Math.abs(distanceX) <= 10);
    horizontalGuide.classList.toggle("active", Math.abs(distanceY) <= 10);
    if (Math.abs(distanceX) <= 10) {
      latestX += Math.round(distanceX);
      element.style.left = `${latestX}px`;
    }
    if (Math.abs(distanceY) <= 10) {
      latestY += Math.round(distanceY);
    }
    const deltaX = latestX - startX;
    const deltaY = latestY - startY;
    memberStarts.forEach(({ member, x, y }) => {
      member.style.position = "relative";
      member.style.left = `${x + deltaX}px`;
      member.style.top = `${y + deltaY}px`;
    });
  };
  const finish = () => {
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", finish);
    element.removeEventListener("pointercancel", finish);
    verticalGuide.remove();
    horizontalGuide.remove();
    window.parent.postMessage(
      {
        type: "home-visual-group-position",
        positions: memberStarts.map(({ member, key: memberKey }) => ({
          key: memberKey,
          x: Number.parseFloat(member.style.left) || 0,
          y: Number.parseFloat(member.style.top) || 0,
        })),
      },
      window.location.origin,
    );
    select(key);
  };
  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", finish);
  element.addEventListener("pointercancel", finish);
}
export function SiteText({
  value,
  locked = false,
}: {
  value: string;
  locked?: boolean;
}) {
  const content = useContext(Context),
    active = useVisualEditor();
  const positionLocked = locked || content[`locked:${value}`] === "1";
  const visualGroup = content[`group:${value}`] || "";
  const shown = content[value] ?? value,
    color = content[`color:${value}`],
    fontSize = Number(content[`font-size:${value}`] || 0),
    hidden = content[`hidden:${value}`] === "1",
    x = locked ? 0 : Number(content[`position-x:${value}`] || 0),
    y = locked ? 0 : Number(content[`position-y:${value}`] || 0);
  if (hidden && !active) return null;
  return active || color || fontSize || x || y || hidden ? (
    <span
      data-visual-key={value}
      data-visual-group={visualGroup || undefined}
      data-visual-x={x}
      data-visual-y={y}
      className={`${active ? "visual-edit-target" : ""}${hidden ? " visual-edit-hidden" : ""}`}
      style={{
        ...(color
          ? { color, WebkitTextFillColor: color, background: "none" }
          : {}),
        ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
        ...(x || y
          ? { position: "relative", left: `${x}px`, top: `${y}px` }
          : {}),
      }}
      title={
        active
          ? positionLocked
            ? "Click to edit · Position locked"
            : "Drag to move · Click to edit"
          : undefined
      }
      onPointerDown={
        active && !positionLocked
          ? (event) => startDrag(event, value, x, y)
          : undefined
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
  const positionLocked = content[`locked:${key}`] === "1",
    visualGroup = content[`group:${key}`] || "",
    hidden = content[`hidden:${key}`] === "1",
    x = Number(content[`position-x:${key}`] || 0),
    y = Number(content[`position-y:${key}`] || 0);
  if (hidden && !active) return null;
  return (
    <img
      {...props}
      data-visual-key={key}
      data-visual-group={visualGroup || undefined}
      data-visual-x={x}
      data-visual-y={y}
      className={`${props.className || ""}${active ? " visual-edit-target" : ""}${hidden ? " visual-edit-hidden" : ""}`}
      style={{
        ...props.style,
        ...(x || y
          ? { position: "relative", left: `${x}px`, top: `${y}px` }
          : {}),
      }}
      title={
        active
          ? positionLocked
            ? "Click to edit · Position locked"
            : "Drag to move · Click to edit"
          : props.title
      }
      onPointerDown={
        active && !positionLocked
          ? (event) => startDrag(event, key, x, y)
          : props.onPointerDown
      }
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
