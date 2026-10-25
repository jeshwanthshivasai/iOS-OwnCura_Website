/* The values the designer fixed at build (README › Settings fixed at build). v5 kept 51 switches; only the chosen value of each is built, and these are the ones the code reads as numbers or colours.
   Switches that are simply on or off are built or not built; choices between variants (t45 A, t56 A, the glass-bar nav, the flush numeral, the living 4, the 7a footer) are the only path in the code. */

// Hero gradient: intensity over the grey base, speed, scale; the four colours with the warm tint on
export const HERO_GRADIENT = 0.8;
export const GRADIENT_SPEED = 1.2;
export const GRADIENT_SCALE = 2.2;
export const GRADIENT_COLORS: [string, string, string, string] = ["#2E6CB8", "#34B3A5", "#BFD9F0", "#E9E2D3"];

// Hero lines, in vh: "The ownership infrastructure for" (Schibsted Grotesk 600, letter-spacing -0.03em: v5's line1Font face) and "American healthcare practices." on the crossbar in the h1's own face; line one sits this far from the bottom
export const LINE1_SIZE = 10.2;
export const LINE2_SIZE = 9.4;
export const LINE1_LIFT = 60.5;

// The earth: where the globe section rests and starts (vh), its halo, zoom, the horizon glow (strength, height in vh), the sphere's water opacity, and how it grows (a scale) and drops (vh) as the hero leaves
export const GLOBE_TOP = 36;
export const GLOBE_START_TOP = 24;
export const GLOBE_HALO = 0;
export const GLOBE_ZOOM = 3.7;
export const HALO_STRENGTH = 0.8;
export const HALO_HEIGHT = 60;
export const SPHERE_OPACITY = 0.2;
export const EXIT_GROW = 1.05;
export const EXIT_DROP = 5;

// 04: the numeral's gradient at full strength
export const FOUR_STRENGTH = 1;
