/* The four faces of the page (README › Design tokens), self-hosted through next/font. Each sets a CSS variable that the tokens in globals.css read. */
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif, Schibsted_Grotesk } from "next/font/google";

/** The display face, as --fd. */
export const instrumentSerif = Instrument_Serif({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-instrument-serif" });
/** The body face, as --fb. */
export const plexSans = IBM_Plex_Sans({ weight: ["400", "500", "600"], subsets: ["latin"], display: "swap", variable: "--font-plex-sans" });
/** Small labels, as --fm. */
export const plexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], display: "swap", variable: "--font-plex-mono" });
/** The main face, as --fs. */
export const schibsted = Schibsted_Grotesk({ weight: ["400", "500", "600"], subsets: ["latin"], display: "swap", variable: "--font-schibsted" });

export const fontClassName = [instrumentSerif, plexSans, plexMono, schibsted].map((f) => f.variable).join(" ");
