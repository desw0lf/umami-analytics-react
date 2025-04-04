import { createContext, type MutableRefObject } from "react";
import type { Umami, UmamiExtended, UmamiRegisterConfig } from "../types";

type UmamiProviderState = {
  umamiRef: MutableRefObject<Umami | null>;
  register: (config?: Partial<UmamiRegisterConfig>) => void;
  track: UmamiExtended["track"];
  identify: UmamiExtended["identify"];
  view: UmamiExtended["view"];
};

const initialState = {
  umamiRef: null!,
  register: () => null,
  track: () => null,
  identify: () => null,
  view: () => null,
};

export const UmamiProviderContext = createContext<UmamiProviderState>(initialState);
