import { useEffect, useRef, useCallback } from "react";
import { UmamiProviderContext } from "./context";
import { createScript } from "../utils/create-script";
import { tryUmami } from "../utils/try-umami";
import type { EnhancedIdentifyPayload, Umami, UmamiExtended, UmamiPayload, UmamiRegisterConfig } from "../types";

type UmamiProviderProps = {
  children: React.ReactNode;
  autoLoad?: boolean;
} & UmamiRegisterConfig;

export function UmamiProvider({
  children,
  websiteId,
  autoLoad = true,
  scriptSrc = "https://cloud.umami.is/script.js",
  scriptAttributes = {},
}: UmamiProviderProps) {
  const umami = useRef<Umami | null>(null);
  const eventQueue = useRef<Array<{ eventName: keyof Umami; args: any[] }>>([]);

  const flushQueue = useCallback(() => {
    if (!umami.current) return;
    eventQueue.current.forEach(({ eventName, args }) => {
      tryUmami(umami, eventName, args);
    });
    eventQueue.current = [];
  }, []);

  const onScriptLoad = useCallback(
    (_event: Event) => {
      umami.current = (window as any).umami;
      flushQueue();
    },
    [flushQueue]
  );
  const register = useCallback(
    (props: Partial<UmamiRegisterConfig> = {}) => {
      if (umami.current) {
        console.warn("Umami Provider: Script already loaded");
        return;
      }
      const attrs = {
        ...(props.scriptAttributes || scriptAttributes),
        "data-website-id": props.websiteId || websiteId,
        // "data-auto-track": false,
        async: true,
        defer: true,
        onload: onScriptLoad,
      };
      if (!attrs["data-website-id"]) {
        console.error("Umami Provider: No websiteId provided");
        return;
      }
      const script = createScript(props.scriptSrc || scriptSrc, attrs);
      document.head.appendChild(script);
    },
    [onScriptLoad, websiteId, scriptSrc, scriptAttributes]
  );

  useEffect(() => {
    if (!autoLoad || umami.current) return;
    register();
  }, [register, autoLoad]);

  const onUmamiInvoke = useCallback((eventName: keyof Umami, args: any[]) => {
    const isSuccess = tryUmami(umami, eventName, args);
    if (isSuccess) {
      return;
    }
    eventQueue.current.push({ eventName: eventName, args });
  }, []);

  const track: UmamiExtended["track"] = useCallback((...args: any[]) => onUmamiInvoke("track", args), [onUmamiInvoke]);

  const identify: UmamiExtended["identify"] = useCallback((...args: any[]) => onUmamiInvoke("identify", args), [onUmamiInvoke]);

  const view: UmamiExtended["view"] = useCallback((...args: any[]) => onUmamiInvoke("track", args), [onUmamiInvoke]);

  return (
    <UmamiProviderContext.Provider
      value={{
        register,
        umamiRef: umami,
        track,
        identify,
        view,
      }}>
      {children}
    </UmamiProviderContext.Provider>
  );
}
