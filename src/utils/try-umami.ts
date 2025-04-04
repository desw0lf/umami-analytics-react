import type { MutableRefObject } from "react";
import type { Umami } from "../types";

export function tryUmami(umami: MutableRefObject<Umami | null>, eventName: keyof Umami, args: any[]) {
  if (!umami.current) return false;
  const fn = umami.current[eventName] as (...args: any[]) => void;
  if (typeof fn === "function") {
    fn(...args);
    return true;
  }
  return false;
}
