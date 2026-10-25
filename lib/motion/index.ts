import { Engine } from "./engine";

export { Engine } from "./engine";
export { SmoothScroll } from "./smooth-scroll";
export * from "./math";

/** Starts the motion engine on the page's root element. Returns the function that stops it. */
export function mountMotion(root: HTMLElement): () => void {
  const engine = new Engine(root);
  engine.start();
  return () => engine.destroy();
}
