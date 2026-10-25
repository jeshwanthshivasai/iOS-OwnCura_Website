/* The earth: MapLibre and the packed map load on demand, started as soon as the page opens so they are in before the intro reveals the globe. */
export type { Globe } from "./globe";

let loading: Promise<typeof import("./globe")> | null = null;

/** Starts (once) fetching MapLibre and the globe's data; resolves to the globe module with its assets ready. */
export function loadGlobe(): Promise<typeof import("./globe")> {
  if (!loading) loading = import("./globe").then(async (m) => { await m.preload(); return m; });
  return loading;
}
