import { DM_Serif_Display, Inter } from "next/font/google";

// Typography matches the Annuity Gator funnel (quiz.annuitygator.com) so the booking
// step reads as a continuation of it: Inter for body copy, DM Serif Display for headings.
// Both route-group layouts import these instances so next/font emits a single font file each.
export const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: true,
  display: "swap",
});

export const headingFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cal",
  preload: true,
  display: "swap",
});
