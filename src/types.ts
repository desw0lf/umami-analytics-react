export interface UmamiRegisterConfig {
  websiteId: string;
  scriptSrc?: string;
  scriptAttributes?: Record<string, string | number | boolean | undefined | null>;
}

// https://umami.is/docs/tracker-functions

type UmamiPayload<T = any> = Record<string, T>;

type SimplePayloadSignature = <T>(payload: UmamiPayload<T>) => void; // object (view, identify event)
type TrackOnlySignature = <T>(eventName?: string, payload?: UmamiPayload<T>) => void;
export type ViewOnlySignature = <T>(payload?: UmamiPayload<T>) => void;

export type MapperSignature = <T>(mapper: (props: Record<string, any>) => UmamiPayload<T>) => void;

export interface Umami {
  identify: SimplePayloadSignature;
  track: SimplePayloadSignature & TrackOnlySignature & MapperSignature;
}

export interface UmamiExtended extends Umami {
  identify: <T>(
    payload: UmamiPayload<T>,
    appendEnhancedPayload?: boolean | null | (keyof EnhancedIdentifyPayload)[]
  ) => void;
  view: ViewOnlySignature & MapperSignature; // 0 to 1 args
}

export interface EnhancedIdentifyPayload {
  timezone: string;
  timezoneOffset: number;
  ect: string;
  systemTheme: string;
  prefersReducedMotion: boolean;
  isTouchDevice: boolean;
  zoomLevel: number;
}
