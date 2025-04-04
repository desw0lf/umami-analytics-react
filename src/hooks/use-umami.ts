import { useContext } from "react";
import { UmamiProviderContext } from "../provider/context";

export const useUmami = () => {
  const context = useContext(UmamiProviderContext);

  if (context === undefined) {
    throw new Error("useUmami must be used within a UmamiProvider");
  }

  return context;
};
