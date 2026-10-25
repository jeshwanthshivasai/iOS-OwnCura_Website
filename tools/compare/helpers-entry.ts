/* Bundled by tools/compare/helpers.mjs: exposes the ported WebGL helpers to the comparison page as window.OCX. */
import { MeshGradient } from "../../lib/gl/mesh-gradient";
import { DotField } from "../../lib/gl/dot-field";

declare global {
  interface Window { OCX: { MeshGradient: typeof MeshGradient; DotField: typeof DotField } }
}
window.OCX = { MeshGradient, DotField };
