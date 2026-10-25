/* "Not an owner yet?" (v5's 07 panel): whether it is open, shared by the dome's button, the panel and the motion engine.
   It is React state in v5 (ownerModal); here it is a small external store, so the button inside the stage, the panel outside it and the engine all read the same value.
   The engine closes it when 06 leaves the screen and lays the panel and the button's copy over the dome's button (v5 placeOwner) through `place`. */

type Listener = () => void;
const listeners = new Set<Listener>();
let open = false;

export const ownerStore = {
  get: (): boolean => open,
  subscribe(l: Listener): () => void { listeners.add(l); return () => { listeners.delete(l); }; },
  set(v: boolean): void { if (open === v) return; open = v; listeners.forEach((l) => l()); },
  /** The engine closes it from inside its frame (06 leaving the screen). As in v5, where this is a state change made inside a frame: the value changes at once, so the
   *  rest of the frame sees it closed, and the page re-renders in a task after that frame has painted (v5's React schedules it so), one frame later than a click. */
  closeFromFrame(): void {
    if (!open) return; open = false;
    const ch = new MessageChannel(); ch.port1.onmessage = () => { ch.port1.close(); listeners.forEach((l) => l()); }; ch.port2.postMessage(0);
  },
  /** Set by the engine: centres the panel on the dome's button, its foot 14px above it, and lays the button's copy exactly over the real one. */
  place: (): void => {},
};

/** v5 plusOn: a link's plus parts into an H on hover; while the panel is open only the panel's own link does. */
export function plusOn(el: HTMLElement): void {
  if (ownerStore.get() && !(el.closest && el.closest("[data-m7]"))) return;
  el.querySelectorAll<HTMLElement>("[data-pl]").forEach((s) => { s.style.transform = "translateX(-" + (s.dataset.d || "5.2") + "px)"; });
  el.querySelectorAll<HTMLElement>("[data-pr]").forEach((s) => { s.style.transform = "translateX(" + (s.dataset.d || "5.2") + "px)"; });
}
/** v5 plusOff: the plus closes again. */
export function plusOff(el: HTMLElement): void {
  el.querySelectorAll<HTMLElement>("[data-pl],[data-pr]").forEach((s) => { s.style.transform = "none"; });
}
