import { useEffect } from "react";
import { useUmami } from "./use-umami";
import { ViewOnlySignature, MapperSignature, UmamiExtended } from "../types";

export function useUmamiView(viewDependencies: ReadonlyArray<Location["pathname"] | Location["search"] | unknown> = [], payload?: Parameters<ViewOnlySignature>[0] | Parameters<MapperSignature>[0]) {
  const { view } = useUmami();
  useEffect(() => {
    view(payload as UmamiExtended["view"]["arguments"]);
  }, [view, ...viewDependencies]);

  return null;
}
